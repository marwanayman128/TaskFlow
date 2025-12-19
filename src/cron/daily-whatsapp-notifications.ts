/**
 * Daily WhatsApp Notifications Cron Job
 * 
 * This job runs once daily (preferably in the morning) to send WhatsApp notifications
 * for tasks that have reminders set for that day, including recurring tasks.
 * 
 * Usage:
 * - For Vercel Cron: Add to vercel.json crons configuration with schedule "0 8 * * *"
 * - For standalone: Run with node-cron at desired time
 */

import { prisma } from '@/lib/prisma';
import { WhatsAppClientManager } from '@/lib/whatsapp-client';
import { format, startOfDay, endOfDay, isToday } from 'date-fns';

// Helper function to send WhatsApp notification
async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<boolean> {
  try {
    return await WhatsAppClientManager.sendMessage(phone, message);
  } catch (error) {
    console.error('[WhatsApp Daily] Failed to send message:', error);
    return false;
  }
}

// Build daily summary message
function buildDailySummaryMessage(
  userName: string,
  tasks: Array<{
    title: string;
    dueDate?: Date | null;
    priority: string;
    location?: string | null;
  }>
): string {
  const today = format(new Date(), 'EEEE, MMMM d');
  
  let message = `🌅 *Good Morning, ${userName}!*\n\n`;
  message += `📅 *Your tasks for ${today}*\n\n`;

  if (tasks.length === 0) {
    message += `_No tasks scheduled for today. Enjoy your day!_ ✨\n`;
  } else {
    tasks.forEach((task, index) => {
      const priorityEmoji = {
        'HIGH': '🔴',
        'MEDIUM': '🟡',
        'LOW': '🟢',
        'NONE': '⚪',
      }[task.priority] || '⚪';

      message += `${index + 1}. ${priorityEmoji} *${task.title}*\n`;
      
      if (task.dueDate) {
        message += `   ⏰ ${format(new Date(task.dueDate), 'h:mm a')}\n`;
      }
      
      if (task.location) {
        message += `   📍 ${task.location}\n`;
      }
      
      message += '\n';
    });

    const highPriority = tasks.filter(t => t.priority === 'HIGH').length;
    if (highPriority > 0) {
      message += `⚠️ *${highPriority} high priority task${highPriority > 1 ? 's' : ''}*\n\n`;
    }
  }

  message += `_Have a productive day! 💪_\n`;
  message += `_Powered by TaskFlow_`;

  return message;
}

export async function sendDailyNotifications() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  console.log(`[WhatsApp Daily] Starting daily notifications for ${format(now, 'yyyy-MM-dd')}`);

  try {
    // Get all active WhatsApp integrations
    const whatsappIntegrations = await prisma.userIntegration.findMany({
      where: {
        provider: 'whatsapp',
        isActive: true,
        externalId: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    console.log(`[WhatsApp Daily] Found ${whatsappIntegrations.length} active WhatsApp integrations`);

    let notificationsSent = 0;

    for (const integration of whatsappIntegrations) {
      if (!integration.externalId || !integration.user) continue;

      const recipientPhone = integration.externalId;
      const userName = integration.user.fullName || integration.user.email?.split('@')[0] || 'there';

      // Get tasks for today for this user
      const todayTasks = await prisma.task.findMany({
        where: {
          createdById: integration.userId,
          deletedAt: null,
          status: { not: 'COMPLETED' },
          OR: [
            // Tasks due today
            {
              dueDate: {
                gte: todayStart,
                lte: todayEnd,
              },
            },
            // Tasks with reminders today
            {
              reminders: {
                some: {
                  remindAt: {
                    gte: todayStart,
                    lte: todayEnd,
                  },
                  isTriggered: false,
                },
              },
            },
            // Recurring tasks (check if due today based on recurrence rule)
            {
              isRecurring: true,
              recurrenceRule: { not: null },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          priority: true,
          isRecurring: true,
          recurrenceRule: true,
          reminders: {
            where: {
              type: 'LOCATION',
            },
            select: {
              location: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
        ],
      });

      // Filter recurring tasks that are actually due today
      const tasksForToday = todayTasks.filter(task => {
        // Non-recurring tasks are already filtered by query
        if (!task.isRecurring) return true;
        
        // For recurring tasks, check if they should run today
        // (Simple check - in production you'd parse the RRULE)
        if (task.dueDate && isToday(new Date(task.dueDate))) {
          return true;
        }
        
        // Include all recurring tasks for daily summary
        return true;
      });

      if (tasksForToday.length > 0) {
        // Format tasks for the message
        const formattedTasks = tasksForToday.map(task => ({
          title: task.title,
          dueDate: task.dueDate,
          priority: task.priority,
          location: task.reminders?.[0]?.location || null,
        }));

        // Send daily summary
        const summaryMessage = buildDailySummaryMessage(userName, formattedTasks);
        const sent = await sendWhatsAppMessage(recipientPhone, summaryMessage);

        if (sent) {
          notificationsSent++;
          console.log(`[WhatsApp Daily] Sent daily summary to ${recipientPhone} (${formattedTasks.length} tasks)`);
        }
      }
    }

    console.log(`[WhatsApp Daily] Completed. Sent ${notificationsSent} notifications.`);
    return { sent: notificationsSent, total: whatsappIntegrations.length };
  } catch (error) {
    console.error('[WhatsApp Daily] Error sending daily notifications:', error);
    throw error;
  }
}

// API Route handler for Vercel Cron or manual triggering
export async function GET() {
  try {
    const result = await sendDailyNotifications();
    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error('Daily WhatsApp notifications error:', error);
    return Response.json(
      { success: false, error: 'Failed to send daily notifications' },
      { status: 500 }
    );
  }
}

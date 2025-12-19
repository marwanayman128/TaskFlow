/**
 * Reminder Processor Cron Job
 * 
 * This job runs every minute to check for task reminders that need to be triggered.
 * In a production environment, this would typically be run via a serverless cron
 * (e.g., Vercel Cron) or a separate worker process.
 * 
 * Usage:
 * - For Vercel Cron: Add to vercel.json crons configuration
 * - For standalone: Run with node-cron or similar scheduler
 */

import { prisma } from '@/lib/prisma';
import { WhatsAppClientManager } from '@/lib/whatsapp-client';
import { format } from 'date-fns';

// Helper function to send WhatsApp notification
async function sendWhatsAppNotification(
  taskTitle: string,
  dueDate?: Date | null,
  location?: string | null,
  recipientPhone?: string | null
): Promise<boolean> {
  if (!recipientPhone) return false;
  
  try {
    // Build the message
    let message = `📋 *Task Reminder*\n\n`;
    message += `*Task:* ${taskTitle}\n`;
    
    if (dueDate) {
      message += `*Due:* ${format(new Date(dueDate), 'MMM d, yyyy h:mm a')}\n`;
    }
    
    if (location) {
      message += `*Location:* ${location}\n`;
    }
    
    message += `\n_Stay productive with TaskFlow!_ ✨`;
    
    return await WhatsAppClientManager.sendMessage(recipientPhone, message);
  } catch (error) {
    console.error('[WhatsApp] Failed to send reminder notification:', error);
    return false;
  }
}

export async function processReminders() {
  const now = new Date();
  
  try {
    // Find all reminders that are due and haven't been triggered
    const dueReminders = await prisma.taskReminder.findMany({
      where: {
        type: 'TIME',
        remindAt: {
          lte: now,
        },
        isTriggered: false,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
            createdById: true,
            organizationId: true,
          },
        },
      },
    });

    console.log(`[Reminder Processor] Found ${dueReminders.length} due reminders`);

    // Get WhatsApp integration settings for all unique users
    const userIds = [...new Set(dueReminders.map(r => r.userId))];
    const whatsappIntegrations = await prisma.userIntegration.findMany({
      where: {
        provider: 'whatsapp',
        isActive: true,
        userId: { in: userIds },
      },
      select: {
        userId: true,
        externalId: true, // This stores the recipient phone number
      },
    });
    
    // Create a map for quick lookup
    const whatsappByUser = new Map(
      whatsappIntegrations.map(i => [i.userId, i.externalId])
    );

    for (const reminder of dueReminders) {
      // Skip if task is already completed
      if (reminder.task.status === 'COMPLETED' || reminder.task.status === 'CANCELLED') {
        await prisma.taskReminder.update({
          where: { id: reminder.id },
          data: { isTriggered: true, triggeredAt: now },
        });
        continue;
      }

      // Create a notification for the reminder
      await prisma.notification.create({
        data: {
          userId: reminder.userId,
          type: 'INFO',
          title: 'Task Reminder',
          message: `Reminder: ${reminder.task.title}`,
          link: `/dashboard/tasks/${reminder.task.id}`,
        },
      });

      // Send WhatsApp notification if user has connected WhatsApp
      const recipientPhone = whatsappByUser.get(reminder.userId);
      if (recipientPhone) {
        const whatsappSent = await sendWhatsAppNotification(
          reminder.task.title,
          reminder.task.dueDate,
          (reminder as any).location || null,
          recipientPhone
        );
        if (whatsappSent) {
          console.log(`[Reminder Processor] WhatsApp notification sent for task: ${reminder.task.title}`);
        }
      }

      // Mark reminder as triggered
      await prisma.taskReminder.update({
        where: { id: reminder.id },
        data: {
          isTriggered: true,
          triggeredAt: now,
        },
      });

      console.log(`[Reminder Processor] Triggered reminder for task: ${reminder.task.title}`);
    }

    return { processed: dueReminders.length };
  } catch (error) {
    console.error('[Reminder Processor] Error processing reminders:', error);
    throw error;
  }
}

// API Route handler for Vercel Cron or manual triggering
export async function GET() {
  try {
    const result = await processReminders();
    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error('Reminder processor error:', error);
    return Response.json(
      { success: false, error: 'Failed to process reminders' },
      { status: 500 }
    );
  }
}

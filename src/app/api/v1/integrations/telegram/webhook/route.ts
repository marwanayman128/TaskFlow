import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TelegramService } from '@/services/notification.service';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      type: string;
    };
    date: number;
    text?: string;
  };
}

// POST /api/v1/integrations/telegram/webhook - Telegram bot webhook
export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();
    
    // Only handle messages
    if (!update.message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = update.message.chat.id.toString();
    const text = update.message.text;
    const firstName = update.message.from.first_name;

    // Handle /start command
    if (text.startsWith('/start')) {
      // Extract user ID if provided (e.g., /start userId123)
      const parts = text.split(' ');
      const userRef = parts[1];

      let responseMessage = `👋 Welcome to TaskFlow Bot, ${firstName}!\n\n`;
      responseMessage += `Your Chat ID is: \`${chatId}\`\n\n`;
      responseMessage += `To receive task notifications, copy this ID and paste it in the `;
      responseMessage += `TaskFlow app settings.\n\n`;
      responseMessage += `📋 Available commands:\n`;
      responseMessage += `/start - Show this welcome message\n`;
      responseMessage += `/tasks - View your tasks for today\n`;
      responseMessage += `/help - Get help`;

      await TelegramService.sendMessage(chatId, responseMessage, 'Markdown');

      // If user reference provided, try to auto-link
      if (userRef) {
        try {
          // Look for a pending integration request
          const pendingIntegration = await prisma.userIntegration.findFirst({
            where: {
              provider: 'telegram',
              externalId: userRef,
              isActive: false, // Pending connection
            },
          });

          if (pendingIntegration) {
            await prisma.userIntegration.update({
              where: { id: pendingIntegration.id },
              data: {
                externalId: chatId,
                isActive: true,
                connectedAt: new Date(),
                metadata: {
                  username: update.message.from.username,
                  firstName: update.message.from.first_name,
                  lastName: update.message.from.last_name,
                },
              },
            });

            await TelegramService.sendMessage(
              chatId,
              `✅ Your account has been connected successfully!\n\nYou will now receive task notifications here.`,
              'Markdown'
            );
          }
        } catch (e) {
          console.error('Error auto-linking Telegram:', e);
        }
      }
    }

    // Handle /tasks command
    else if (text === '/tasks') {
      // Find user by chat ID
      const integration = await prisma.userIntegration.findFirst({
        where: {
          provider: 'telegram',
          externalId: chatId,
          isActive: true,
        },
      });

      if (!integration) {
        await TelegramService.sendMessage(
          chatId,
          `⚠️ Your Telegram is not connected to TaskFlow.\n\nPlease connect it in the TaskFlow app settings first.`,
          'Markdown'
        );
        return NextResponse.json({ ok: true });
      }

      // Get user's tasks for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tasks = await prisma.task.findMany({
        where: {
          createdById: integration.userId,
          deletedAt: null,
          status: { not: 'COMPLETED' },
          OR: [
            { dueDate: { gte: today, lt: tomorrow } },
            { isMyDay: true },
          ],
        },
        orderBy: { position: 'asc' },
        take: 10,
      });

      if (tasks.length === 0) {
        await TelegramService.sendMessage(
          chatId,
          `🎉 You have no tasks for today!\n\nEnjoy your free time or add new tasks in the TaskFlow app.`,
          'Markdown'
        );
      } else {
        let message = `📋 <b>Your Tasks for Today</b>\n\n`;
        tasks.forEach((task, index) => {
          const priority = task.priority === 'HIGH' ? '🔴' : task.priority === 'MEDIUM' ? '🟡' : '⚪';
          message += `${index + 1}. ${priority} ${task.title}\n`;
        });
        message += `\n<i>Total: ${tasks.length} task(s)</i>`;

        await TelegramService.sendMessage(chatId, message, 'HTML');
      }
    }

    // Handle /help command
    else if (text === '/help') {
      let message = `📖 <b>TaskFlow Bot Help</b>\n\n`;
      message += `<b>Commands:</b>\n`;
      message += `/start - Welcome message and Chat ID\n`;
      message += `/tasks - View your tasks for today\n`;
      message += `/help - This help message\n\n`;
      message += `<b>Notifications:</b>\n`;
      message += `You will automatically receive notifications for:\n`;
      message += `• Task reminders\n`;
      message += `• Task assignments\n`;
      message += `• Comments on your tasks\n\n`;
      message += `<b>Need more help?</b>\n`;
      message += `Visit our support page at taskflow.app/help`;

      await TelegramService.sendMessage(chatId, message, 'HTML');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to prevent retries
  }
}

// GET - Verify webhook (for Telegram webhook setup)
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Telegram webhook is active',
  });
}

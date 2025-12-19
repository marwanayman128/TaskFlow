/**
 * Notification Service
 * 
 * Handles sending notifications via multiple channels:
 * - WhatsApp (via Twilio)
 * - Telegram
 * - Email (existing)
 * - Push notifications (future)
 */

import { INTEGRATIONS } from '@/lib/config';

// Types
export interface NotificationPayload {
  userId: string;
  type: 'REMINDER' | 'DUE_DATE' | 'MENTION' | 'COMMENT' | 'ASSIGNMENT';
  title: string;
  message: string;
  taskId?: string;
  taskTitle?: string;
  dueDate?: Date;
  link?: string;
}

export interface UserNotificationPreferences {
  whatsapp?: {
    enabled: boolean;
    phoneNumber: string;
  };
  telegram?: {
    enabled: boolean;
    chatId: string;
  };
  email?: {
    enabled: boolean;
  };
}

import { WhatsAppClientManager } from '@/lib/whatsapp-client';

// ... (existing imports)

// WhatsApp Service (Multi-Provider)
export class WhatsAppService {
  private static apiKey = INTEGRATIONS.SENDZEN_API_KEY;
  private static fromNumber = INTEGRATIONS.SENDZEN_FROM_NUMBER;

  static isConfigured(): boolean {
    // Check if Self-Hosted is connected OR SendZen is configured
    return (WhatsAppClientManager.getStatus() === 'CONNECTED') || !!(this.apiKey && this.fromNumber);
  }

  static async sendMessage(to: string, message: string): Promise<boolean> {
    // 1. Try Self-Hosted WhatsApp Web first
    if (WhatsAppClientManager.getStatus() === 'CONNECTED') {
      console.log('[WhatsAppService] Sending via Self-Hosted Client');
      return await WhatsAppClientManager.sendMessage(to, message);
    }

    // 2. Fallback to SendZen
    if (!this.apiKey || !this.fromNumber) {
      console.warn('WhatsApp not configured (neither Self-Hosted nor SendZen)');
      return false;
    }

    try {
      console.log('[WhatsAppService] Sending via SendZen');
      const url = 'https://api.sendzen.io/v1/messages';
      
      // Clean up numbers (remove + or whatsapp: prefix if present, SendZen seems to want plain digits)
      const cleanFrom = this.fromNumber.replace(/\D/g, '');
      const cleanTo = to.replace(/\D/g, '');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: cleanFrom,
          to: cleanTo,
          type: 'text',
          text: {
            body: message
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SendZen send error:', errorText);
        return false;
      }

      const result = await response.json();
      console.log('SendZen success:', result);
      return true;
    } catch (error) {
      console.error('WhatsApp service error:', error);
      return false;
    }
  }

  static formatReminderMessage(payload: NotificationPayload): string {
    let message = `🔔 *${payload.title}*\n\n`;
    message += payload.message;
    
    if (payload.taskTitle) {
      message += `\n\n📋 Task: ${payload.taskTitle}`;
    }
    
    if (payload.dueDate) {
      message += `\n⏰ Due: ${payload.dueDate.toLocaleDateString()} at ${payload.dueDate.toLocaleTimeString()}`;
    }
    
    if (payload.link) {
      message += `\n\n🔗 ${payload.link}`;
    }
    
    return message;
  }
}

// Telegram Service
export class TelegramService {
  private static botToken = INTEGRATIONS.TELEGRAM_BOT_TOKEN;
  private static apiUrl = 'https://api.telegram.org';

  static isConfigured(): boolean {
    return !!this.botToken;
  }

  static async sendMessage(chatId: string, message: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Telegram not configured');
      return false;
    }

    try {
      const url = `${this.apiUrl}/bot${this.botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Telegram send error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Telegram service error:', error);
      return false;
    }
  }

  static formatReminderMessage(payload: NotificationPayload): string {
    let message = `🔔 <b>${escapeHtml(payload.title)}</b>\n\n`;
    message += escapeHtml(payload.message);
    
    if (payload.taskTitle) {
      message += `\n\n📋 <b>Task:</b> ${escapeHtml(payload.taskTitle)}`;
    }
    
    if (payload.dueDate) {
      message += `\n⏰ <b>Due:</b> ${payload.dueDate.toLocaleDateString()} at ${payload.dueDate.toLocaleTimeString()}`;
    }
    
    if (payload.link) {
      message += `\n\n<a href="${payload.link}">View Task</a>`;
    }
    
    return message;
  }

  // Get bot info to verify configuration
  static async getBotInfo(): Promise<{ ok: boolean; username?: string }> {
    if (!this.isConfigured()) {
      return { ok: false };
    }

    try {
      const response = await fetch(`${this.apiUrl}/bot${this.botToken}/getMe`);
      const data = await response.json();
      
      if (data.ok) {
        return { ok: true, username: data.result.username };
      }
      
      return { ok: false };
    } catch (error) {
      return { ok: false };
    }
  }

  // Generate a unique link for user to start conversation with bot
  static getStartLink(userId: string): string {
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'TaskFlowBot';
    return `https://t.me/${botUsername}?start=${userId}`;
  }
}

// Unified Notification Service
export class NotificationService {
  static async sendNotification(
    payload: NotificationPayload,
    preferences: UserNotificationPreferences
  ): Promise<{ whatsapp: boolean; telegram: boolean; email: boolean }> {
    const results = {
      whatsapp: false,
      telegram: false,
      email: false,
    };

    // WhatsApp
    if (preferences.whatsapp?.enabled && preferences.whatsapp.phoneNumber) {
      const message = WhatsAppService.formatReminderMessage(payload);
      results.whatsapp = await WhatsAppService.sendMessage(
        preferences.whatsapp.phoneNumber,
        message
      );
    }

    // Telegram
    if (preferences.telegram?.enabled && preferences.telegram.chatId) {
      const message = TelegramService.formatReminderMessage(payload);
      results.telegram = await TelegramService.sendMessage(
        preferences.telegram.chatId,
        message
      );
    }

    // Email is handled by existing email service
    // results.email = await EmailService.sendNotification(payload);

    return results;
  }

  static async sendTaskReminder(
    task: { id: string; title: string; dueDate: Date; description?: string },
    preferences: UserNotificationPreferences,
    appUrl: string
  ) {
    const payload: NotificationPayload = {
      userId: '',
      type: 'REMINDER',
      title: 'Task Reminder',
      message: `Don't forget: "${task.title}" is due soon!`,
      taskId: task.id,
      taskTitle: task.title,
      dueDate: task.dueDate,
      link: `${appUrl}/dashboard/tasks?taskId=${task.id}`,
    };

    return this.sendNotification(payload, preferences);
  }
}

// Helper function to escape HTML for Telegram
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default NotificationService;

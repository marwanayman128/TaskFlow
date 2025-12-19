/**
 * Debug endpoint to check reminder status
 * DELETE THIS FILE BEFORE PRODUCTION
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WhatsAppClientManager } from '@/lib/whatsapp-client';

export async function GET() {
  try {
    const now = new Date();
    
    // Get all reminders (not just due ones)
    const allReminders = await prisma.taskReminder.findMany({
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
          },
        },
      },
      orderBy: { remindAt: 'asc' },
    });
    
    // Get WhatsApp integrations
    const whatsappIntegrations = await prisma.userIntegration.findMany({
      where: { provider: 'whatsapp' },
      select: {
        userId: true,
        isActive: true,
        externalId: true,
      },
    });
    
    // Check WhatsApp client status
    const whatsappStatus = WhatsAppClientManager.getStatus();
    
    // Due reminders (what the cron would pick up)
    const dueReminders = allReminders.filter(
      r => r.remindAt && new Date(r.remindAt) <= now && !r.isTriggered
    );
    
    return NextResponse.json({
      currentTime: now.toISOString(),
      whatsappStatus,
      whatsappIntegrations,
      summary: {
        totalReminders: allReminders.length,
        dueReminders: dueReminders.length,
        triggeredReminders: allReminders.filter(r => r.isTriggered).length,
        pendingReminders: allReminders.filter(r => !r.isTriggered).length,
      },
      reminders: allReminders.map(r => ({
        id: r.id,
        taskTitle: r.task.title,
        taskStatus: r.task.status,
        type: r.type,
        remindAt: r.remindAt?.toISOString(),
        location: r.location,
        isTriggered: r.isTriggered,
        triggeredAt: r.triggeredAt?.toISOString(),
        isDue: r.remindAt ? new Date(r.remindAt) <= now : false,
        userId: r.userId,
      })),
    });
  } catch (error) {
    console.error('Debug reminders error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST to manually trigger a test WhatsApp message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, message } = body;
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }
    
    const testMessage = message || `🧪 *Test Message*\n\nThis is a test from TaskFlow reminder system.\n\nTime: ${new Date().toLocaleString()}`;
    
    const sent = await WhatsAppClientManager.sendMessage(phone, testMessage);
    
    return NextResponse.json({
      success: sent,
      phone,
      whatsappStatus: WhatsAppClientManager.getStatus(),
    });
  } catch (error) {
    console.error('Test WhatsApp error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { INTEGRATIONS } from '@/lib/config';
import { WhatsAppService } from '@/services/notification.service';
import { WhatsAppClientManager } from '@/lib/whatsapp-client';

// POST /api/v1/integrations/test - Send a test message
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider, phoneNumber: bodyPhoneNumber } = body;

    // Validation
    if (!provider) {
       return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    // Special handling for WhatsApp (Self-Hosted might not have DB record)
    let integration;
    if (provider === 'whatsapp') {
        const status = await WhatsAppClientManager.getStatus();
        if (status.status !== 'CONNECTED') {
             // Fallback to checking DB for Business API
             integration = await prisma.userIntegration.findUnique({
                where: { userId_provider: { userId: session.user.id, provider } }
             });
             
             if (!integration || !integration.isActive) {
                return NextResponse.json({ error: 'WhatsApp not connected (Scan QR or Connect Business API)' }, { status: 400 });
             }
        }
    } else {
        // Standard DB check for other providers
        integration = await prisma.userIntegration.findUnique({
          where: { userId_provider: { userId: session.user.id, provider } }
        });

        if (!integration || !integration.isActive) {
          return NextResponse.json({ error: 'Integration not connected' }, { status: 400 });
        }
    }

    // Determine Logic
    switch (provider) {
      case 'whatsapp': {
        const destPhone = bodyPhoneNumber || integration?.externalId;
        if (!destPhone) {
             return NextResponse.json({ error: 'Target phone number is required' }, { status: 400 });
        }
        // ... proceed to send


        // Use the centralized WhatsAppService which handles Self-Hosted -> SendZen fallback
        try {
          // You might need to import WhatsAppService from '@/services/notification.service'
          // Check if the service is available/configured
          if (!WhatsAppService.isConfigured()) {
             return NextResponse.json({
              success: false,
              error: 'WhatsApp service is not configured (neither Self-Hosted nor SendZen)',
            }, { status: 400 });
          }

          console.log(`[WhatsApp Test] Sending to ${phoneNumber} via WhatsAppService...`);
          const success = await WhatsAppService.sendMessage(phoneNumber, '👋 Hello from TaskFlow!\n\nThis is a test message to confirm your WhatsApp integration is working correctly.\n\n✅ Connection successful!');

          if (success) {
            return NextResponse.json({
              success: true,
              message: 'Test message sent successfully!',
            });
          } else {
            return NextResponse.json({
              success: false,
              error: 'Failed to send message via WhatsAppService (check server logs)',
            }, { status: 500 });
          }
        } catch (error) {
          console.error('[WhatsApp Test] Service call failed:', error);
          return NextResponse.json({
            success: false,
            error: 'Internal service error',
          }, { status: 500 });
        }
      }

      case 'telegram': {
        if (!INTEGRATIONS.TELEGRAM_ENABLED) {
          return NextResponse.json(
            { error: 'Telegram is not configured on the server' },
            { status: 400 }
          );
        }

        const chatId = integration.externalId;
        if (!chatId) {
          return NextResponse.json(
            { error: 'No chat ID found' },
            { status: 400 }
          );
        }

        const botToken = INTEGRATIONS.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
          // For demo/testing
          console.log(`[Telegram Test] Would send to chat ${chatId}:`, 'Hello from TaskFlow! 👋');
          
          return NextResponse.json({
            success: true,
            message: 'Test message logged (no bot token configured)',
            details: { chatId },
          });
        }

        try {
          const response = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: '👋 *Hello from TaskFlow!*\n\nThis is a test message to confirm your Telegram integration is working correctly.\n\n✅ Connection successful!',
                parse_mode: 'Markdown',
              }),
            }
          );

          const result = await response.json();

          if (!result.ok) {
            return NextResponse.json({
              success: false,
              error: result.description || 'Failed to send message',
            }, { status: 400 });
          }

          return NextResponse.json({
            success: true,
            message: 'Test message sent successfully!',
            messageId: result.result?.message_id,
          });
        } catch (telegramError) {
          console.error('[Telegram Test] Request failed:', telegramError);
          return NextResponse.json({
            success: false,
            error: 'Failed to connect to Telegram',
          }, { status: 500 });
        }
      }

      default:
        return NextResponse.json(
          { error: 'Test not available for this provider' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error sending test message:', error);
    return NextResponse.json(
      { error: 'Failed to send test message' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { WhatsAppClientManager } from '@/lib/whatsapp-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = WhatsAppClientManager.getStatus();
  const qr = WhatsAppClientManager.getQr();

  return NextResponse.json({
    status,
    qr
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'initialize') {
      // Await initialization to catch startup errors (e.g. browser not found)
      await WhatsAppClientManager.initialize();
      return NextResponse.json({ success: true, message: 'Initialization started' });
    }

    if (action === 'logout') {
      await WhatsAppClientManager.logout();
      return NextResponse.json({ success: true, message: 'Logged out' });
    }

    if (action === 'send_test') {
        const { phoneNumber } = body;
        if (!phoneNumber) {
             return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
        }
        
        // Use the static method which handles checks and formatting
        const success = await WhatsAppClientManager.sendMessage(phoneNumber, '👋 Hello! This is a test message from your Self-Hosted WhatsApp integration.');
        
        if (success) {
            return NextResponse.json({ success: true, message: 'Test message sent!' });
        } else {
            return NextResponse.json({ error: 'Failed to send message (Client not connected?)' }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

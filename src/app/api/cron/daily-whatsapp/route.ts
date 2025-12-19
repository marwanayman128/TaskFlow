/**
 * Cron endpoint for sending daily WhatsApp notifications
 * 
 * This endpoint should be called once daily (recommended: 8 AM local time)
 * to send task summaries to users with WhatsApp integration enabled.
 * 
 * Example Vercel cron configuration in vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/daily-whatsapp",
 *       "schedule": "0 8 * * *"
 *     }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendDailyNotifications } from '@/cron/daily-whatsapp-notifications';

export const dynamic = 'force-dynamic';

// Verify cron secret for security (set CRON_SECRET env var)
function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // Allow if no secret configured
  
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // Verify the request is from a trusted source
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await sendDailyNotifications();
    return NextResponse.json({ 
      success: true, 
      sent: result.sent,
      total: result.total,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cron Daily WhatsApp] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send daily notifications' },
      { status: 500 }
    );
  }
}

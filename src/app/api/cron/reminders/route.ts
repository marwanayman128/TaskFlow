/**
 * Cron endpoint for processing task reminders
 * 
 * This endpoint should be called periodically (every minute) by a cron service
 * like Vercel Cron, to process due task reminders and send notifications.
 * 
 * Example Vercel cron configuration in vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/reminders",
 *       "schedule": "* * * * *"
 *     }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { processReminders } from '@/cron/reminder-processor';

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
    const result = await processReminders();
    return NextResponse.json({ 
      success: true, 
      processed: result.processed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cron Reminders] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process reminders' },
      { status: 500 }
    );
  }
}

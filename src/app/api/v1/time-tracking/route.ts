import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TimeTrackingService } from '@/services/task.service';

// GET /api/v1/time-tracking/active - Get active timer for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeTimer = await TimeTrackingService.getActiveTimer(session.user.id);

    return NextResponse.json({ timer: activeTimer });
  } catch (error) {
    console.error('Error fetching active timer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active timer' },
      { status: 500 }
    );
  }
}

// POST /api/v1/time-tracking/stop - Stop current timer
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const entry = await TimeTrackingService.stopTimer(body.entryId, session.user.id);

    if (!entry) {
      return NextResponse.json(
        { error: 'Timer not found or already stopped' },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error stopping timer:', error);
    return NextResponse.json(
      { error: 'Failed to stop timer' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TimeTrackingService } from '@/services/task.service';

// GET /api/v1/tasks/[id]/time-entries - Get time entries for a task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: taskId } = await params;
    const entries = await TimeTrackingService.getTimeEntries(taskId);
    const totalTime = await TimeTrackingService.getTaskTotalTime(taskId);

    return NextResponse.json({ entries, totalTime });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

// POST /api/v1/tasks/[id]/time-entries - Start timer or add manual entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: taskId } = await params;
    const body = await request.json();

    // If manual entry with start/end times
    if (body.startTime && body.endTime) {
      const entry = await TimeTrackingService.addManualEntry(
        taskId,
        session.user.id,
        {
          description: body.description,
          startTime: new Date(body.startTime),
          endTime: new Date(body.endTime),
          isBillable: body.isBillable,
        }
      );
      return NextResponse.json(entry, { status: 201 });
    }

    // Otherwise, start a new timer
    const entry = await TimeTrackingService.startTimer(
      taskId,
      session.user.id,
      body.description
    );

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
}

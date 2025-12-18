import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TaskService } from '@/services/task.service';

// GET /api/v1/tasks/upcoming - Get upcoming tasks
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = session.user.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const tasks = await TaskService.getUpcomingTasks(organizationId, days);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

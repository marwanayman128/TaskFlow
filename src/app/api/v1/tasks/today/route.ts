import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TaskService } from '@/services/task.service';

// GET /api/v1/tasks/today - Get today's tasks
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = session.user.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    const tasks = await TaskService.getTodaysTasks(organizationId, session.user.id);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching today\'s tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

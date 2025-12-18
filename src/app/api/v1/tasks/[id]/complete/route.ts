import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TaskService } from '@/services/task.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/v1/tasks/[id]/complete - Mark task as complete
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = session.user.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    const { id } = await params;
    const task = await TaskService.completeTask(id, organizationId, session.user.id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    );
  }
}

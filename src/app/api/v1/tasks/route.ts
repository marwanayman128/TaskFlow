import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TaskService } from '@/services/task.service';
import { TasksQuery, CreateTaskInput } from '@/lib/types/tasks';

// GET /api/v1/tasks - List tasks with filters
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
    
    const query: TasksQuery = {
      listId: searchParams.get('listId') || undefined,
      boardId: searchParams.get('boardId') || undefined,
      boardColumnId: searchParams.get('boardColumnId') || undefined,
      status: searchParams.get('status') as TasksQuery['status'] || undefined,
      priority: searchParams.get('priority') as TasksQuery['priority'] || undefined,
      assignedToId: searchParams.get('assignedToId') || undefined,
      dueDate: searchParams.get('dueDate') || undefined,
      dueBefore: searchParams.get('dueBefore') || undefined,
      dueAfter: searchParams.get('dueAfter') || undefined,
      search: searchParams.get('search') || undefined,
      includeSubtasks: searchParams.get('includeSubtasks') === 'true',
      includeCompleted: searchParams.get('includeCompleted') !== 'false',
      sortBy: searchParams.get('sortBy') as TasksQuery['sortBy'] || undefined,
      sortOrder: searchParams.get('sortOrder') as TasksQuery['sortOrder'] || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };

    const result = await TaskService.getTasks(organizationId, query);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/v1/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = session.user.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    const body: CreateTaskInput = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const task = await TaskService.createTask(
      organizationId,
      session.user.id,
      body
    );

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

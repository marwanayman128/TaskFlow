import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TaskService } from '@/services/task.service';
import { BulkTaskOperation } from '@/lib/types/tasks';

// POST /api/v1/tasks/bulk - Perform bulk operations on tasks
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

    const body: BulkTaskOperation = await request.json();

    if (!body.operation) {
      return NextResponse.json(
        { error: 'Operation is required' },
        { status: 400 }
      );
    }

    if (!body.taskIds?.length) {
      return NextResponse.json(
        { error: 'At least one task ID is required' },
        { status: 400 }
      );
    }

    const count = await TaskService.bulkOperation(
      organizationId,
      session.user.id,
      body
    );

    return NextResponse.json({ count, success: true });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

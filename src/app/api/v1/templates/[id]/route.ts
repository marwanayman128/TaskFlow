import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/v1/templates/[id] - Get template details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const template = await prisma.taskTemplate.findFirst({
      where: {
        id,
        OR: [
          { organizationId: session.user.organizationId },
          { isSystem: true },
        ],
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// POST /api/v1/templates/[id] - Use template to create task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { listId, boardId, boardColumnId, dueDate } = body;

    // Get template
    const template = await prisma.taskTemplate.findFirst({
      where: {
        id,
        OR: [
          { organizationId: session.user.organizationId },
          { isSystem: true },
        ],
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const taskData = template.taskData as any || {};

    // Create task from template
    const task = await prisma.task.create({
      data: {
        organizationId: session.user.organizationId,
        createdById: session.user.id,
        title: taskData.title || template.name,
        description: taskData.description || template.description,
        priority: taskData.priority || 'MEDIUM',
        status: 'TODO',
        listId,
        boardId,
        boardColumnId,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedMinutes: taskData.estimatedMinutes,
        position: 0,
      },
    });

    // Create checklist items if any
    const checklistItems = template.checklistItems as any[] || [];
    if (checklistItems.length > 0) {
      // Create a checklist
      const checklist = await prisma.taskChecklist.create({
        data: {
          taskId: task.id,
          name: 'Checklist',
          position: 0,
        },
      });

      // Create checklist items
      await prisma.checklistItem.createMany({
        data: checklistItems.map((item, index) => ({
          checklistId: checklist.id,
          title: item.title || item,
          position: index,
          isCompleted: false,
        })),
      });
    }

    // Increment usage count
    await prisma.taskTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error using template:', error);
    return NextResponse.json(
      { error: 'Failed to create task from template' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/templates/[id] - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Can only delete own templates
    const template = await prisma.taskTemplate.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
        isSystem: false,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found or cannot be deleted' },
        { status: 404 }
      );
    }

    await prisma.taskTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

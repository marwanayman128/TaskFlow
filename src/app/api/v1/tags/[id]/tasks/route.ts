import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/v1/tags/[id]/tasks - Get tasks for a specific tag
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify tag exists and belongs to user's organization
    const tag = await prisma.tag.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
        deletedAt: null,
      },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Get all tasks with this tag
    const taskTags = await prisma.taskTag.findMany({
      where: {
        tagId: id,
        task: {
          deletedAt: null,
          organizationId: session.user.organizationId,
        },
      },
      include: {
        task: {
          include: {
            list: {
              select: {
                id: true,
                name: true,
                color: true,
                icon: true,
              },
            },
            tags: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    color: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        task: {
          position: 'asc',
        },
      },
    });

    const tasks = taskTags.map((tt) => ({
      id: tt.task.id,
      title: tt.task.title,
      description: tt.task.description,
      completed: tt.task.status === 'COMPLETED',
      priority: tt.task.priority,
      dueDate: tt.task.dueDate?.toISOString(),
      dueTime: tt.task.dueTime,
      listId: tt.task.listId,
      listName: tt.task.list?.name,
      listColor: tt.task.list?.color,
      position: tt.task.position,
      tags: tt.task.tags.map((t) => ({
        id: t.tag.id,
        name: t.tag.name,
        color: t.tag.color,
      })),
      createdAt: tt.task.createdAt.toISOString(),
      updatedAt: tt.task.updatedAt.toISOString(),
      completedAt: tt.task.completedAt?.toISOString(),
    }));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

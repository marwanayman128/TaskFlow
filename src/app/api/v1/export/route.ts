import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/v1/export - Export user data
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const include = searchParams.get('include')?.split(',') || ['tasks', 'lists', 'boards', 'tags'];

    const exportData: any = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    // Export Tasks
    if (include.includes('tasks')) {
      const tasks = await prisma.task.findMany({
        where: {
          organizationId: session.user.organizationId,
          deletedAt: null,
        },
        include: {
          tags: { include: { tag: true } },
          list: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      exportData.tasks = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate?.toISOString(),
        completedAt: task.completedAt?.toISOString(),
        listName: task.list?.name,
        tags: task.tags.map(t => t.tag.name),
        createdAt: task.createdAt.toISOString(),
      }));
    }

    // Export Lists
    if (include.includes('lists')) {
      const lists = await prisma.taskList.findMany({
        where: { organizationId: session.user.organizationId },
        orderBy: { position: 'asc' },
      });

      exportData.lists = lists.map(list => ({
        id: list.id,
        name: list.name,
        description: list.description,
        color: list.color,
        icon: list.icon,
        createdAt: list.createdAt.toISOString(),
      }));
    }

    // Export Boards
    if (include.includes('boards')) {
      const boards = await prisma.board.findMany({
        where: { organizationId: session.user.organizationId },
        include: { columns: true },
        orderBy: { createdAt: 'desc' },
      });

      exportData.boards = boards.map(board => ({
        id: board.id,
        name: board.name,
        description: board.description,
        color: board.color,
        columns: board.columns.map(col => ({
          name: col.name,
          color: col.color,
          position: col.position,
        })),
        createdAt: board.createdAt.toISOString(),
      }));
    }

    // Export Tags
    if (include.includes('tags')) {
      const tags = await prisma.tag.findMany({
        where: { organizationId: session.user.organizationId },
      });

      exportData.tags = tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      }));
    }

    // Handle different formats
    if (format === 'csv') {
      // Convert tasks to CSV
      if (!exportData.tasks || exportData.tasks.length === 0) {
        return new NextResponse('No tasks to export', { status: 400 });
      }

      const headers = ['Title', 'Description', 'Status', 'Priority', 'Due Date', 'List', 'Tags', 'Created At'];
      const rows = exportData.tasks.map((task: any) => [
        task.title,
        task.description || '',
        task.status,
        task.priority,
        task.dueDate || '',
        task.listName || '',
        task.tags.join(', '),
        task.createdAt,
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row: string[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="taskflow-export-${Date.now()}.csv"`,
        },
      });
    }

    // Default: JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="taskflow-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

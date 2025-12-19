import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/v1/templates - Get all templates
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includeSystem = searchParams.get('includeSystem') !== 'false';

    const where: any = {
      OR: [
        { organizationId: session.user.organizationId },
        ...(includeSystem ? [{ isSystem: true }] : []),
      ],
    };

    if (category) {
      where.category = category;
    }

    const templates = await prisma.taskTemplate.findMany({
      where,
      orderBy: [{ isSystem: 'desc' }, { usageCount: 'desc' }, { name: 'asc' }],
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/v1/templates - Create a template
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, icon, color, taskData, checklistItems } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const template = await prisma.taskTemplate.create({
      data: {
        organizationId: session.user.organizationId,
        createdById: session.user.id,
        name,
        description,
        category,
        icon,
        color,
        taskData: taskData || {},
        checklistItems: checklistItems || [],
        isSystem: false,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/v1/custom-fields - Get all custom fields
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customFields = await prisma.customField.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(customFields);
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom fields' },
      { status: 500 }
    );
  }
}

// POST /api/v1/custom-fields - Create a custom field
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, options, isRequired } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const validTypes = ['TEXT', 'NUMBER', 'DATE', 'DROPDOWN', 'MULTISELECT', 'CHECKBOX', 'URL', 'EMAIL', 'PHONE'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid field type' },
        { status: 400 }
      );
    }

    const customField = await prisma.customField.create({
      data: {
        organizationId: session.user.organizationId,
        name,
        type,
        options,
        isRequired: isRequired || false,
      },
    });

    return NextResponse.json(customField, { status: 201 });
  } catch (error) {
    console.error('Error creating custom field:', error);
    return NextResponse.json(
      { error: 'Failed to create custom field' },
      { status: 500 }
    );
  }
}

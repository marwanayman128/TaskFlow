import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function seedData(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    let organizationId: string | null = session.user.organizationId || null;
    
    // Check if organization exists
    if (organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId }
      });
      if (!org) {
        // Organization ID in session is stale/invalid
        organizationId = null; 
      }
    }

    if (!organizationId) {
       // Create a default organization if missing
       const timestamp = Date.now().toString(36);
       const newOrg = await prisma.organization.create({
         data: {
           name: 'My Workspace',
           code: `workspace-${timestamp}`
         }
       });
       organizationId = newOrg.id;

       // Update user to link to this new org
       await prisma.user.update({
         where: { id: userId },
         data: { organizationId: organizationId }
       });
    }

    // 1. Create Default Lists
    const defaultLists = [
      { name: 'Personal', icon: 'solar:user-outline', color: '#6366f1' }, // Indigo
      { name: 'Work', icon: 'solar:suitcase-outline', color: '#ec4899' },   // Pink
      { name: 'Grocery List', icon: 'solar:cart-outline', color: '#22c55e' }, // Green
    ];

    const createdLists = [];
    for (const list of defaultLists) {
      // Check if list already exists for this user/org to avoid duplicates
      const existing = await prisma.taskList.findFirst({
        where: {
          organizationId: organizationId,
          name: list.name,
          deletedAt: null,
        }
      });

      if (!existing) {
        const newList = await prisma.taskList.create({
          data: {
            name: list.name,
            icon: list.icon,
            color: list.color,
            description: `My ${list.name} tasks`,
            isDefault: false,
            position: 0,
            organization: {
              connect: { id: organizationId }
            },
            createdBy: {
              connect: { id: userId }
            }
          }
        });
        createdLists.push(newList);
      } else {
        createdLists.push(existing);
      }
    }

    // 2. Create Default Tags
    const defaultTags = [
      { name: 'Priority', color: '#ef4444' }, // Red
      { name: 'Design', color: '#8b5cf6' },   // Purple
    ];

    const createdTags = [];
    for (const tag of defaultTags) {
       const existing = await prisma.tag.findFirst({
        where: {
          organizationId: organizationId,
          name: tag.name,
          deletedAt: null,
        }
       });
       
       if (!existing) {
         const newTag = await prisma.tag.create({
            data: {
              name: tag.name,
              color: tag.color,
              organization: {
                connect: { id: organizationId }
              }
            }
         });
         createdTags.push(newTag);
       } else {
         createdTags.push(existing);
       }
    }

    return NextResponse.json({
      message: 'Seed completed successfully',
      lists: createdLists,
      tags: createdTags,
    });

  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      error: 'Failed to seed data', 
      details: error?.message || String(error) 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return seedData(req);
}

export async function GET(req: NextRequest) {
  return seedData(req);
}

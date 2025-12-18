
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    // 1. Ensure Default Organization Exists
    let organization = await prisma.organization.findFirst();
    
    if (!organization) {
      const timestamp = Date.now().toString(36);
      organization = await prisma.organization.create({
        data: {
          name: 'Demo Workspace',
          code: `demo-${timestamp}`,
        }
      });
    }

    const orgId = organization.id;

    // 2. Define Demo Users
    const demoUsers = [
      {
        username: 'admin',
        email: 'admin@starter.local',
        fullName: 'Administrator',
        role: 'ADMIN',
        password: 'admin123'
      },
      {
        username: 'manager',
        email: 'manager@starter.local',
        fullName: 'Shift Manager',
        role: 'MANAGER',
        password: 'manager123'
      },
      {
        username: 'frontdesk',
        email: 'frontdesk@starter.local',
        fullName: 'Front Desk Agent',
        role: 'FRONT_DESK',
        password: 'front123'
      },
      {
        username: 'housekeeper',
        email: 'housekeeper@starter.local',
        fullName: 'Housekeeping Staff',
        role: 'HOUSEKEEPER',
        password: 'house123'
      }
    ];

    const createdUsers = [];

    // 3. Create Users
    for (const u of demoUsers) {
      const existing = await prisma.user.findFirst({
        where: { OR: [{ username: u.username }, { email: u.email }] }
      });

      if (!existing) {
        const passwordHash = await hash(u.password, 12);
        const newUser = await prisma.user.create({
          data: {
            username: u.username,
            email: u.email,
            fullName: u.fullName,
            passwordHash: passwordHash,
            role: u.role,
            organizationId: orgId,
            language: 'en',
            active: true
          }
        });
        createdUsers.push(newUser);
      } else {
        createdUsers.push(existing);
      }
    }

    return NextResponse.json({
      message: 'Users seeded successfully',
      organization,
      users: createdUsers.map(u => ({ id: u.id, username: u.username, role: u.role }))
    });

  } catch (error: any) {
    console.error('Seed Users error:', error);
    return NextResponse.json({ 
      error: 'Failed to seed users', 
      details: error?.message || String(error) 
    }, { status: 500 });
  }
}

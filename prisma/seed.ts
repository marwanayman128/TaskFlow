import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // ============================================
    // CREATE DEFAULT ORGANIZATION
    // ============================================
    console.log('📋 Creating default organization...');

    const organization = await prisma.organization.upsert({
      where: { code: 'DEFAULT' },
      update: {},
      create: {
        code: 'DEFAULT',
        name: 'My Organization',
        description: 'Default organization for the starter kit',
        email: 'contact@example.com',
        phone: '+1-555-0100',
        address: '123 Main Street',
        city: 'New York',
        country: 'United States',
        postalCode: '10001',
        defaultCurrency: 'USD',
        defaultLanguage: 'en',
        timezone: 'America/New_York',
        active: true,
      },
    });

    console.log(`✅ Organization created: ${organization.name}`);

    // ============================================
    // CREATE SYSTEM SETTINGS
    // ============================================
    console.log('⚙️ Creating system settings...');

    await prisma.systemSettings.upsert({
      where: { organizationId: organization.id },
      update: {},
      create: {
        organizationId: organization.id,
        appName: 'Dashboard Starter',
        appDescription: 'A modern dashboard starter kit',
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: false,
        sessionTimeout: 3600,
        maxLoginAttempts: 5,
        lockoutDuration: 900,
      },
    });

    console.log('✅ System settings created');

    // ============================================
    // CREATE USERS
    // ============================================
    console.log('👤 Creating users...');

    const hashedPasswords = {
      admin: await bcrypt.hash('admin123', 12),
      user: await bcrypt.hash('user123', 12),
      manager: await bcrypt.hash('manager123', 12),
      designer: await bcrypt.hash('design123', 12),
      developer: await bcrypt.hash('dev123', 12),
    };

    // Create Admin User
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        organizationId: organization.id,
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPasswords.admin,
        fullName: 'System Administrator',
        phone: '+1-555-0101',
        role: UserRole.ADMIN,
        language: 'en',
        active: true,
      },
    });

    console.log(`✅ Admin user created: ${adminUser.email}`);

    // Create Regular User
    const regularUser = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        organizationId: organization.id,
        username: 'user',
        email: 'user@example.com',
        password: hashedPasswords.user,
        fullName: 'Regular User',
        phone: '+1-555-0102',
        role: UserRole.USER,
        language: 'en',
        active: true,
      },
    });

    console.log(`✅ Regular user created: ${regularUser.email}`);

    // Create Product Manager
    const managerUser = await prisma.user.upsert({
      where: { email: 'manager@example.com' },
      update: {},
      create: {
        organizationId: organization.id,
        username: 'manager',
        email: 'manager@example.com',
        password: hashedPasswords.manager,
        fullName: 'Product Manager',
        phone: '+1-555-0103',
        role: 'MANAGER' as UserRole,
        language: 'en',
        active: true,
      },
    });
    console.log(`✅ Manager user created: ${managerUser.email}`);

    // Create Designer
    const designerUser = await prisma.user.upsert({
      where: { email: 'designer@example.com' },
      update: {},
      create: {
        organizationId: organization.id,
        username: 'designer',
        email: 'designer@example.com',
        password: hashedPasswords.designer,
        fullName: 'Lead Designer',
        phone: '+1-555-0104',
        role: UserRole.USER,
        language: 'en',
        active: true,
      },
    });
    console.log(`✅ Designer user created: ${designerUser.email}`);

    // Create Developer
    const developerUser = await prisma.user.upsert({
      where: { email: 'developer@example.com' },
      update: {},
      create: {
        organizationId: organization.id,
        username: 'developer',
        email: 'developer@example.com',
        password: hashedPasswords.developer,
        fullName: 'Senior Developer',
        phone: '+1-555-0105',
        role: UserRole.USER,
        language: 'en',
        active: true,
      },
    });
    console.log(`✅ Developer user created: ${developerUser.email}`);

    console.log(`✅ Regular user created: ${regularUser.email}`);

    // ============================================
    // CREATE USER GROUPS (Optional)
    // ============================================
    console.log('👥 Creating user groups...');

    const adminGroup = await prisma.userGroup.upsert({
      where: {
        organizationId_code: {
          organizationId: organization.id,
          code: 'ADMINS',
        },
      },
      update: {},
      create: {
        organizationId: organization.id,
        code: 'ADMINS',
        name: 'Administrators',
        description: 'System administrators with full access',
        active: true,
      },
    });

    const usersGroup = await prisma.userGroup.upsert({
      where: {
        organizationId_code: {
          organizationId: organization.id,
          code: 'USERS',
        },
      },
      update: {},
      create: {
        organizationId: organization.id,
        code: 'USERS',
        name: 'Regular Users',
        description: 'Standard users with limited access',
        active: true,
      },
    });

    console.log('✅ User groups created');

    // Add users to groups
    await prisma.userGroupMember.upsert({
      where: {
        userId_groupId: {
          userId: adminUser.id,
          groupId: adminGroup.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        groupId: adminGroup.id,
      },
    });

    await prisma.userGroupMember.upsert({
      where: {
        userId_groupId: {
          userId: regularUser.id,
          groupId: usersGroup.id,
        },
      },
      update: {},
      create: {
        userId: regularUser.id,
        groupId: usersGroup.id,
      },
    });

    console.log('✅ Users added to groups');

    // ============================================
    // CREATE SAMPLE PERMISSIONS
    // ============================================
    console.log('🔐 Creating permissions...');

    const modules = ['users', 'settings', 'reports', 'audit-logs'];
    const actions = ['create', 'read', 'update', 'delete'];

    // Admin group gets all permissions
    for (const module of modules) {
      for (const action of actions) {
        await prisma.groupPermission.upsert({
          where: {
            groupId_module_action: {
              groupId: adminGroup.id,
              module,
              action,
            },
          },
          update: { allowed: true },
          create: {
            groupId: adminGroup.id,
            module,
            action,
            allowed: true,
          },
        });
      }
    }

    // Users group gets read-only permissions
    for (const module of modules) {
      await prisma.groupPermission.upsert({
        where: {
          groupId_module_action: {
            groupId: usersGroup.id,
            module,
            action: 'read',
          },
        },
        update: { allowed: true },
        create: {
          groupId: usersGroup.id,
          module,
          action: 'read',
          allowed: true,
        },
      });
    }

    console.log('✅ Permissions created');

    // ============================================
    // CREATE SAMPLE NOTIFICATIONS
    // ============================================
    console.log('🔔 Creating sample notifications...');

    await prisma.notification.createMany({
      skipDuplicates: true,
      data: [
        {
          userId: adminUser.id,
          type: 'INFO',
          title: 'Welcome to the Dashboard',
          message: 'Your dashboard has been set up successfully. Start exploring the features!',
        },
        {
          userId: adminUser.id,
          type: 'SUCCESS',
          title: 'Setup Complete',
          message: 'All initial configurations have been completed.',
        },
        {
          userId: regularUser.id,
          type: 'INFO',
          title: 'Welcome!',
          message: 'Welcome to the platform. Feel free to explore!',
        },
      ],
    });

    console.log('✅ Sample notifications created');

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   - 1 Organization created');
    console.log('   - 2 Users created (admin@example.com, user@example.com)');
    console.log('   - 2 User groups created');
    console.log('   - Permissions configured');
    console.log('   - Sample notifications created');
    console.log('\n🔑 Login credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User:  user@example.com / user123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

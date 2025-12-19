import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { WhatsAppClientManager } from '@/lib/whatsapp-client';

import { prisma } from '@/lib/prisma';
import { INTEGRATIONS } from '@/lib/config';

// Type for integration connection
interface IntegrationConnection {
  id: string;
  provider: string;
  externalId: string | null;
  isActive: boolean;
  connectedAt: Date;
  metadata: unknown;
}

// GET /api/v1/integrations - Get user's integration status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's integration connections from database
    const connections = await prisma.userIntegration.findMany({
      where: { userId: session.user.id },
    }) as IntegrationConnection[];

    // Check Self-Hosted Status
    const waStatus = await WhatsAppClientManager.getStatus();
    const isSelfHostedConnected = waStatus.status === 'CONNECTED';

    const integrationStatus = {
      googleCalendar: {
        available: INTEGRATIONS.GOOGLE_CALENDAR_ENABLED,
        connected: connections.some((c: IntegrationConnection) => c.provider === 'google_calendar' && c.isActive),
        connectedAt: connections.find((c: IntegrationConnection) => c.provider === 'google_calendar')?.connectedAt,
      },
      whatsapp: {
        available: INTEGRATIONS.WHATSAPP_ENABLED,
        connected: connections.some((c: IntegrationConnection) => c.provider === 'whatsapp' && c.isActive) || isSelfHostedConnected,
        phoneNumber: isSelfHostedConnected 
            ? 'Self-Hosted Web' 
            : connections.find((c: IntegrationConnection) => c.provider === 'whatsapp')?.externalId,
      },
      telegram: {
        available: INTEGRATIONS.TELEGRAM_ENABLED,
        connected: connections.some((c: IntegrationConnection) => c.provider === 'telegram' && c.isActive),
        chatId: connections.find((c: IntegrationConnection) => c.provider === 'telegram')?.externalId,
      },
    };

    return NextResponse.json(integrationStatus);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

// POST /api/v1/integrations - Connect a new integration
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider, externalId, accessToken, refreshToken, expiresAt, metadata } = body;

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    // Upsert the integration
    const integration = await prisma.userIntegration.upsert({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider,
        },
      },
      update: {
        externalId,
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        metadata,
        isActive: true,
        connectedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        provider,
        externalId,
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        metadata,
        isActive: true,
        connectedAt: new Date(),
      },
    });

    return NextResponse.json(integration, { status: 201 });
  } catch (error) {
    console.error('Error connecting integration:', error);
    return NextResponse.json(
      { error: 'Failed to connect integration' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/integrations - Disconnect an integration
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    await prisma.userIntegration.updateMany({
      where: {
        userId: session.user.id,
        provider,
      },
      data: {
        isActive: false,
        accessToken: null,
        refreshToken: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}

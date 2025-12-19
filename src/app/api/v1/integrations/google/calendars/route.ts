import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleCalendarService } from '@/services/google-calendar.service';

// GET /api/v1/integrations/google/calendars - Get user's Google Calendars
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Google integration
    const integration = await prisma.userIntegration.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google_calendar',
        isActive: true,
      },
    });

    if (!integration || !integration.accessToken) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      );
    }

    // Check if token needs refresh
    let accessToken = integration.accessToken;
    if (integration.expiresAt && new Date(integration.expiresAt) < new Date()) {
      if (!integration.refreshToken) {
        return NextResponse.json(
          { error: 'Token expired and no refresh token available' },
          { status: 401 }
        );
      }

      const refreshed = await GoogleCalendarService.refreshAccessToken(integration.refreshToken);
      if (!refreshed) {
        return NextResponse.json(
          { error: 'Failed to refresh token' },
          { status: 401 }
        );
      }

      // Update stored tokens
      await prisma.userIntegration.update({
        where: { id: integration.id },
        data: {
          accessToken: refreshed.accessToken,
          expiresAt: refreshed.expiresAt,
        },
      });

      accessToken = refreshed.accessToken;
    }

    // Fetch calendars
    const calendars = await GoogleCalendarService.getCalendars(accessToken);

    return NextResponse.json({ calendars });
  } catch (error) {
    console.error('Error fetching Google calendars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendars' },
      { status: 500 }
    );
  }
}

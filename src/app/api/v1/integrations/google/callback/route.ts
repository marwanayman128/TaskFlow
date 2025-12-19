import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleCalendarService } from '@/services/google-calendar.service';

// GET /api/v1/integrations/google/callback - OAuth callback
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=oauth_denied', request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=no_code', request.url)
      );
    }

    // Exchange code for tokens
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/google/callback`;
    const tokens = await GoogleCalendarService.exchangeCodeForTokens(code, redirectUri);

    if (!tokens) {
      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=token_exchange_failed', request.url)
      );
    }

    // Save the integration to database
    await prisma.userIntegration.upsert({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'google_calendar',
        },
      },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        isActive: true,
        connectedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        provider: 'google_calendar',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        isActive: true,
        connectedAt: new Date(),
      },
    });

    // Redirect to settings with success
    return NextResponse.redirect(
      new URL('/dashboard/settings/integrations?success=google_connected', request.url)
    );
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/settings/integrations?error=unknown', request.url)
    );
  }
}

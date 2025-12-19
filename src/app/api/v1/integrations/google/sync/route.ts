import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleCalendarService } from '@/services/google-calendar.service';

// Helper to get valid access token
async function getValidAccessToken(userId: string): Promise<string | null> {
  const integration = await prisma.userIntegration.findFirst({
    where: {
      userId,
      provider: 'google_calendar',
      isActive: true,
    },
  });

  if (!integration || !integration.accessToken) {
    return null;
  }

  // Check if token needs refresh
  if (integration.expiresAt && new Date(integration.expiresAt) < new Date()) {
    if (!integration.refreshToken) {
      return null;
    }

    const refreshed = await GoogleCalendarService.refreshAccessToken(integration.refreshToken);
    if (!refreshed) {
      return null;
    }

    await prisma.userIntegration.update({
      where: { id: integration.id },
      data: {
        accessToken: refreshed.accessToken,
        expiresAt: refreshed.expiresAt,
      },
    });

    return refreshed.accessToken;
  }

  return integration.accessToken;
}

// POST /api/v1/integrations/google/sync - Sync tasks with Google Calendar
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, calendarId = 'primary' } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get valid access token
    const accessToken = await getValidAccessToken(session.user.id);
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Google Calendar not connected or token expired' },
        { status: 401 }
      );
    }

    // Get the task
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        createdById: session.user.id,
        deletedAt: null,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    if (!task.dueDate) {
      return NextResponse.json(
        { error: 'Task must have a due date to sync with calendar' },
        { status: 400 }
      );
    }

    // Convert task to calendar event
    const event = GoogleCalendarService.taskToEvent({
      title: task.title,
      description: task.description || undefined,
      dueDate: task.dueDate,
      estimatedMinutes: task.estimatedMinutes || 60,
    });

    // Check if task already has a calendar event linked
    const existingEventId = (task.metadata as any)?.googleCalendarEventId;

    let result;
    if (existingEventId) {
      // Update existing event
      result = await GoogleCalendarService.updateEvent(
        accessToken,
        existingEventId,
        event,
        calendarId
      );
    } else {
      // Create new event
      result = await GoogleCalendarService.createEvent(
        accessToken,
        event,
        calendarId
      );

      // Store the event ID in task metadata
      if (result?.id) {
        await prisma.task.update({
          where: { id: taskId },
          data: {
            metadata: {
              ...(task.metadata as any || {}),
              googleCalendarEventId: result.id,
              googleCalendarId: calendarId,
            },
          },
        });
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to sync with Google Calendar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      eventId: result.id,
    });
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Google Calendar' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/integrations/google/sync - Remove task from Google Calendar
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get the task
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        createdById: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const eventId = (task.metadata as any)?.googleCalendarEventId;
    const calendarId = (task.metadata as any)?.googleCalendarId || 'primary';

    if (!eventId) {
      return NextResponse.json(
        { error: 'Task is not synced with Google Calendar' },
        { status: 400 }
      );
    }

    // Get valid access token
    const accessToken = await getValidAccessToken(session.user.id);
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Google Calendar not connected or token expired' },
        { status: 401 }
      );
    }

    // Delete the event
    const success = await GoogleCalendarService.deleteEvent(
      accessToken,
      eventId,
      calendarId
    );

    if (success) {
      // Remove event ID from task metadata
      const metadata = { ...(task.metadata as any || {}) };
      delete metadata.googleCalendarEventId;
      delete metadata.googleCalendarId;

      await prisma.task.update({
        where: { id: taskId },
        data: { metadata },
      });
    }

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error removing from Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to remove from Google Calendar' },
      { status: 500 }
    );
  }
}

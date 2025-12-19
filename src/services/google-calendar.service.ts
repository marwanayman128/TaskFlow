/**
 * Google Calendar Integration Service
 * 
 * Handles:
 * - OAuth2 authentication flow
 * - Syncing tasks with Google Calendar
 * - Real-time event updates
 */

import { INTEGRATIONS } from '@/lib/config';

// Types
export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
  accessRole: string;
  backgroundColor?: string;
}

export interface GoogleAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// Google Calendar Service
export class GoogleCalendarService {
  private static clientId = INTEGRATIONS.GOOGLE_CLIENT_ID;
  private static clientSecret = INTEGRATIONS.GOOGLE_CLIENT_SECRET;
  private static apiUrl = 'https://www.googleapis.com/calendar/v3';
  private static oauthUrl = 'https://oauth2.googleapis.com';

  static isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  // Generate OAuth2 authorization URL
  static getAuthUrl(redirectUri: string, state?: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    const params = new URLSearchParams({
      client_id: this.clientId!,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state }),
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Exchange authorization code for tokens
  static async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<GoogleAuthTokens | null> {
    try {
      const response = await fetch(`${this.oauthUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: this.clientId!,
          client_secret: this.clientSecret!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Google OAuth error:', error);
        return null;
      }

      const data = await response.json();
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      };
    } catch (error) {
      console.error('Google OAuth exchange error:', error);
      return null;
    }
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date } | null> {
    try {
      const response = await fetch(`${this.oauthUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: this.clientId!,
          client_secret: this.clientSecret!,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      return {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      };
    } catch (error) {
      console.error('Google token refresh error:', error);
      return null;
    }
  }

  // Get user's calendars
  static async getCalendars(accessToken: string): Promise<GoogleCalendar[]> {
    try {
      const response = await fetch(`${this.apiUrl}/users/me/calendarList`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendars:', error);
      return [];
    }
  }

  // Get events from a calendar
  static async getEvents(
    accessToken: string,
    calendarId: string = 'primary',
    timeMin?: Date,
    timeMax?: Date
  ): Promise<GoogleCalendarEvent[]> {
    try {
      const params = new URLSearchParams({
        singleEvents: 'true',
        orderBy: 'startTime',
        ...(timeMin && { timeMin: timeMin.toISOString() }),
        ...(timeMax && { timeMax: timeMax.toISOString() }),
      });

      const response = await fetch(
        `${this.apiUrl}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  // Create a calendar event
  static async createEvent(
    accessToken: string,
    event: GoogleCalendarEvent,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Error creating event:', error);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }

  // Update a calendar event
  static async updateEvent(
    accessToken: string,
    eventId: string,
    event: Partial<GoogleCalendarEvent>,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  }

  // Delete a calendar event
  static async deleteEvent(
    accessToken: string,
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  // Convert task to Google Calendar event
  static taskToEvent(task: {
    title: string;
    description?: string;
    dueDate: Date;
    estimatedMinutes?: number;
  }): GoogleCalendarEvent {
    const start = new Date(task.dueDate);
    const end = new Date(start.getTime() + (task.estimatedMinutes || 60) * 60 * 1000);

    return {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };
  }
}

export default GoogleCalendarService;

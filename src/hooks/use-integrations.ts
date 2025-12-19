import * as React from 'react';
import useSWR from 'swr';

// Fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

// Types
export interface IntegrationStatus {
  googleCalendar: {
    available: boolean;
    connected: boolean;
    connectedAt?: string;
  };
  whatsapp: {
    available: boolean;
    connected: boolean;
    phoneNumber?: string;
  };
  telegram: {
    available: boolean;
    connected: boolean;
    chatId?: string;
  };
}

// Hook to get integration status
export function useIntegrations() {
  const { data, error, isLoading, mutate } = useSWR<IntegrationStatus>(
    '/api/v1/integrations',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    integrations: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for integration actions
export function useIntegrationActions() {
  const [isLoading, setIsLoading] = React.useState(false);

  const connectGoogleCalendar = () => {
    // Redirect to Google OAuth
    const redirectUri = `${window.location.origin}/api/v1/integrations/google/callback`;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.error('Google Client ID not configured');
      return;
    }

    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const connectWhatsApp = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'whatsapp',
          externalId: phoneNumber,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to connect WhatsApp');
      return true;
    } catch (error) {
      console.error('WhatsApp connection error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const connectTelegram = async (chatId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'telegram',
          externalId: chatId,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to connect Telegram');
      return true;
    } catch (error) {
      console.error('Telegram connection error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async (provider: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/integrations?provider=${provider}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to disconnect');
      return true;
    } catch (error) {
      console.error('Disconnect error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    connectGoogleCalendar,
    connectWhatsApp,
    connectTelegram,
    disconnect,
    isLoading,
  };
}

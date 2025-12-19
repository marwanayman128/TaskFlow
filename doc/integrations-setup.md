# Integrations Environment Variables

This document describes the environment variables needed for the app integrations.

## Feature Flags

```bash
# Enable/Disable locale prefixes in URLs 
# true = /en/dashboard, false = /dashboard
NEXT_PUBLIC_ENABLE_I18N=true
NEXT_PUBLIC_DEFAULT_LOCALE=en

# Premium Features
NEXT_PUBLIC_AI_SUGGESTIONS=true
NEXT_PUBLIC_LOCATION_REMINDERS=true
NEXT_PUBLIC_GANTT_CHART=true
```

## Google Calendar Integration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Calendar API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URI: `http://localhost:3000/api/v1/integrations/google/callback`
7. Copy your Client ID and Client Secret

```bash
NEXT_PUBLIC_GOOGLE_CALENDAR_ENABLED=true
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## WhatsApp Integration (via Twilio)

1. Create a [Twilio account](https://www.twilio.com/)
2. Set up WhatsApp sandbox or get an approved WhatsApp number
3. Get your Account SID and Auth Token from Console

```bash
NEXT_PUBLIC_WHATSAPP_ENABLED=true
WHATSAPP_ACCOUNT_SID=your-twilio-account-sid
WHATSAPP_AUTH_TOKEN=your-twilio-auth-token
WHATSAPP_FROM_NUMBER=whatsapp:+14155238886
```

## Telegram Integration

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the prompts
3. Copy your bot token
4. Set up webhook (in production):
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_DOMAIN>/api/v1/integrations/telegram/webhook
   ```

```bash
NEXT_PUBLIC_TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_BOT_USERNAME=YourBotUsername
```

## Quick Start

To enable all integrations for development:

```bash
# Add these to your .env file

# Google Calendar
NEXT_PUBLIC_GOOGLE_CALENDAR_ENABLED=true
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# WhatsApp (optional)
NEXT_PUBLIC_WHATSAPP_ENABLED=false

# Telegram
NEXT_PUBLIC_TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_BOT_USERNAME=xxx
```

## Disabling Integrations

To completely hide an integration from the UI, set its enabled flag to `false`:

```bash
NEXT_PUBLIC_GOOGLE_CALENDAR_ENABLED=false
NEXT_PUBLIC_WHATSAPP_ENABLED=false
NEXT_PUBLIC_TELEGRAM_ENABLED=false
```

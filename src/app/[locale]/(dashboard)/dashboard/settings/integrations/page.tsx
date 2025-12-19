'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntegrations, useIntegrationActions } from '@/hooks/use-integrations';
import { 
  Loader2, Check, X, ExternalLink, ArrowLeft, Calendar, MessageCircle, 
  Send, Zap, Shield, Bell, Clock, Link2, Unlink, Settings2,
  Sparkles, CheckCircle2, XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface IntegrationCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  gradient: string;
  backgroundColor: string;
  features: string[];
  available: boolean;
  connected: boolean;
  connectedInfo?: string;
  connectedAt?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onTest?: () => Promise<void>;
  onConfigure?: () => void;
  isLoading: boolean;
  isTesting?: boolean;
}

function IntegrationCard({
  id,
  name,
  description,
  icon,
  iconBg,
  gradient,
  backgroundColor,
  features,
  available,
  connected,
  connectedInfo,
  connectedAt,
  onConnect,
  onDisconnect,
  onTest,
  onConfigure,
  isLoading,
  isTesting,
}: IntegrationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative h-full"
    >
      {/* Background Gradient Glow */}
      <div 
        className={cn(
          "absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
          gradient
        )}
      />
      
      {/* Card */}
      <div className={cn("relative bg-card rounded-2xl border border-border/50 overflow-hidden backdrop-blur-sm h-full flex flex-col", backgroundColor)}>
        {/* Top Gradient Bar */}
        
        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={cn(
                "size-14 rounded-2xl flex items-center justify-center shadow-lg",
                iconBg
              )}>
                <Icon icon={icon} className="size-8" />
              </div>
              
              {/* Title & Status */}
              <div>
                <h3 className="text-lg font-semibold mb-1">{name}</h3>
                <div className="flex items-center gap-2">
                  {connected ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                      <CheckCircle2 className="size-3 mr-1" />
                      Connected
                    </Badge>
                  ) : available ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      Not connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                      <Clock className="size-3 mr-1" />
                      Coming Soon
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Toggle Switch for connected */}
            {available && connected && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Active</span>
                <Switch checked={connected} onCheckedChange={() => onDisconnect()} />
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {description}
          </p>

          {/* Features */}
          <div className="space-y-2 mb-6 flex-1">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className={cn(
                  "size-5 rounded-full flex items-center justify-center",
                  connected ? "bg-primary" : "bg-green-500"
                )}>
                  <Check className="size-3" />
                </div>
                <span className={cn(
                  connected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Connection Info */}
          {connected && connectedInfo && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 mb-4">
              <Link2 className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Linked: <span className="font-medium text-foreground">{connectedInfo}</span>
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-auto">
            {available ? (
              connected ? (
                <>
                  {onTest && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onTest}
                      disabled={isLoading || isTesting}
                      className="gap-1.5"
                    >
                      {isTesting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                      Test
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    disabled={isLoading}
                    onClick={onConfigure}
                  >
                    <Settings2 className="size-4 mr-2" />
                    Configure
                  </Button>
                  <Button 
                    size="icon"
                    className="text-white bg-red-500 hover:text-white hover:bg-red-600"
                    onClick={onDisconnect}
                    disabled={isLoading}
                    style={{backgroundColor: '#fb2c36'}}
                  >
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Unlink className="size-4" />
                    )}
                  </Button>
                </>
              ) : (
                <Button 
                  className={cn("w-full group/btn", gradient)}
                  onClick={onConnect}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="size-4 mr-2 group-hover/btn:animate-pulse" />
                  )}
                  Connect {name}
                </Button>
              )
            ) : (
              <Button className="w-full" disabled variant="secondary">
                <Clock className="size-4 mr-2" />
                Coming Soon
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function IntegrationsPage() {
  const router = useRouter();
  const { integrations, isLoading, mutate } = useIntegrations();
  const { connectGoogleCalendar, connectWhatsApp, connectTelegram, disconnect, isLoading: isActionLoading } = useIntegrationActions();
  
  const [showWhatsAppDialog, setShowWhatsAppDialog] = React.useState(false);
  const [showTelegramDialog, setShowTelegramDialog] = React.useState(false);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [telegramChatId, setTelegramChatId] = React.useState('');
  const [showDisconnectDialog, setShowDisconnectDialog] = React.useState(false);
  const [disconnectProvider, setDisconnectProvider] = React.useState<{ provider: string; name: string } | null>(null);

  // Check for success/error params on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');

    if (success === 'google_connected') {
      toast.success('Google Calendar connected successfully!', {
        icon: <CheckCircle2 className="size-5 text-emerald-500" />,
      });
      mutate();
      router.replace('/dashboard/settings/integrations');
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        oauth_denied: 'You denied the authorization request',
        no_code: 'Authorization code not received',
        token_exchange_failed: 'Failed to exchange authorization code',
        unknown: 'An unknown error occurred',
      };
      toast.error(errorMessages[error] || 'Connection failed', {
        icon: <XCircle className="size-5 text-destructive" />,
      });
      router.replace('/dashboard/settings/integrations');
    }
  }, [mutate, router]);

  const handleWhatsAppConnect = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    
    const success = await connectWhatsApp(phoneNumber.trim());
    if (success) {
      toast.success('WhatsApp connected successfully!');
      setShowWhatsAppDialog(false);
      setPhoneNumber('');
      mutate();
    } else {
      toast.error('Failed to connect WhatsApp');
    }
  };

  const handleTelegramConnect = async () => {
    if (!telegramChatId.trim()) {
      toast.error('Please enter your Telegram Chat ID');
      return;
    }
    
    const success = await connectTelegram(telegramChatId.trim());
    if (success) {
      toast.success('Telegram connected successfully!');
      setShowTelegramDialog(false);
      setTelegramChatId('');
      mutate();
    } else {
      toast.error('Failed to connect Telegram');
    }
  };

  const handleDisconnectConfirm = async () => {
    if (!disconnectProvider) return;
    const { provider, name } = disconnectProvider;
    setShowDisconnectDialog(false);
    setDisconnectProvider(null);
    await handleDisconnect(provider, name);
  };

  const handleDisconnectRequest = (provider: string, name: string) => {
    setDisconnectProvider({ provider, name });
    setShowDisconnectDialog(true);
  };

  const handleDisconnect = async (provider: string, name: string) => {
    if (provider === 'whatsapp') {
        try {
            await fetch('/api/v1/integrations/whatsapp', { 
                method: 'POST', 
                body: JSON.stringify({ action: 'logout' }) 
            });
            toast.success('WhatsApp disconnected');
            setWaStatus(null);
            mutate(data => data ? { ...data, whatsapp: { ...data.whatsapp, connected: false } } : data, false);
        } catch(e) {
            toast.error('Failed to disconnect WhatsApp');
        }
        return;
    }

    const success = await disconnect(provider);
    if (success) {
      toast.success(`${name} disconnected`);
      mutate();
    } else {
      toast.error(`Failed to disconnect ${name}`);
    }
  };

  const [testingProvider, setTestingProvider] = React.useState<string | null>(null);
  
  // WhatsApp Self-Hosted Logic
  const [whatsappMode, setWhatsappMode] = React.useState<'business' | 'web'>('web');
  const [waStatus, setWaStatus] = React.useState<any>(null); // { status, qr }
  const [qrLoading, setQrLoading] = React.useState(false);

  // Poll once on mount to check status
  React.useEffect(() => {
    fetch('/api/v1/integrations/whatsapp')
        .then(res => res.json())
        .then(data => setWaStatus(data))
        .catch(err => console.error(err));
  }, []);

  // Poll for QR Code when dialog is open and in 'web' mode
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showWhatsAppDialog && whatsappMode === 'web') {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/v1/integrations/whatsapp');
                const data = await res.json();
                setWaStatus(data);
            } catch(e) { console.error(e); }
        };
        
        fetchStatus();
        interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [showWhatsAppDialog, whatsappMode]);

  const initWhatsApp = async () => {
      setQrLoading(true);
      try {
        await fetch('/api/v1/integrations/whatsapp', { method: 'POST', body: JSON.stringify({ action: 'initialize' }) });
        // Status poll will pick it up
      } catch (e) {
        toast.error('Failed to start WhatsApp client');
      }
      setQrLoading(false);
  };

  const [recipientPhone, setRecipientPhone] = React.useState('');

  React.useEffect(() => {
      if (integrations?.whatsapp?.phoneNumber) {
          setRecipientPhone(integrations.whatsapp.phoneNumber);
      }
  }, [integrations?.whatsapp?.phoneNumber]);

  const handleSaveRecipient = async () => {
      if (!recipientPhone) return;
      try {
          // Save the recipient number as externalId in the integration record
          const res = await fetch('/api/v1/integrations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  provider: 'whatsapp', 
                  externalId: recipientPhone,
                  isActive: true
              })
          });
          
          if (res.ok) {
             toast.success('Recipient number saved successfully');
             mutate();
          } else {
             toast.error('Failed to save settings');
          }
      } catch (e) {
          toast.error('Error saving settings');
      }
  };

  const handleTest = async (provider: string, name: string) => {
    let phoneNumber = null;
    
    if (provider === 'whatsapp') {
        const input = window.prompt("Enter phone number to receive test message (e.g. +123456789):");
        if (!input) return;
        phoneNumber = input;

        // Use direct route for WhatsApp to ensure using the active memory instance
        setTestingProvider(provider);
        try {
            const response = await fetch('/api/v1/integrations/whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'send_test', phoneNumber }),
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                toast.success('Test message sent!');
            } else {
                toast.error(result.error || 'Failed to send test message');
            }
        } catch (error) {
            toast.error('Failed to send test message');
        } finally {
            setTestingProvider(null);
        }
        return;
    }

    setTestingProvider(provider);
    try {
      const response = await fetch('/api/v1/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`Test message sent to ${name}!`, {
          description: result.message,
        });
      } else {
        toast.error(`Failed to send test message`, {
          description: result.error || 'Unknown error',
        });
      }
    } catch (error) {
      toast.error(`Failed to send test message`);
    } finally {
      setTestingProvider(null);
    }
  };

  const integrationsList = [
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      description: 'Sync your tasks with Google Calendar. See all your tasks as calendar events and never miss a deadline.',
      icon: 'logos:google-calendar',
      iconBg: 'bg-white shadow-md',
      gradient: '',
      features: [
        'Two-way sync with Calendar',
        'Automatic event creation',
        'Smart reminders',
        'Multiple calendar support',
      ],
      backgroundColor: 'analytics-gradient-blue',
      available: integrations?.googleCalendar?.available ?? false,
      connected: integrations?.googleCalendar?.connected ?? false,
      connectedAt: integrations?.googleCalendar?.connectedAt,
      onConnect: connectGoogleCalendar,
      onDisconnect: () => handleDisconnectRequest('google_calendar', 'Google Calendar'),
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: 'Get instant task reminders and notifications directly to your WhatsApp. Stay on top of your to-dos.',
      icon: 'logos:whatsapp-icon',
      iconBg: 'bg-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-emerald',
      features: [
        'Task reminder notifications',
        'Due date alerts',
        'Daily summary messages',
        'Quick task replies',
      ],
      available: integrations?.whatsapp?.available ?? false,
      connected: (integrations?.whatsapp?.connected ?? false) || waStatus?.status === 'CONNECTED',
      connectedInfo: (waStatus?.status === 'CONNECTED') ? 'Self-Hosted Device' : integrations?.whatsapp?.phoneNumber,
      onConnect: () => setShowWhatsAppDialog(true),
      onConfigure: () => setShowWhatsAppDialog(true),
      onDisconnect: () => handleDisconnectRequest('whatsapp', 'WhatsApp'),
      onTest: () => handleTest('whatsapp', 'WhatsApp'),
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Connect with our Telegram bot to manage tasks on the go. Create, update, and complete tasks via chat.',
      icon: 'logos:telegram',
      iconBg: 'bg-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-sky',
      features: [
        'Task notifications',
        'Create tasks via chat',
        'View task list',
        'Mark tasks complete',
      ],
      available: integrations?.telegram?.available ?? false,
      connected: integrations?.telegram?.connected ?? false,
      connectedInfo: integrations?.telegram?.chatId ? `Chat ID: ${integrations.telegram.chatId}` : undefined,
      onConnect: () => setShowTelegramDialog(true),
      onDisconnect: () => handleDisconnectRequest('telegram', 'Telegram'),
      onTest: () => handleTest('telegram', 'Telegram'),
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Bring task management to your team workspace. Create and manage tasks without leaving Slack.',
      icon: 'logos:slack-icon',
      iconBg: 'bg-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-purple',
      features: [
        'Create tasks from messages',
        'Team notifications',
        'Slash commands',
        'Channel integrations',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Turn emails into tasks. Get reminders and manage your inbox from within TaskFlow.',
      icon: 'logos:google-gmail',
      iconBg: 'bg-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-red',
      features: [
        'Email to task conversion',
        'Inbox notifications',
        'Email reminders',
        'Attachment sync',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect TaskFlow with 5,000+ apps. Automate your workflows and save hours every week.',
      icon: 'simple-icons:zapier',
      iconBg: 'bg-orange-500 text-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-orange',
      features: [
        'Connect 5,000+ apps',
        'Custom automations',
        'Trigger actions',
        'No-code workflows',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'siri',
      name: 'Siri',
      description: 'Use voice commands to create and manage tasks. Perfect for hands-free productivity.',
      icon: 'simple-icons:apple',
      iconBg: 'bg-zinc-900 text-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-zinc',
      features: [
        'Voice task creation',
        'Smart reminders',
        'Shortcuts integration',
        'Hands-free control',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'jira',
      name: 'Jira',
      description: 'Sync with Jira issues. Keep your development tasks in sync with your personal workflow.',
      icon: 'logos:jira',
      iconBg: 'bg-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-blue',
      features: [
        'Issue sync',
        'Sprint integration',
        'Status updates',
        'Comment sync',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'trello',
      name: 'Trello',
      description: 'Import and sync Trello boards. Manage your cards alongside your TaskFlow tasks.',
      icon: 'logos:trello',
      iconBg: 'bg-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-sky',
      features: [
        'Board sync',
        'Card import',
        'Checklist sync',
        'Due date alignment',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'monday',
      name: 'Monday.com',
      description: 'Connect with Monday.com boards. Sync items and updates between platforms.',
      icon: 'simple-icons:monday',
      iconBg: 'bg-[#ff3d57] text-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-red',
      features: [
        'Board sync',
        'Item updates',
        'Status mapping',
        'Automation triggers',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'clickup',
      name: 'ClickUp',
      description: 'Sync with ClickUp tasks and spaces. Unified task management across platforms.',
      icon: 'simple-icons:clickup',
      iconBg: 'bg-gradient-to-br from-pink-500 to-violet-500 text-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-purple',
      features: [
        'Task sync',
        'Space integration',
        'Custom fields',
        'Time tracking sync',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'asana',
      name: 'Asana',
      description: 'Import Asana projects and tasks. Keep everything synchronized effortlessly.',
      icon: 'logos:asana-icon',
      iconBg: 'bg-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-orange',
      features: [
        'Project sync',
        'Task import',
        'Subtask support',
        'Custom fields',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'todoist',
      name: 'Todoist',
      description: 'Migrate from Todoist or sync tasks. Best of both worlds for power users.',
      icon: 'simple-icons:todoist',
      iconBg: 'bg-[#e44332] text-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-red',
      features: [
        'Full task sync',
        'Label mapping',
        'Priority sync',
        'Easy migration',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'fireflies',
      name: 'Fireflies.ai',
      description: 'Auto-create tasks from meeting transcriptions. Never miss an action item.',
      icon: 'solar:magic-stick-3-linear',
      iconBg: 'bg-purple-500 text-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-purple',
      features: [
        'Meeting transcription',
        'Auto task creation',
        'Action item detection',
        'Meeting summaries',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'pabbly',
      name: 'Pabbly Connect',
      description: 'Automate workflows with Pabbly. Connect TaskFlow to 1000+ apps.',
      icon: 'solar:link-round-linear',
      iconBg: 'bg-blue-600 text-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-blue',
      features: [
        'Workflow automation',
        'Multi-step triggers',
        'Data mapping',
        'Scheduled tasks',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'make',
      name: 'Make.com',
      description: 'Build powerful automations visually. Connect TaskFlow with any service.',
      icon: 'simple-icons:integromat',
      iconBg: 'bg-violet-600 text-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-purple',
      features: [
        'Visual automation builder',
        'Complex workflows',
        'Error handling',
        'Data transformation',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'integrately',
      name: 'Integrately',
      description: 'One-click automations ready to use. The easiest way to connect your apps.',
      icon: 'solar:bolt-linear',
      iconBg: 'bg-cyan-500 text-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-sky',
      features: [
        'Ready-made automations',
        'One-click setup',
        '500+ app connections',
        'Smart triggers',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'google_drive',
      name: 'Google Drive',
      description: 'Attach files from Google Drive. Access your documents without switching apps.',
      icon: 'logos:google-drive',
      iconBg: 'bg-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-emerald',
      features: [
        'File attachments',
        'Quick access',
        'Shared drive support',
        'Auto-sync',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      description: 'Connect your Microsoft OneDrive. Seamless file management for Microsoft users.',
      icon: 'logos:microsoft-onedrive',
      iconBg: 'bg-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-blue',
      features: [
        'File attachments',
        'SharePoint support',
        'Office integration',
        'Auto-sync',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Attach files from Dropbox. Your cloud storage, integrated with your tasks.',
      icon: 'logos:dropbox',
      iconBg: 'bg-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-sky',
      features: [
        'File attachments',
        'Folder sync',
        'Paper integration',
        'Team folders',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
    {
      id: 'box',
      name: 'Box',
      description: 'Enterprise file management with Box. Secure document attachments for teams.',
      icon: 'simple-icons:box',
      iconBg: 'bg-blue-600 text-white shadow-md',
      gradient: '',
      backgroundColor: 'analytics-gradient-blue',
      features: [
        'Enterprise security',
        'File attachments',
        'Workflow integration',
        'Version control',
      ],
      available: false,
      connected: false,
      onConnect: () => {},
      onDisconnect: () => {},
    },
  ];

  const connectedCount = integrationsList.filter(i => i.connected).length;
  const availableCount = integrationsList.filter(i => i.available).length;

  return (
    <div className="min-h-screen container mx-auto max-w-7xl">
      {/* Hero Header */}
      <div className="relative overflow-hidden  backdrop-blur-xl">
      

        <div className="  py-6 relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="shrink-0 rounded-full"
                >
                  <ArrowLeft className="size-5" />
                </Button>
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  <Zap className="size-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                  <p className="text-muted-foreground">
                    Supercharge your productivity with powerful app connections
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{connectedCount}</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold">{availableCount}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-muted-foreground">{integrationsList.length - availableCount}</p>
                <p className="text-xs text-muted-foreground">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-primary/30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <p className="text-sm text-muted-foreground">Loading integrations...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-2xl main-gradient-primary-bg border border-primary/10"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Pro tip: Connect your calendar first</h3>
                  <p className="text-sm text-muted-foreground">
                    Google Calendar integration gives you the best overview of your tasks and schedule in one place.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {integrationsList.map((integration, index) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <IntegrationCard
                      {...integration}
                      isLoading={isActionLoading}
                      isTesting={testingProvider === integration.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Security Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <Shield className="size-4" />
              <span>All connections are secure and encrypted. We never store your third-party credentials.</span>
            </motion.div>
          </>
        )}
      </div>

      {/* WhatsApp Connection Dialog */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="size-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Icon icon="logos:whatsapp-icon" className="size-7" />
              </div>
              <div>
                <DialogTitle>Connect WhatsApp</DialogTitle>
                <DialogDescription>
                  Scan the QR code to connect your personal WhatsApp
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
             <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-muted/20 min-h-[300px]">
                {waStatus?.status === 'CONNECTED' ? (
                    <div className="flex flex-col items-center gap-4 text-center w-full">
                        <div>
                          <CheckCircle2 className="size-16 text-green-500 mx-auto" />
                          <h3 className="font-semibold text-lg mt-2">WhatsApp Connected!</h3>
                          <p className="text-sm text-muted-foreground">Your instance is ready to send notifications.</p>
                        </div>
                        
                        <div className="w-full max-w-sm border-t pt-4 mt-2">
                           <Label htmlFor="recipient" className="text-left block mb-2">Notification Recipient Number</Label>
                           <div className="flex gap-2">
                              <Input 
                                  id="recipient" 
                                  placeholder="+1234567890" 
                                  value={recipientPhone} 
                                  onChange={(e) => setRecipientPhone(e.target.value)}
                              />
                              <Button onClick={handleSaveRecipient}>Save</Button>
                           </div>
                           <p className="text-xs text-muted-foreground mt-1 text-left">
                              This number will receive your task reminders.
                           </p>
                        </div>
                    </div>
                ) : waStatus?.qr ? (
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-medium mb-2">Scan this QR Code with WhatsApp</p>
                        <img src={waStatus.qr} alt="WhatsApp QR" className="size-64 border rounded-lg shadow-sm" />
                        <p className="text-xs text-muted-foreground">Open WhatsApp on your phone &gt; Settings &gt; Linked Devices</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20">
                           <Icon icon="mdi:qrcode-scan" className="size-8 text-green-600" />
                        </div>
                        <div>
                            <p className="font-medium">Start WhatsApp Service</p>
                            <p className="text-sm text-muted-foreground">This will start a local WhatsApp Web instance.</p>
                        </div>
                        <Button onClick={initWhatsApp} disabled={qrLoading} variant="outline">
                           {qrLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                           Generate QR Code
                        </Button>
                    </div>
                )}
             </div>
             <div className="text-xs text-muted-foreground text-center">
                <b>Note:</b> This runs on your server. Keep this window open until connected.
             </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-start">
            <Button variant="ghost" onClick={() => setShowWhatsAppDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Telegram Connection Dialog */}
      <Dialog open={showTelegramDialog} onOpenChange={setShowTelegramDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="size-12 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <Icon icon="logos:telegram" className="size-7" />
              </div>
              <div>
                <DialogTitle>Connect Telegram</DialogTitle>
                <DialogDescription>
                  Manage tasks via our Telegram bot
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Steps */}
            <div className="space-y-3">
              {[
                { step: 1, text: 'Open Telegram and search for @TaskFlowBot' },
                { step: 2, text: 'Send /start to begin' },
                { step: 3, text: 'Copy your Chat ID from the bot response' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="size-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {step}
                  </div>
                  <p className="text-sm">{text}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="chatId">Telegram Chat ID</Label>
              <div className="relative">
                <Input
                  id="chatId"
                  placeholder="123456789"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="pl-10"
                />
                <Send className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <a
                href="https://t.me/TaskFlowBot"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon icon="logos:telegram" className="size-4 mr-2" />
                Open TaskFlow Bot
                <ExternalLink className="size-3 ml-auto" />
              </a>
            </Button>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowTelegramDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleTelegramConnect} 
              disabled={isActionLoading}
              className="bg-sky-500 hover:bg-sky-600"
            >
              {isActionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Connect Telegram
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect {disconnectProvider?.name}? This will stop all notifications and integrations with this service.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDisconnectDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDisconnectConfirm} 
              disabled={isActionLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isActionLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

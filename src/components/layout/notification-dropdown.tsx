"use client";

import { Bell, Check, Clock, AlertCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  titleKey: string;
  messageKey: string;
  timestamp: string;
  read: boolean;
}

const dummyNotifications: Notification[] = [
  {
    id: "1",
    type: "error",
    titleKey: "systemAlert",
    messageKey: "databaseConnectionFailed",
    timestamp: "2 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "warning",
    titleKey: "maintenanceNotice",
    messageKey: "maintenanceBeginSoon",
    timestamp: "15 minutes ago",
    read: false,
  },
  {
    id: "3",
    type: "success",
    titleKey: "backupCompleted",
    messageKey: "dailyBackupCompleted",
    timestamp: "1 hour ago",
    read: true,
  },
  {
    id: "4",
    type: "info",
    titleKey: "newFeature",
    messageKey: "checkAnalyticsFeature",
    timestamp: "2 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "warning",
    titleKey: "storageWarning",
    messageKey: "storageUsageWarning",
    timestamp: "3 hours ago",
    read: false,
  },
];

export function NotificationDropdown() {
  const t = useTranslations("notifications");
  const tTypes = useTranslations("notifications.types");
  const tMessages = useTranslations("notifications.messages");

  const unreadCount = dummyNotifications.filter(n => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "success":
        return <Check className="h-4 w-4 text-green-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      case "success":
        return "default";
      case "info":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-11 w-11 rounded-full border border-border/60 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0 shadow-lg border-border/60"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <h3 className="font-semibold text-sm">
              {t("title")}
            </h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} {t("unread")}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Check className="h-4 w-4" />
            <span className="sr-only">
              {t("markAllRead")}
            </span>
          </Button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {dummyNotifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {t("noNotifications")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {dummyNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-accent/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {tMessages(notification.titleKey)}
                        </h4>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-primary rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {tMessages(notification.messageKey)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {notification.timestamp}
                          </span>
                        </div>
                        <Badge
                          variant={getTypeColor(notification.type) as "default" | "secondary" | "destructive" | "outline"}
                          className="text-xs px-1.5 py-0.5"
                        >
                          {tTypes(notification.type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {dummyNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-sm">
                {t("viewAll")}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
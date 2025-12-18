"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Mail,
  Phone,
  User as UserIcon,
  Shield,
  Clock,
} from "lucide-react";
import { User } from "./types";
import { format } from "date-fns";

interface ViewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function ViewUserDialog({
  open,
  onOpenChange,
  user,
}: ViewUserDialogProps) {
  if (!user) return null;

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: { className: "bg-red-50 text-red-700 border-red-200", label: "Administrator" },
      MANAGER: { className: "bg-blue-50 text-blue-700 border-blue-200", label: "Manager" },
      STAFF: { className: "bg-green-50 text-green-700 border-green-200", label: "Staff" },
      RECEPTIONIST: { className: "bg-purple-50 text-purple-700 border-purple-200", label: "Receptionist" },
      HOUSEKEEPING: { className: "bg-orange-50 text-orange-700 border-orange-200", label: "Housekeeping" },
    };
    const config = variants[role as keyof typeof variants] || variants.STAFF;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 w-fit">
        Inactive
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-linear-to-r from-primary/5 via-primary/3 to-transparent">
          <div className="flex items-center gap-4">
            <div className="rounded-3xl bg-primary/15 p-3 shadow-sm">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {user.fullName}
              </DialogTitle>
              <div className="text-sm text-muted-foreground">
                @{user.username} • {getRoleBadge(user.role)} • {getStatusBadge(user.active)}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2 rounded-full">
              <TabsTrigger value="details" className="rounded-full">
                Details
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-full">
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[500px] px-6 pb-6">
            <TabsContent value="details" className="mt-4 space-y-4">
              {/* Account Information */}
              <div className="rounded-3xl border border-border/60 bg-card/50 p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Username</p>
                    <p className="text-sm font-medium">@{user.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <div className="mt-1">{getRoleBadge(user.role)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(user.active)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created At</p>
                    <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Updated</p>
                    <p className="text-sm font-medium">{formatDate(user.updatedAt)}</p>
                  </div>
                  {user.lastLoginAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Last Login</p>
                      <p className="text-sm font-medium">{formatDate(user.lastLoginAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="rounded-3xl border border-border/60 bg-card/50 p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="text-sm font-medium">{user.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}
                  {user.language && (
                    <div>
                      <p className="text-xs text-muted-foreground">Language</p>
                      <p className="text-sm font-medium">{user.language}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Information */}
              <div className="rounded-3xl border border-border/60 bg-card/50 p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Security Information</h3>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Password</p>
                    <p className="text-sm font-medium">••••••••</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="text-xs text-muted-foreground">
                  Password is encrypted and cannot be viewed for security reasons.
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-4 space-y-4">
              <div className="rounded-3xl border border-border/60 bg-card/50 p-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Activity tracking coming soon</p>
                <p className="text-xs text-muted-foreground mt-2">
                  User activity logs will be displayed here in future updates.
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
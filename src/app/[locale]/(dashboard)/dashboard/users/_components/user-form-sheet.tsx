"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X, User } from "lucide-react";
import { FormData } from "./types";
import { CustomSheetHeader } from "@/components/layout/custom-sheet-header";

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  isEditing: boolean;
  submitting: boolean;
  onSubmit: () => void;
  onClear?: () => void;
}

export function UserFormSheet({
  open,
  onOpenChange,
  formData,
  setFormData,
  isEditing,
  submitting,
  onSubmit,
  onClear,
}: UserFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} >
      <SheetContent  side="left" className=" gap-0 overflow-y-auto overflow-visible">
        <CustomSheetHeader
          title={isEditing ? "Edit User" : "New User"}
          description={
            isEditing
              ? "Update user information and account details"
              : "Create a new user account with complete information"
          }
          icon={User}
        />

        <ScrollArea className="h-[calc(100vh-150px)] pr-4 px-5 overflow-x-visible">
          <div className="space-y-6 py-6">
            {/* Account Information */}
            <div className="rounded-3xl border border-border/60 bg-card/50 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username" className="text-xs text-muted-foreground mb-2 block">
                    Username *
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="rounded-full"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs text-muted-foreground mb-2 block">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-full"
                    required
                  />
                </div>
                {!isEditing && (
                  <>
                    <div>
                      <Label htmlFor="password" className="text-xs text-muted-foreground mb-2 block">
                        Password *
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={formData.password || ""}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="rounded-full"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground mb-2 block">
                        Confirm Password *
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword || ""}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="rounded-full"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="rounded-3xl border border-border/60 bg-card/50 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-xs text-muted-foreground mb-2 block">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="rounded-full"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs text-muted-foreground mb-2 block">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <Label htmlFor="language" className="text-xs text-muted-foreground mb-2 block">
                    Language
                  </Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger id="language" className="rounded-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role" className="text-xs text-muted-foreground mb-2 block">
                    Role *
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger id="role" className="rounded-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="rounded-3xl border border-border/60 bg-card/50 p-5">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked as boolean })}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor="active"
                  className="text-sm font-medium cursor-pointer"
                >
                  Active User
                </Label>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="flex gap-2 pt-4 border-t border-border/60">
          {onClear && (
            <Button
              type="button"
              variant="outline"
              onClick={onClear}
              disabled={submitting}
              className="rounded-full"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
          <SheetClose asChild>
            <Button variant="outline" className="flex-1 rounded-full">
              Cancel
            </Button>
          </SheetClose>
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="rounded-full"
          >
            <Save className="mr-2 h-4 w-4" />
            {submitting ? "Saving..." : isEditing ? "Update User" : "Create User"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
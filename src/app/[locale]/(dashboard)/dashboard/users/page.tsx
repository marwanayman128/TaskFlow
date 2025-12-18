"use client";

import { MetricCard } from "@/components/layout/metric-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Filter, Plus, RefreshCcw, RotateCcw, Search, Shield, UserCheck, Users, UserX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { UserFormSheet } from "./_components/user-form-sheet";
import { UsersTable } from "./_components/users-table";
import { DeleteUserDialog } from "./_components/delete-user-dialog";
import { FormData, User } from "./_components/types";
import { ViewUserDialog } from "./_components/view-user-dialog";
import { useExport } from "@/hooks/use-export";
import { ExportConfirmDialog } from "@/components/layout/export-confirm-dialog";
import { formatDateForExport, formatBooleanForExport } from "@/lib/export-utils";

type UserRequestPayload = {
  username: string;
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  language?: string;
  role: string;
  active: boolean;
};

export default function UsersPage() {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [data, setData] = useState<{
    users: User[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    avatar: "",
    phone: "",
    language: "",
    role: "USER",
    active: true,
  });

  // Export functionality
  const { handleExport: triggerExport, isExportDialogOpen, exportInfo, confirmExport, cancelExport } = useExport({
    filename: `users-export-${new Date().toISOString().split('T')[0]}.csv`,
    tableName: 'users',
    columns: [
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'fullName', label: 'Full Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'role', label: 'Role' },
      { key: 'language', label: 'Language' },
      { key: 'active', label: 'Active', format: formatBooleanForExport },
      { key: 'createdAt', label: 'Created At', format: formatDateForExport },
      { key: 'updatedAt', label: 'Updated At', format: formatDateForExport },
    ],
    successMessage: 'Users exported successfully',
  });

  // Data fetching
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/users");
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", res.status, errorText);
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      const result = await res.json();
      setData(result.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { users } = useMemo(
    () => data || { users: [] },
    [data]
  );

  // Filtering logic
  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) return [];

    let filtered = users;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((user) => {
        const username = (user.username || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        const fullName = (user.fullName || "").toLowerCase();

        return (
          username.includes(query) ||
          email.includes(query) ||
          fullName.includes(query)
        );
      });
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((user) => user.active);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((user) => !user.active);
    }

    return filtered;
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  // Summary calculations
  const summary = useMemo(() => {
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter((u) => u.active).length;
    const adminUsers = filteredUsers.filter((u) => u.role === "ADMIN").length;
    const inactiveUsers = filteredUsers.filter((u) => !u.active).length;

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      inactiveUsers,
    };
  }, [filteredUsers]);

  // Handlers
  const handleRefresh = () => {
    fetchData();
    toast.success("Users data has been refreshed");
  };

  const handleExport = () => {
    triggerExport(filteredUsers);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
    toast.success("Filters have been reset");
  };

  const handleView = (user: User) => {
    setViewingUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
      fullName: user.fullName,
      avatar: user.avatar || "",
      phone: user.phone || "",
      language: user.language || "",
      role: user.role,
      active: user.active,
    });
    setIsSheetOpen(true);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const res = await fetch(`/api/v1/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(`User ${user.active ? "deactivated" : "activated"} successfully`);
      fetchData();
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    try {
      const res = await fetch(`/api/v1/users/${deletingUser.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
      fetchData();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (!formData.username || !formData.email || !formData.fullName || !formData.role) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (!editingUser && (!formData.password || formData.password !== formData.confirmPassword)) {
        toast.error("Please provide matching passwords");
        return;
      }

      const baseRoute = "/api/v1/users";
      const method = editingUser ? "PUT" : "POST";
      const url = editingUser ? `${baseRoute}/${editingUser.id}` : baseRoute;

      const requestData: UserRequestPayload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        phone: formData.phone?.trim() || undefined,
        language: formData.language?.trim() || undefined,
        role: formData.role,
        active: formData.active,
      };

      if (formData.password && !editingUser) {
        requestData.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Response error:", errorText);
        throw new Error("Failed to save");
      }

      toast.success(`User ${editingUser ? "updated" : "created"} successfully`);
      setIsSheetOpen(false);
      setEditingUser(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        avatar: "",
        phone: "",
        language: "",
        role: "USER",
        active: true,
      });
      fetchData();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(`Failed to ${editingUser ? "update" : "create"} user`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setFormData({
              username: "",
              email: "",
              password: "",
              confirmPassword: "",
              fullName: "",
              avatar: "",
              phone: "",
              language: "",
              role: "USER",
              active: true,
            });
            setEditingUser(null);
            setIsSheetOpen(true);
          }}
          className="rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Users"
            value={summary.totalUsers.toString()}
            icon={Users}
            iconClassName="analytics-icon-emerald"
            gradientClassName="analytics-gradient-emerald"
            chart={{
              path: "M2 22L10 14L16 18L26 8L34 12L46 4",
              colorClassName: "analytics-sparkline-emerald",
            }}
            trend={{
              value: "+5%",
              direction: "up",
              tone: "positive",
            }}
          />
          <MetricCard
            title="Active Users"
            value={summary.activeUsers.toString()}
            icon={UserCheck}
            iconClassName="analytics-icon-sky"
            gradientClassName="analytics-gradient-sky"
            chart={{
              path: "M2 6L12 16L20 12L28 20L38 10L46 18",
              colorClassName: "analytics-sparkline-sky",
            }}
            trend={{
              value: `${summary.activeUsers}`,
              direction: "up",
              tone: "positive",
            }}
          />
          <MetricCard
            title="Administrators"
            value={summary.adminUsers.toString()}
            icon={Shield}
            iconClassName="analytics-icon-amber"
            gradientClassName="analytics-gradient-amber"
            chart={{
              path: "M2 20L10 12L18 14L26 6L34 10L42 4",
              colorClassName: "analytics-sparkline-amber",
            }}
            trend={{
              value: `${summary.adminUsers}`,
              direction: "up",
              tone: "positive",
            }}
          />
          <MetricCard
            title="Inactive Users"
            value={summary.inactiveUsers.toString()}
            icon={UserX}
            iconClassName="analytics-icon-red"
            gradientClassName="analytics-gradient-red"
            chart={{
              path: "M2 10L12 6L20 14L28 8L36 18L46 12",
              colorClassName: "analytics-sparkline-red",
            }}
            trend={{
              value: `${summary.inactiveUsers}`,
              direction: "down",
              tone: "positive",
            }}
          />
        </div>
      )}

      {/* Filters Section */}
      <div className="rounded-3xl border border-border/60 main-gradient-primary-bg p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                Filters
              </h3>
              <p className="text-xs text-muted-foreground">
                Filter users by role and status.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="rounded-full w-[200px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                  <SelectItem value="HOUSEKEEPING">Housekeeping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-full w-[150px]">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh users data</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export users data</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-full"
                    onClick={handleResetFilters}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset all filters</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable
        users={paginatedUsers}
        loading={loading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredUsers.length}
        onPageChange={setCurrentPage}
        onView={handleView}
        onEdit={handleEdit}
        onToggleActive={handleToggleStatus}
        onDelete={handleDelete}
      />

      {/* Dialogs */}
      <ViewUserDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        user={viewingUser}
      />

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        user={deletingUser}
        onConfirm={confirmDelete}
      />

      <UserFormSheet
        key={editingUser?.id || 'new'}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingUser}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      {/* Export Confirmation Dialog */}
      {exportInfo && (
        <ExportConfirmDialog
          open={isExportDialogOpen}
          onOpenChange={cancelExport}
          onConfirm={confirmExport}
          title="Export Users Data"
          description="You are about to export the filtered users data to a CSV file."
          exportInfo={exportInfo}
        />
      )}
    </div>
  );
}
// Global type definitions for the Dashboard Starter Kit

// Trend types for metrics
export type TrendDirection = "up" | "down" | "neutral";
export type TrendTone = "positive" | "negative" | "neutral";

export interface MetricTrend {
  value: string;
  label?: string;
  direction?: TrendDirection;
  tone?: TrendTone;
}

// User types
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "USER";

export interface User {
  id: string;
  organizationId: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string | null;
  phone?: string | null;
  language: string;
  role: UserRole;
  active: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Organization types
export interface Organization {
  id: string;
  code: string;
  nameEn: string;
  nameAr?: string | null;
  logo?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log types
export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "VIEW" | "EXPORT" | "IMPORT";

export interface AuditLog {
  id: string;
  organizationId: string;
  userId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

// Notification types
export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export interface Notification {
  id: string;
  organizationId: string;
  userId?: string | null;
  type: NotificationType;
  titleEn: string;
  titleAr?: string | null;
  messageEn: string;
  messageAr?: string | null;
  read: boolean;
  link?: string | null;
  createdAt: Date;
  readAt?: Date | null;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: unknown;
  };
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Form types
export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  errors: FormFieldError[];
}

// Table types
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationParams;
  onPageChange?: (page: number) => void;
  onSort?: (column: string, order: "asc" | "desc") => void;
}

// Filter types
export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "date" | "dateRange" | "search" | "boolean";
  options?: FilterOption[];
}

// Dashboard stats types
export interface DashboardStat {
  title: string;
  value: string | number;
  trend?: MetricTrend;
  icon?: string;
  description?: string;
}

// Settings types
export interface SystemSettings {
  id: string;
  organizationId: string;
  defaultLanguage: string;
  defaultCurrency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  theme?: string | null;
  customSettings?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

// File types
export interface File {
  id: string;
  organizationId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedById?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

// API Key types
export interface ApiKey {
  id: string;
  organizationId: string;
  name: string;
  key: string;
  lastUsedAt?: Date | null;
  expiresAt?: Date | null;
  active: boolean;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

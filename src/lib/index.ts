/**
 * SaaS Starter Kit - Library Utilities
 * Core utilities for building SaaS applications
 */

// General Utilities
export { cn } from './utils';

// Formatting Utilities
export {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatBytes,
  formatRelativeTime,
  formatDate,
  formatDateTime,
  truncate,
  capitalize,
  slugify,
  getInitials,
  parseQueryString,
  buildQueryString,
} from './formatting';

// Validation Schemas
export {
  // Basic schemas
  emailSchema,
  passwordSchema,
  simplePasswordSchema,
  phoneSchema,
  urlSchema,
  uuidSchema,
  positiveNumberSchema,
  nonNegativeNumberSchema,
  dateStringSchema,
  // Auth schemas
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  // Profile schemas
  profileSchema,
  // Organization schemas
  organizationSchema,
  inviteMemberSchema,
  // Pagination schemas
  paginationSchema,
  searchSchema,
  // Types
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type ChangePasswordInput,
  type ProfileInput,
  type OrganizationInput,
  type InviteMemberInput,
  type PaginationInput,
  type SearchInput,
} from './validation/schemas';

// State Management (Zustand Stores)
export {
  useUserStore,
  useUIStore,
  useNotificationStore,
  useSettingsStore,
  useLoadingStore,
} from './stores';

// Database
export { prisma } from './prisma';

// Authentication
export { auth, signIn, signOut, handlers } from './auth';

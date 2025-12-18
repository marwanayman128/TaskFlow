// User types based on Prisma schema

export interface User {
  id: string;
  organizationId: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string | null;
  phone: string | null;
  language: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "USER";
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormData {
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  phone: string;
  language: string;
  role: string;
  active: boolean;
  password?: string;
  confirmPassword?: string;
}
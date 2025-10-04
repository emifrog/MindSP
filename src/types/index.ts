// Global type definitions
// Will be expanded in subsequent phases

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "USER";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type TenantStatus = "ACTIVE" | "SUSPENDED" | "TRIAL" | "CANCELLED";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  tenantId: string;
  avatar?: string | null;
  phone?: string | null;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  domain: string;
  status: TenantStatus;
  logo?: string | null;
  primaryColor?: string | null;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

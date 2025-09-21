export const APP_NAME = 'MindSP';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Plateforme de gestion pour SDIS';

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';

// Auth Configuration
export const AUTH_TOKEN_KEY = 'mindsp_auth_token';
export const REFRESH_TOKEN_KEY = 'mindsp_refresh_token';
export const TENANT_KEY = 'mindsp_tenant';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user:profile',
  TENANT_INFO: 'tenant:info',
  FMPA_LIST: 'fmpa:list',
  NOTIFICATIONS: 'notifications',
} as const;

// Routes
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  
  // Protected
  DASHBOARD: '/dashboard',
  FMPA: '/dashboard/fmpa',
  MESSAGES: '/dashboard/messages',
  AGENDA: '/dashboard/agenda',
  PERSONNEL: '/dashboard/personnel',
  FORMATIONS: '/dashboard/formations',
  SETTINGS: '/dashboard/settings',
} as const;

// Feature Flags
export const FEATURES = {
  FMPA: true,
  MESSAGING: true,
  AGENDA: true,
  FORMATIONS: true,
  EXPORT_TTA: false,
  OFFLINE_MODE: true,
  PWA: true,
} as const;
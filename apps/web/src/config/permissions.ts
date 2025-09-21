export enum Permission {
    // Global
    VIEW_DASHBOARD = 'view_dashboard',
    
    // FMPA
    VIEW_FMPA = 'view_fmpa',
    CREATE_FMPA = 'create_fmpa',
    EDIT_FMPA = 'edit_fmpa',
    DELETE_FMPA = 'delete_fmpa',
    VALIDATE_PARTICIPATION = 'validate_participation',
    EXPORT_FMPA = 'export_fmpa',
    
    // Messages
    VIEW_MESSAGES = 'view_messages',
    SEND_MESSAGES = 'send_messages',
    CREATE_GROUPS = 'create_groups',
    MODERATE_MESSAGES = 'moderate_messages',
    
    // Personnel
    VIEW_PERSONNEL = 'view_personnel',
    MANAGE_PERSONNEL = 'manage_personnel',
    
    // Formations
    VIEW_FORMATIONS = 'view_formations',
    MANAGE_FORMATIONS = 'manage_formations',
    
    // Admin
    MANAGE_SETTINGS = 'manage_settings',
    MANAGE_USERS = 'manage_users',
    MANAGE_TENANT = 'manage_tenant',
    VIEW_ANALYTICS = 'view_analytics',
  }
  
  export const ROLE_PERMISSIONS = {
    SUPER_ADMIN: Object.values(Permission),
    ADMIN: [
      Permission.VIEW_DASHBOARD,
      Permission.VIEW_FMPA,
      Permission.CREATE_FMPA,
      Permission.EDIT_FMPA,
      Permission.DELETE_FMPA,
      Permission.VALIDATE_PARTICIPATION,
      Permission.EXPORT_FMPA,
      Permission.VIEW_MESSAGES,
      Permission.SEND_MESSAGES,
      Permission.CREATE_GROUPS,
      Permission.MODERATE_MESSAGES,
      Permission.VIEW_PERSONNEL,
      Permission.MANAGE_PERSONNEL,
      Permission.VIEW_FORMATIONS,
      Permission.MANAGE_FORMATIONS,
      Permission.MANAGE_SETTINGS,
      Permission.MANAGE_USERS,
      Permission.VIEW_ANALYTICS,
    ],
    MANAGER: [
      Permission.VIEW_DASHBOARD,
      Permission.VIEW_FMPA,
      Permission.CREATE_FMPA,
      Permission.EDIT_FMPA,
      Permission.VALIDATE_PARTICIPATION,
      Permission.EXPORT_FMPA,
      Permission.VIEW_MESSAGES,
      Permission.SEND_MESSAGES,
      Permission.CREATE_GROUPS,
      Permission.VIEW_PERSONNEL,
      Permission.VIEW_FORMATIONS,
    ],
    USER: [
      Permission.VIEW_DASHBOARD,
      Permission.VIEW_FMPA,
      Permission.VIEW_MESSAGES,
      Permission.SEND_MESSAGES,
      Permission.VIEW_FORMATIONS,
    ],
  } as const;
  
  export function hasPermission(
    userPermissions: string[],
    permission: Permission
  ): boolean {
    return userPermissions.includes(permission);
  }
  
  export function hasAnyPermission(
    userPermissions: string[],
    permissions: Permission[]
  ): boolean {
    return permissions.some(p => userPermissions.includes(p));
  }
  
  export function hasAllPermissions(
    userPermissions: string[],
    permissions: Permission[]
  ): boolean {
    return permissions.every(p => userPermissions.includes(p));
  }
import {
    LayoutDashboard,
    Calendar,
    MessageSquare,
    Users,
    GraduationCap,
    CalendarDays,
    Settings,
    FileText,
    Bell,
  } from 'lucide-react';
  import { Permission } from './permissions';
  
  export interface NavigationItem {
    name: string;
    href: string;
    icon: typeof LayoutDashboard;
    permission?: Permission;
    badge?: number;
    children?: NavigationItem[];
  }
  
  export const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'FMPA',
      href: '/dashboard/fmpa',
      icon: Calendar,
      permission: Permission.VIEW_FMPA,
    },
    {
      name: 'Messages',
      href: '/dashboard/messages',
      icon: MessageSquare,
      permission: Permission.VIEW_MESSAGES,
    },
    {
      name: 'Agenda',
      href: '/dashboard/agenda',
      icon: CalendarDays,
    },
    {
      name: 'Personnel',
      href: '/dashboard/personnel',
      icon: Users,
      permission: Permission.VIEW_PERSONNEL,
    },
    {
      name: 'Formations',
      href: '/dashboard/formations',
      icon: GraduationCap,
      permission: Permission.VIEW_FORMATIONS,
    },
    {
      name: 'Paramètres',
      href: '/dashboard/settings',
      icon: Settings,
      permission: Permission.MANAGE_SETTINGS,
    },
  ];
  
  export const quickActions = [
    {
      name: 'Nouvelle FMPA',
      href: '/dashboard/fmpa/create',
      icon: Calendar,
      permission: Permission.CREATE_FMPA,
      color: 'bg-blue-500',
    },
    {
      name: 'Export TTA',
      href: '/dashboard/exports/tta',
      icon: FileText,
      permission: Permission.EXPORT_FMPA,
      color: 'bg-green-500',
    },
    {
      name: 'Notifications',
      href: '/dashboard/notifications',
      icon: Bell,
      color: 'bg-orange-500',
    },
  ];
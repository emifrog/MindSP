'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { useUIStore } from '../../stores/ui.store';
import { useAuthStore } from '../../stores/auth.store';
import { navigation } from '../../config/navigation';
import { hasPermission, ROLE_PERMISSIONS } from '../../config/permissions';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const userPermissions = user ? ROLE_PERMISSIONS[user.role] : [];

  const filteredNavigation = navigation.filter(
    (item) => !item.permission || hasPermission(userPermissions, item.permission)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300',
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
        'hidden lg:block',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        {sidebarOpen && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-bold">MindSP</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(!sidebarOpen && 'mx-auto')}
        >
          <ChevronLeft className={cn(
            'h-4 w-4 transition-transform',
            !sidebarOpen && 'rotate-180'
          )} />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <nav className="p-2 space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  isActive && 'bg-primary/10 text-primary',
                  !sidebarOpen && 'justify-center'
                )}
                title={!sidebarOpen ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Menu */}
      <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-gray-200 dark:border-gray-700">
        {sidebarOpen ? (
          <div className="flex items-center gap-3 p-2">
            <div className="h-8 w-8 bg-gray-300 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" className="w-full">
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  );
}
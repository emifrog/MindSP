'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { useUIStore } from '../../stores/ui.store';
import { useAuthStore } from '../../stores/auth.store';
import { navigation } from '../../config/navigation';
import { hasPermission, ROLE_PERMISSIONS } from '../../config/permissions';
import { Button } from '../../components/ui/button';

export function MobileNav() {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { user } = useAuthStore();
  const userPermissions = user ? ROLE_PERMISSIONS[user.role] : [];

  const filteredNavigation = navigation.filter(
    (item) => !item.permission || hasPermission(userPermissions, item.permission)
  );

  return (
    <Transition.Root show={mobileMenuOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileMenuOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center justify-between">
                  <Link href="/dashboard" className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">M</span>
                    </div>
                    <span className="text-xl font-bold">MindSP</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                
                <nav className="flex flex-1 flex-col">
                  <ul className="flex flex-1 flex-col gap-y-1">
                    {filteredNavigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                      
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              'group flex gap-x-3 rounded-md p-2 text-sm leading-6',
                              'hover:bg-gray-100 dark:hover:bg-gray-700',
                              isActive && 'bg-primary/10 text-primary'
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Icon className="h-6 w-6 shrink-0" />
                            {item.name}
                            {item.badge && (
                              <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                
                {/* User info */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
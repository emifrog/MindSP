'use client';

import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from '../../ components/layouts/sidebar';
import { Header } from '../../components/layouts/header';
import { MobileNav } from '../../components/layouts/mobile-nav';
import { useUIStore } from '../../stores/ui.store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth(true);
  const { sidebarOpen, sidebarCollapsed } = useUIStore();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Main Content */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          lg:ml-${sidebarCollapsed ? '16' : '64'}
          ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}
        `}
      >
        <Header />
        
        <main className="p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
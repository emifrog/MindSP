import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';
import { useTenantStore } from '../stores/tenant.store';
import { ROUTES } from '../config/constants';

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const { user, isAuthenticated, token, clearAuth } = useAuthStore();
  const { clearTenant } = useTenantStore();
  
  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, requireAuth, router]);
  
  const logout = async () => {
    try {
      // Call logout API
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      clearTenant();
      router.push(ROUTES.LOGIN);
    }
  };
  
  return {
    user,
    isAuthenticated,
    logout,
  };
}
import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    tenantId: session?.user?.tenantId,
    tenantSlug: session?.user?.tenantSlug,
    role: session?.user?.role,
    isAdmin:
      session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN",
    isManager: session?.user?.role === "MANAGER",
  };
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';
import { BrandLoader } from '@/components/layout/BrandLoader';

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Wraps a route that requires admin privileges.
 * Shows the branded loader while auth is loading, redirects to / if not admin.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAdmin, loading } = useAuth();

  // Auth session is loading OR admin role check is still in flight — wait for both
  if (loading || isAdmin === null) {
    return <BrandLoader />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

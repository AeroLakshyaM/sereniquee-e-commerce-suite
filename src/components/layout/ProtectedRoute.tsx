import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Wraps a route that requires admin privileges.
 * Shows a spinner while auth is loading, redirects to / if not admin.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAdmin, loading } = useAuth();

  // Auth session is loading OR admin role check is still in flight — wait for both
  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageLoader } from './common';
import { ROUTES } from '../utils/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && user) {
    const roleHierarchy = { ADMIN: 3, OPERATOR: 2, VIEWER: 1 };
    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      // User doesn't have sufficient permissions
      return <Navigate to={ROUTES.HOME} replace />;
    }
  }

  return <>{children}</>;
}

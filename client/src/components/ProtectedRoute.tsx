import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserProvider } from "@/contexts/UserContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRoaster?: boolean;
  redirectTo?: string;
}

function ProtectedRouteContent({ 
  children, 
  requireAuth = true, 
  requireRoaster = false,
  redirectTo 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  // Redirect to login if authentication required but not authenticated
  if (requireAuth && !isAuthenticated) {
    // Store the attempted location for redirect after login
    return <Navigate to="/api/login" state={{ from: location }} replace />;
  }

  // Redirect to become-roastah if roaster status required but not approved
  // Skip this check for development impersonated users
  if (requireRoaster && isAuthenticated && !(user as any)?.isRoasterApproved && !(user as any)?.id?.startsWith('dev-')) {
    return <Navigate to={redirectTo || "/become-roastah"} replace />;
  }

  // Redirect unauthenticated users from auth-only pages
  if (!requireAuth && isAuthenticated && redirectTo) {
    // In development environments, redirect to dev-login first
    const isDev = window.location.hostname.includes('replit.dev') || window.location.hostname === 'localhost';
    if (isDev && redirectTo === "/home") {
      return <Navigate to="/dev-login" replace />;
    }
    
    // If user is a completed roaster, redirect to seller dashboard instead of home
    if (redirectTo === "/home" && (user as any)?.role === 'roaster' && (user as any)?.isRoasterApproved) {
      return <Navigate to="/seller/dashboard" replace />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  return (
    <UserProvider>
      <ProtectedRouteContent {...props} />
    </UserProvider>
  );
}
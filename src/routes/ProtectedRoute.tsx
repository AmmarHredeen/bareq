import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

/** يحمي اللوحة: غير المسجّلين أو غير الأدمن يُوجَّهون لصفحة الدخول. */
export function ProtectedRoute() {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}

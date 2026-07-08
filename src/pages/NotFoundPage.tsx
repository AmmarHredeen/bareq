import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950"
      dir="rtl"
    >
      <h1 className="text-6xl font-bold text-indigo-600">404</h1>
      <p className="text-slate-500">الصفحة غير موجودة</p>
      <Link to={ROUTES.DASHBOARD}>
        <Button>العودة للوحة التحكم</Button>
      </Link>
    </div>
  );
}

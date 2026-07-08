import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      const message =
        err instanceof Error && err.message === 'NOT_ADMIN'
          ? 'هذا الحساب ليس لديه صلاحية الدخول للوحة الإدارة'
          : 'بيانات الدخول غير صحيحة';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* شعار مصغّر يظهر على الجوال فقط (حيث يختفي القسم البصري) */}
      <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-right">
        <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 lg:hidden">
          <img src="/logo.jpeg" alt="Bareq" className="h-full w-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          تسجيل الدخول
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          أدخل بياناتك للوصول إلى لوحة الإدارة
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* البريد */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute right-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-10 pl-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="you@example.com"
              dir="ltr"
            />
          </div>
        </div>

        {/* كلمة المرور */}
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            كلمة المرور
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute right-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-10 pl-10 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="••••••••"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={loading}>
          تسجيل الدخول
        </Button>
      </form>
    </div>
  );
}

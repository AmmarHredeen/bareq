import { Outlet } from 'react-router-dom';
import { Smartphone, Cpu, Zap, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function AuthLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="flex min-h-screen bg-white dark:bg-slate-950"
      dir="rtl"
    >
      {/* ===== القسم البصري (يظهر من lg فأكبر) ===== */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 lg:flex">
        {/* زخارف دائرية خلفية */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

        {/* نمط شبكي خفيف */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* المحتوى */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <img src="/logo.jpeg" alt="Bareq" className="h-full w-full object-cover" />
            </div>
            <span className="text-xl font-bold">Bareq</span>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              أحدث الأجهزة
              <br />
              في مكان واحد
            </h2>
            <p className="mt-4 text-lg text-indigo-100/90">
              منصّة متكاملة لإدارة متجر الجوالات والتكنولوجيا — منتجات، طلبات،
              وتقارير في لوحة واحدة.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: Smartphone, text: 'إدارة مخزون الأجهزة بسهولة' },
                { icon: Zap, text: 'استقبال الطلبات لحظياً' },
                { icon: ShieldCheck, text: 'صلاحيات آمنة ومحمية' },
                { icon: Cpu, text: 'أداء سريع وواجهة عصرية' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-indigo-50">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-indigo-200/70">
            © {new Date().getFullYear()} Bareq — جميع الحقوق محفوظة
          </p>
        </div>
      </div>

      {/* ===== قسم تسجيل الدخول ===== */}
      <div className="relative flex w-full items-center justify-center p-6 lg:w-1/2">
        {/* زر تبديل النهاري/الليلي */}
        <button
          onClick={toggleTheme}
          className="absolute left-5 top-5 rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="تبديل الوضع"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <Outlet />
      </div>
    </div>
  );
}

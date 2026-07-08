import { useRef, useState, useEffect } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('تم تسجيل الخروج بنجاح');
    } catch {
      toast.error('فشل تسجيل الخروج');
    }
  };

  const email = user?.email ?? 'مستخدم';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((p) => !p)}
        className={cn(
          'flex items-center gap-2 rounded-lg p-1.5 transition-colors',
          'hover:bg-slate-100 dark:hover:bg-slate-800'
        )}
      >
        <Avatar name={email} />
        <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
          {email}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute left-0 top-full z-50 mt-2 w-56 origin-top-left rounded-xl border p-1.5 shadow-lg',
            'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
            'animate-in fade-in slide-in-from-top-1'
          )}
        >
          <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-700">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
              {email}
            </p>
            <p className="text-xs text-slate-500">موظف</p>
          </div>
          <button
            onClick={handleSignOut}
            className={cn(
              'mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
            )}
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}

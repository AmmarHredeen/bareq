import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Power, Smartphone, Megaphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import {
  categorySchema,
  type CategoryFormValues,
} from '../schemas/category.schema';
import { Input, Textarea, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { Category } from '@/types/database.types';

interface CategoryFormProps {
  initialData?: Category | null;
  onSubmit: (values: CategoryFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type Accent = 'emerald' | 'indigo' | 'amber';

const ACCENTS: Record<
  Accent,
  { on: string; icon: string; check: string }
> = {
  emerald: {
    on: 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/40 dark:bg-emerald-500/10',
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    check: 'text-emerald-600 focus:ring-emerald-500',
  },
  indigo: {
    on: 'border-indigo-300 bg-indigo-50/60 dark:border-indigo-500/40 dark:bg-indigo-500/10',
    icon: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
    check: 'text-indigo-600 focus:ring-indigo-500',
  },
  amber: {
    on: 'border-amber-300 bg-amber-50/60 dark:border-amber-500/40 dark:bg-amber-500/10',
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    check: 'text-amber-600 focus:ring-amber-500',
  },
};

/** صف تبديل (toggle) بأيقونة ووصف */
function ToggleRow({
  icon: Icon,
  title,
  description,
  active,
  accent,
  register,
  disabled,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  active: boolean;
  accent: Accent;
  register: UseFormRegisterReturn;
  disabled?: boolean;
}) {
  const a = ACCENTS[accent];

  return (
    <label
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3 transition-all',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        active
          ? a.on
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
      )}
    >
      <input
        type="checkbox"
        disabled={disabled}
        className={cn(
          'h-4 w-4 shrink-0 rounded border-slate-300 disabled:opacity-50',
          a.check
        )}
        {...register}
      />
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
          active
            ? a.icon
            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </label>
  );
}

export function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      is_active: initialData?.is_active ?? true,
      show_in_app: initialData?.show_in_app ?? true,
      show_in_newsletter: initialData?.show_in_newsletter ?? true,
    },
  });

  const isActive = watch('is_active');
  const showInApp = watch('show_in_app');
  const showInNewsletter = watch('show_in_newsletter');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        id="name"
        label="اسم الفئة"
        placeholder="مثال: Smartphone"
        error={errors.name?.message}
        {...register('name')}
      />

      <Textarea
        id="description"
        label="الوصف (اختياري)"
        placeholder="وصف مختصر للفئة"
        error={errors.description?.message}
        {...register('description')}
      />

      {/* خيارات الظهور */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          خيارات الظهور
        </p>

        <div className="space-y-2.5">
          {/* الحالة */}
          <ToggleRow
            icon={Power}
            title="نشط"
            description="تفعيل الفئة في النظام"
            active={isActive}
            accent="emerald"
            register={register('is_active')}
          />

          {/* تنبيه القاعدة */}
          {!isActive && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 ring-1 ring-inset ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20">
              الفئة غير نشطة — لن تظهر في التطبيق أو النشرة حتى يتم تفعيلها.
            </p>
          )}

          {/* خيارات الظهور — تُعطّل عند عدم التفعيل */}
          <div
            className={cn(
              'space-y-2.5 transition-opacity',
              !isActive && 'opacity-60'
            )}
          >
            <ToggleRow
              icon={Smartphone}
              title="يظهر في التطبيق"
              description="عرض الفئة داخل تطبيق العملاء"
              active={isActive && showInApp}
              accent="indigo"
              register={register('show_in_app')}
              disabled={!isActive}
            />
            <ToggleRow
              icon={Megaphone}
              title="يظهر في النشرة"
              description="تضمين الفئة في النشرة المطبوعة"
              active={isActive && showInNewsletter}
              accent="amber"
              register={register('show_in_newsletter')}
              disabled={!isActive}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          إلغاء
        </Button>
        <Button type="submit" className="flex-1" isLoading={isLoading}>
          {initialData ? 'حفظ التعديلات' : 'إضافة'}
        </Button>
      </div>
    </form>
  );
}

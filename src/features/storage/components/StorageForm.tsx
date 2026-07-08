import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Power } from 'lucide-react';
import {
  storageSchema,
  type StorageFormValues,
} from '../schemas/storage.schema';
import { Input, Button } from '@/components/ui';
import { buildStorageLabel } from '@/utils/storage';
import { cn } from '@/utils/cn';
import type { StorageOption } from '@/types/database.types';

interface StorageFormProps {
  initialData?: StorageOption | null;
  onSubmit: (values: StorageFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function StorageForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: StorageFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StorageFormValues>({
    resolver: zodResolver(storageSchema),
    defaultValues: {
      ram_gb: initialData?.ram_gb ?? undefined,
      storage_gb: initialData?.storage_gb ?? undefined,
      is_active: initialData?.is_active ?? true,
    },
  });

  // معاينة الـ label الناتج مباشرة
  const ram = watch('ram_gb');
  const storage = watch('storage_gb');
  const isActive = watch('is_active');
  const hasPreview = !!(ram && storage);
  const preview = hasPreview
    ? buildStorageLabel(Number(ram), Number(storage))
    : '—';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="ram_gb"
          type="number"
          label="الرام (GB)"
          placeholder="8"
          error={errors.ram_gb?.message}
          {...register('ram_gb', { valueAsNumber: true })}
        />
        <Input
          id="storage_gb"
          type="number"
          label="التخزين (GB)"
          placeholder="256"
          error={errors.storage_gb?.message}
          {...register('storage_gb', { valueAsNumber: true })}
        />
      </div>

      {/* معاينة الناتج */}
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border p-4 text-center transition-colors',
          hasPreview
            ? 'border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-50 dark:border-sky-500/30 dark:from-sky-500/10 dark:to-indigo-500/10'
            : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
        )}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          المعاينة
        </p>
        <p
          className={cn(
            'mt-1 font-mono text-2xl font-bold tracking-tight',
            hasPreview
              ? 'text-sky-600 dark:text-sky-400'
              : 'text-slate-300 dark:text-slate-600'
          )}
        >
          {preview}
        </p>
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
          ملاحظة: 1024 GB تُعرض كـ 1TB
        </p>
      </div>

      {/* خيار النشاط */}
      <label
        className={cn(
          'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all',
          isActive
            ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/40 dark:bg-emerald-500/10'
            : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
        )}
      >
        <input
          type="checkbox"
          className="h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          {...register('is_active')}
        />
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
            isActive
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
          )}
        >
          <Power className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            خيار نشط
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            إتاحة هذا الخيار عند إضافة المنتجات
          </p>
        </div>
      </label>

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

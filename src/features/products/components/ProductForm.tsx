import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Smartphone, Megaphone } from 'lucide-react';
import {
  productSchema,
  type ProductFormValues,
} from '../schemas/product.schema';
import { useProductOptions } from '../hooks/useProductOptions';
import { Input, Textarea, Select, Button, Spinner } from '@/components/ui';
import { PRODUCT_STATUS_OPTIONS } from '@/constants/app';
import { cn } from '@/utils/cn';
import type { Product } from '@/types/entities.types';

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/** عنوان قسم فرعي داخل النموذج */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
      {children}
    </p>
  );
}

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: ProductFormProps) {
  const options = useProductOptions();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      category_id: initialData?.category_id ?? '',
      brand_id: initialData?.brand_id ?? '',
      storage_option_id: initialData?.storage_option_id ?? '',
      price: initialData?.price ?? 0,
      wholesale_price: initialData?.wholesale_price ?? 0,
      description: initialData?.description ?? '',
      status:
        initialData?.status === 'active' || initialData?.status === 'inactive'
          ? initialData.status
          : 'active',
      show_in_app: initialData?.show_in_app ?? true,
      show_in_newsletter: initialData?.show_in_newsletter ?? true,
    },
  });

  const showInApp = watch('show_in_app');
  const showInNewsletter = watch('show_in_newsletter');
  const status = watch('status');
  const isActive = status === 'active';


  if (options.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* المعلومات الأساسية */}
      <div>
        <SectionLabel>المعلومات الأساسية</SectionLabel>
        <div className="space-y-4">
          <Input
            id="name"
            label="اسم المنتج"
            placeholder="مثال: iPhone 15 Pro"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              id="category_id"
              label="الفئة"
              placeholder="اختر الفئة"
              error={errors.category_id?.message}
              options={options.categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              {...register('category_id')}
            />
            <Select
              id="brand_id"
              label="العلامة التجارية"
              placeholder="اختر العلامة"
              error={errors.brand_id?.message}
              options={options.brands.map((b) => ({ value: b.id, label: b.name }))}
              {...register('brand_id')}
            />
          </div>
          <Select
            id="storage_option_id"
            label="الذاكرة"
            placeholder="اختر الذاكرة"
            error={errors.storage_option_id?.message}
            options={options.storage.map((s) => ({
              value: s.id,
              label: s.label,
            }))}
            {...register('storage_option_id')}
          />
        </div>
      </div>

      {/* التسعير والحالة */}
      <div>
        <SectionLabel>التسعير والحالة</SectionLabel>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="price"
              type="number"
              step="0.01"
              label="سعر المفرق"
              error={errors.price?.message}
              {...register('price', { valueAsNumber: true })}
            />
            <Input
              id="wholesale_price"
              type="number"
              step="0.01"
              label="سعر الجملة"
              error={errors.wholesale_price?.message}
              {...register('wholesale_price', { valueAsNumber: true })}
            />
          </div>
          <Select
            id="status"
            label="الحالة"
            options={[...PRODUCT_STATUS_OPTIONS]}
            {...register('status')}
          />
          <Textarea
            id="description"
            label="الوصف (اختياري)"
            placeholder="تفاصيل إضافية"
            error={errors.description?.message}
            {...register('description')}
          />
        </div>
      </div>

      {/* خيارات الظهور */}
      <div>
        <SectionLabel>خيارات الظهور</SectionLabel>

        {!isActive && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 ring-1 ring-inset ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20">
            المنتج غير نشط — لن يظهر في التطبيق أو النشرة حتى يتم تفعيله.
          </p>
        )}

        <div
          className={cn(
            'grid grid-cols-1 gap-3 transition-opacity sm:grid-cols-2',
            !isActive && 'pointer-events-none opacity-50'
          )}
        >
          <label
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all',
              isActive && showInApp
                ? 'border-indigo-300 bg-indigo-50/60 dark:border-indigo-500/40 dark:bg-indigo-500/10'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
            )}
          >
            <input
              type="checkbox"
              disabled={!isActive}
              className="h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
              {...register('show_in_app')}
            />
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                isActive && showInApp
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
              )}
            >
              <Smartphone className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                يظهر في التطبيق
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                عرض المنتج داخل تطبيق العملاء
              </p>
            </div>
          </label>

          <label
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all',
              isActive && showInNewsletter
                ? 'border-amber-300 bg-amber-50/60 dark:border-amber-500/40 dark:bg-amber-500/10'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
            )}
          >
            <input
              type="checkbox"
              disabled={!isActive}
              className="h-4 w-4 shrink-0 rounded border-slate-300 text-amber-600 focus:ring-amber-500 disabled:opacity-50"
              {...register('show_in_newsletter')}
            />
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                isActive && showInNewsletter
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
              )}
            >
              <Megaphone className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                يظهر في النشرة
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تضمين المنتج في النشرة المطبوعة
              </p>
            </div>
          </label>
        </div>
      </div>


      {/* الأزرار */}
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
          {initialData ? 'حفظ التعديلات' : 'إضافة المنتج'}
        </Button>
      </div>
    </form>
  );
}

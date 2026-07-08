import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  materialSchema,
  type MaterialFormValues,
} from '../schemas/material.schema';
import { Input, Textarea, Button } from '@/components/ui';
import type { Material } from '@/types/database.types';

interface MaterialFormProps {
  initialData?: Material | null;
  onSubmit: (values: MaterialFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MaterialForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: MaterialFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      is_active: initialData?.is_active ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="name"
        label="اسم الخامة"
        placeholder="مثال: Titanium"
        error={errors.name?.message}
        {...register('name')}
      />

      <Textarea
        id="description"
        label="الوصف (اختياري)"
        placeholder="وصف مختصر للخامة"
        error={errors.description?.message}
        {...register('description')}
      />

      <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          {...register('is_active')}
        />
        خامة نشطة
      </label>

      <div className="flex gap-3 pt-2">
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

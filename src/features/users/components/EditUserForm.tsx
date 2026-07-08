import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button } from '@/components/ui';
import { editUserSchema, type EditUserFormValues } from '../schemas/user.schema';
import type { Profile } from '@/types/entities.types';

interface EditUserFormProps {
  user: Profile;
  onSubmit: (values: EditUserFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function EditUserForm({
  user,
  onSubmit,
  onCancel,
  isSubmitting,
}: EditUserFormProps) {
  const isMerchant = user.role === 'wholesaler';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      full_name: user.full_name ?? '',
      phone: user.phone ?? '',
      address: user.address ?? '',
      city: user.city ?? '',
      notes: user.notes ?? '',
      shop_name: user.shop_name ?? '',
      manager_name: user.manager_name ?? '',
      shop_phone: user.shop_phone ?? '',
      shop_landline: user.shop_landline ?? '',
      shop_address: user.shop_address ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* البيانات الأساسية */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="الاسم الكامل"
          {...register('full_name')}
          error={errors.full_name?.message}
        />
        <Input
          label="رقم الهاتف"
          dir="ltr"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <Input label="المدينة" {...register('city')} error={errors.city?.message} />
        <Input
          label="العنوان"
          {...register('address')}
          error={errors.address?.message}
        />
      </div>

      <Input label="ملاحظات" {...register('notes')} error={errors.notes?.message} />

      {/* حقول المتجر — للتاجر فقط */}
      {isMerchant && (
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            بيانات المتجر
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="اسم المتجر"
              {...register('shop_name')}
              error={errors.shop_name?.message}
            />
            <Input
              label="اسم المسؤول"
              {...register('manager_name')}
              error={errors.manager_name?.message}
            />
            <Input
              label="هاتف المتجر"
              dir="ltr"
              {...register('shop_phone')}
              error={errors.shop_phone?.message}
            />
            <Input
              label="الهاتف الأرضي"
              dir="ltr"
              {...register('shop_landline')}
              error={errors.shop_landline?.message}
            />
          </div>
          <div className="mt-4">
            <Input
              label="عنوان المتجر"
              {...register('shop_address')}
              error={errors.shop_address?.message}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          حفظ التغييرات
        </Button>
      </div>
    </form>
  );
}

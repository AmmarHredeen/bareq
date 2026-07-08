import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Input, Button } from '@/components/ui';
import { managerSchema, type ManagerFormValues } from '../schemas/user.schema';

interface ManagerFormProps {
  onSubmit: (values: ManagerFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function buildEmail(name: string): string {
  return `${name.trim().replace(/\s+/g, '.')}@bareq.com`;
}

export function ManagerForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: ManagerFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ManagerFormValues>({
    resolver: zodResolver(managerSchema),
    defaultValues: { full_name: '', email: '', phone: '', password: '' },
  });

  const fullName = useWatch({ control, name: 'full_name' });

  useEffect(() => {
    if (fullName?.trim()) {
      setValue('email', buildEmail(fullName), { shouldValidate: true });
    }
  }, [fullName, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="الاسم الكامل"
        {...register('full_name')}
        error={errors.full_name?.message}
      />
      <Input
        label="البريد الإلكتروني"
        type="email"
        dir="ltr"
        disabled
        {...register('email')}
        error={errors.email?.message}
      />
      <Input
        label="رقم الهاتف (اختياري)"
        dir="ltr"
        {...register('phone')}
        error={errors.phone?.message}
      />
      <Input
        label="كلمة المرور"
        type="password"
        dir="ltr"
        {...register('password')}
        error={errors.password?.message}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          إنشاء المدير
        </Button>
      </div>
    </form>
  );
}

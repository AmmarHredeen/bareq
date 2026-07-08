import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button } from '@/components/ui';
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from '../schemas/user.schema';
import type { Profile } from '@/types/entities.types';

interface ResetPasswordFormProps {
  user: Profile;
  onSubmit: (values: ResetPasswordValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ResetPasswordForm({
  user,
  onSubmit,
  onCancel,
  isSubmitting,
}: ResetPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirm: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-slate-500">
        تعيين كلمة مرور جديدة للمستخدم:{' '}
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {user.full_name || user.email}
        </span>
      </p>

      <Input
        label="كلمة المرور الجديدة"
        type="password"
        dir="ltr"
        {...register('password')}
        error={errors.password?.message}
      />
      <Input
        label="تأكيد كلمة المرور"
        type="password"
        dir="ltr"
        {...register('confirm')}
        error={errors.confirm?.message}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          تعيين كلمة المرور
        </Button>
      </div>
    </form>
  );
}

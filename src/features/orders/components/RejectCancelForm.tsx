import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Textarea } from '@/components/ui';
import {
  rejectCancelSchema,
  type RejectCancelValues,
} from '@/features/orders/schemas/order.schema';

interface RejectCancelFormProps {
  mode: 'reject' | 'cancel';
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RejectCancelForm({
  mode,
  onSubmit,
  onCancel,
  isLoading,
}: RejectCancelFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectCancelValues>({
    resolver: zodResolver(rejectCancelSchema),
  });

  const label = mode === 'reject' ? 'سبب الرفض' : 'سبب الإلغاء';

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit(v.reason))}
      className="space-y-5"
    >
      <Textarea
        id="reason"
        label={label}
        placeholder="اكتب السبب هنا..."
        error={errors.reason?.message}
        {...register('reason')}
      />

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
        <Button
          type="submit"
          variant={mode === 'reject' ? 'danger' : 'primary'}
          className="flex-1"
          isLoading={isLoading}
        >
          تأكيد
        </Button>
      </div>
    </form>
  );
}

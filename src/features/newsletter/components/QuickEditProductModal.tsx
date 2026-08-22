import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Megaphone, Smartphone } from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { cn } from '@/utils/cn';
import { productDisplayName } from '@/utils/productName';
import {
  quickEditSchema,
  type QuickEditValues,
} from '@/features/newsletter/schemas/quickEdit.schema';
import type { NewsletterProduct } from '@/services/newsletter.service';

interface QuickEditProductModalProps {
  /** المنتج قيد التعديل — null يعني المودال مغلق. */
  product: NewsletterProduct | null;
  onClose: () => void;
  onSubmit: (values: QuickEditValues) => void;
  isLoading?: boolean;
}

/** مفتاح ظهور على شكل بطاقة — بنفس نمط ProductForm. */
function VisibilityToggle({
  label,
  hint,
  icon: Icon,
  active,
  tone,
  ...input
}: {
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  tone: 'amber' | 'indigo';
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const tones = {
    amber: {
      card: 'border-amber-300 bg-amber-50/60 dark:border-amber-500/40 dark:bg-amber-500/10',
      box: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
      check: 'text-amber-600 focus:ring-amber-500',
    },
    indigo: {
      card: 'border-indigo-300 bg-indigo-50/60 dark:border-indigo-500/40 dark:bg-indigo-500/10',
      box: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
      check: 'text-indigo-600 focus:ring-indigo-500',
    },
  }[tone];

  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all',
        active
          ? tones.card
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
      )}
    >
      <input
        type="checkbox"
        className={cn(
          'h-4 w-4 shrink-0 rounded border-slate-300',
          tones.check
        )}
        {...input}
      />
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
          active
            ? tones.box
            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      </div>
    </label>
  );
}

function QuickEditForm({
  product,
  onClose,
  onSubmit,
  isLoading,
}: QuickEditProductModalProps & { product: NewsletterProduct }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuickEditValues>({
    resolver: zodResolver(quickEditSchema),
    defaultValues: {
      // نبدأ من الاسم المعروض فعلاً في النشرة (model القديم إن وُجد)،
      // والحفظ يوحّده في name ويفرّغ model.
      name: productDisplayName(product),
      price: product.price ?? 0,
      wholesale_price: product.wholesale_price ?? 0,
      show_in_newsletter: product.show_in_newsletter,
      show_in_app: product.show_in_app,
    },
  });

  const showInNewsletter = watch('show_in_newsletter');
  const showInApp = watch('show_in_app');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
        {product.brand_name}
        {product.category_name ? ` · ${product.category_name}` : ''}
        {product.storage_label ? ` · ${product.storage_label}` : ''}
      </div>

      <Input
        id="name"
        label="اسم المنتج"
        placeholder="مثال: iPhone 15 Pro"
        error={errors.name?.message}
        {...register('name')}
      />

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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <VisibilityToggle
          label="يظهر في النشرة"
          hint="تضمين المنتج في النشرة المطبوعة"
          icon={Megaphone}
          tone="amber"
          active={showInNewsletter}
          {...register('show_in_newsletter')}
        />
        <VisibilityToggle
          label="يظهر في التطبيق"
          hint="عرض المنتج داخل تطبيق العملاء"
          icon={Smartphone}
          tone="indigo"
          active={showInApp}
          {...register('show_in_app')}
        />
      </div>

      <div className="flex gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={isLoading}
        >
          إلغاء
        </Button>
        <Button type="submit" className="flex-1" isLoading={isLoading}>
          حفظ التعديلات
        </Button>
      </div>
    </form>
  );
}

export function QuickEditProductModal(props: QuickEditProductModalProps) {
  const { product, onClose } = props;

  return (
    <Modal
      isOpen={!!product}
      onClose={onClose}
      title="تعديل سريع"
      size="md"
      closeOnBackdropClick={false}
    >
      {/* المفتاح يعيد بناء النموذج عند تغيّر المنتج فتُحمّل القيم الافتراضية الصحيحة */}
      {product && (
        <QuickEditForm key={product.id} {...props} product={product} />
      )}
    </Modal>
  );
}

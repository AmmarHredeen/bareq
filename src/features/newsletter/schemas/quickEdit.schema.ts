import { z } from 'zod';
import { productSchema } from '@/features/products/schemas/product.schema';

/**
 * التعديل السريع من النشرة.
 * الاسم يكتب في `name` — الحقل الوحيد المعتمد للاسم في كل النظام.
 * القواعد مأخوذة من مخطط المنتج نفسه فلا تتفرّع.
 */
export const quickEditSchema = productSchema.pick({
  name: true,
  price: true,
  wholesale_price: true,
  show_in_newsletter: true,
  show_in_app: true,
});

export type QuickEditValues = z.infer<typeof quickEditSchema>;

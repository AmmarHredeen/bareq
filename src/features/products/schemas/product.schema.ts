import { z } from 'zod';

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'اسم المنتج مطلوب')
    .max(200, 'الاسم طويل جداً'),

  category_id: z.string().min(1, 'الفئة مطلوبة'),
  brand_id: z.string().min(1, 'العلامة التجارية مطلوبة'),
  storage_option_id: z.string().min(1, 'الذاكرة مطلوبة'),

  price: z
    .number({ message: 'سعر المفرق مطلوب' })
    .min(0, 'يجب ألا يكون سالباً'),
  wholesale_price: z
    .number({ message: 'سعر الجملة مطلوب' })
    .min(0, 'يجب ألا يكون سالباً'),

  description: z.string().trim().max(1000).optional().or(z.literal('')),

  status: z.enum(['active', 'inactive']),
  show_in_app: z.boolean(),
  show_in_newsletter: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

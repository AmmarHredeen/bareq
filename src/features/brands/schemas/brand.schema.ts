import { z } from 'zod';

export const brandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'الاسم مطلوب')
    .max(100, 'الاسم طويل جداً (100 حرف كحد أقصى)'),
  description: z
    .string()
    .trim()
    .max(500, 'الوصف طويل جداً')
    .optional()
    .or(z.literal('')),
  is_active: z.boolean(),
  show_in_app: z.boolean(),
  show_in_newsletter: z.boolean(),
});

export type BrandFormValues = z.infer<typeof brandSchema>;

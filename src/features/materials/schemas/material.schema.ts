import { z } from 'zod';

export const materialSchema = z.object({
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
});

export type MaterialFormValues = z.infer<typeof materialSchema>;

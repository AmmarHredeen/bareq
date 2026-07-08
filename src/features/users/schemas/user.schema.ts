import { z } from 'zod';

export const managerSchema = z.object({
  full_name: z.string().min(2, 'الاسم مطلوب'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل'),
});
export type ManagerFormValues = z.infer<typeof managerSchema>;

export const editUserSchema = z.object({
  full_name: z.string().min(2, 'الاسم مطلوب'),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  // حقول المتجر (تظهر للتاجر فقط)
  shop_name: z.string().optional().or(z.literal('')),
  manager_name: z.string().optional().or(z.literal('')),
  shop_phone: z.string().optional().or(z.literal('')),
  shop_landline: z.string().optional().or(z.literal('')),
  shop_address: z.string().optional().or(z.literal('')),
});
export type EditUserFormValues = z.infer<typeof editUserSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirm'],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

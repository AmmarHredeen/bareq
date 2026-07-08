import { z } from 'zod';

export const storageSchema = z.object({
  ram_gb: z
    .number({ message: 'الرام مطلوب' })
    .int('يجب أن يكون رقماً صحيحاً')
    .min(1, 'يجب أن يكون أكبر من صفر')
    .max(1024, 'قيمة غير منطقية'),
  storage_gb: z
    .number({ message: 'التخزين مطلوب' })
    .int('يجب أن يكون رقماً صحيحاً')
    .min(1, 'يجب أن يكون أكبر من صفر')
    .max(8192, 'قيمة غير منطقية'),
  is_active: z.boolean(),
});

export type StorageFormValues = z.infer<typeof storageSchema>;

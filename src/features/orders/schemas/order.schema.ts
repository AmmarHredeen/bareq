import { z } from 'zod';

/** نموذج إدخال سبب الرفض أو الإلغاء. */
export const rejectCancelSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'يجب إدخال سبب لا يقل عن 3 أحرف')
    .max(500, 'السبب طويل جداً'),
});

export type RejectCancelValues = z.infer<typeof rejectCancelSchema>;

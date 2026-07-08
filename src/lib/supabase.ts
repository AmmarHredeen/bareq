import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';
import type { Database } from '@/types/database.types';

/**
 * عميل Supabase وحيد (Singleton) يُستخدم في كل التطبيق،
 * مُحمّل بأنواع قاعدة البيانات للحصول على type-safety كامل.
 */
export const supabase = createClient<Database>(
  env.supabaseUrl,
  env.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

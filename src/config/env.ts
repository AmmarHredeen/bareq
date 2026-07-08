/**
 * قراءة متغيرات البيئة والتحقق منها مبكراً عند الإقلاع.
 * إذا كان أي متغير مفقوداً، يفشل التطبيق فوراً بدلاً من أخطاء غامضة لاحقاً.
 */

function getEnvVar(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `❌ متغير البيئة المطلوب مفقود: ${key}. تأكد من إعداد ملف .env بشكل صحيح.`
    );
  }
  return value;
}

export const env = {
  supabaseUrl: getEnvVar('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  appName: import.meta.env.VITE_APP_NAME || 'Bareq Mobile Dashboard',
} as const;

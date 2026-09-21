import { supabase } from '@/lib/supabase';
import type { PosterSettings } from '@/features/newsletter/lib/poster';
import type { Json } from '@/types/database.types';

const TABLE = 'newsletter_settings';

/** الجدول صف واحد مشترك، مفتاحه الثابت `true`. */
const SINGLETON_ID = true;

/**
 * إعدادات النشرة المشتركة.
 *
 * تُحفظ كـ jsonb لا كأعمدة منفصلة: شكل `PosterSettings` يتغيّر مع كل ميزة،
 * و jsonb يستوعب الحقول الجديدة بلا migration. الدمج مع الافتراضيات يتم
 * عند القراءة في `usePersistentSettings`.
 */
export const newsletterSettingsService = {
  /** يرجع الإعدادات المحفوظة، أو null إذا لم يُحفظ شيء بعد. */
  async get(): Promise<Partial<PosterSettings> | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('settings')
      .eq('id', SINGLETON_ID)
      .maybeSingle();

    if (error) throw error;

    const settings = (data as { settings?: unknown } | null)?.settings;
    // صف موجود لكن فارغ = لم يُحفظ شيء بعد
    if (!settings || Object.keys(settings).length === 0) return null;
    return settings as Partial<PosterSettings>;
  },

  async save(settings: PosterSettings): Promise<void> {
    const { data: auth } = await supabase.auth.getUser();

    const { error } = await supabase.from(TABLE).upsert(
      {
        id: SINGLETON_ID,
        // PosterSettings كائن قابل للتسلسل بالكامل — نمرّره كـ jsonb
        settings: settings as unknown as Json,
        updated_at: new Date().toISOString(),
        updated_by: auth.user?.id ?? null,
      },
      { onConflict: 'id' }
    );

    if (error) throw error;
  },
};

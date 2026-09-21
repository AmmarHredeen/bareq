import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_POSTER_SETTINGS,
  DEFAULT_CONTACT,
  DEFAULT_PRODUCT_FONTS,
  DEFAULT_COLUMNS,
  DEFAULT_SORT,
  type PosterSettings,
  DEFAULT_THEME,
} from '@/features/newsletter/lib/poster';
import { newsletterSettingsService } from '@/services/newsletterSettings.service';

const STORAGE_KEY = 'bareq_poster_settings_v9';

/** تأخير الحفظ بعد آخر تعديل. */
export const SAVE_DELAY_MS = 1000;

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * يدمج إعدادات محفوظة (ناقصة أو قديمة) مع الافتراضيات.
 * أي حقل يُضاف لاحقاً يأخذ قيمته الافتراضية بدل أن يكسر المحفوظ.
 */
export function mergeSettings(parsed: Partial<PosterSettings>): PosterSettings {
  return {
    ...DEFAULT_POSTER_SETTINGS,
    ...parsed,
    invoiceDate: new Date().toISOString().slice(0, 10),
    contact: { ...DEFAULT_CONTACT, ...(parsed.contact ?? {}) },
    productFonts: { ...DEFAULT_PRODUCT_FONTS, ...(parsed.productFonts ?? {}) },
    columns: { ...DEFAULT_COLUMNS, ...(parsed.columns ?? {}) },
    sort: { ...DEFAULT_SORT, ...(parsed.sort ?? {}) },
    manualOrder: parsed.manualOrder ?? {},
    manualBrandLayout: parsed.manualBrandLayout ?? [],
    theme: { ...DEFAULT_THEME, ...(parsed.theme ?? {}) },
  };
}

/** النسخة المحلية — رسم فوري بلا انتظار الشبكة، واحتياطي عند تعذّر الاتصال. */
function loadLocal(): PosterSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_POSTER_SETTINGS;
    return mergeSettings(JSON.parse(raw) as Partial<PosterSettings>);
  } catch {
    return DEFAULT_POSTER_SETTINGS;
  }
}

function saveLocal(settings: PosterSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // تجاهل أخطاء التخزين
  }
}

export function usePersistentSettings() {
  const [settings, setSettings] = useState<PosterSettings>(loadLocal);
  const [status, setStatus] = useState<SaveStatus>('idle');

  /** لم نعرف بعد ما في القاعدة — لا نحفظ قبل ذلك كي لا نطمس إعدادات الآخرين. */
  const hydrated = useRef(false);
  /** توقيع آخر حالة معروفة أنها محفوظة — يمنع حفظ ما لم يتغيّر. */
  const lastSaved = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ===== التحميل الأولي من القاعدة =====
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const remote = await newsletterSettingsService.get();
        if (cancelled) return;

        if (remote) {
          const merged = mergeSettings(remote);
          lastSaved.current = JSON.stringify(merged);
          setSettings(merged);
        } else {
          // القاعدة فارغة: نرفع المحفوظ محلياً بدل أن نمسحه
          const local = loadLocal();
          await newsletterSettingsService.save(local);
          if (cancelled) return;
          lastSaved.current = JSON.stringify(local);
        }
      } catch {
        // تعذّر الوصول للقاعدة: نُكمل بالنسخة المحلية
        if (!cancelled) setStatus('error');
      } finally {
        if (!cancelled) hydrated.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ===== الحفظ المؤجل =====
  useEffect(() => {
    saveLocal(settings);

    if (!hydrated.current) return;

    const signature = JSON.stringify(settings);
    if (signature === lastSaved.current) return;

    setStatus('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      newsletterSettingsService
        .save(settings)
        .then(() => {
          lastSaved.current = signature;
          setStatus('saved');
        })
        .catch(() => setStatus('error'));
    }, SAVE_DELAY_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [settings]);

  const resetSettings = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(mergeSettings({}));
  }, []);

  return { settings, setSettings, resetSettings, status };
}

import { useEffect, useState } from 'react';
import {
  DEFAULT_POSTER_SETTINGS,
  DEFAULT_CONTACT,
  type PosterSettings,
} from '@/features/newsletter/lib/poster';

const STORAGE_KEY = 'bareq_poster_settings_v1';

/** يقرأ الإعدادات المحفوظة ويدمجها مع الافتراضية (لضمان اكتمال الحقول). */
function loadSettings(): PosterSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_POSTER_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<PosterSettings>;
    return {
      ...DEFAULT_POSTER_SETTINGS,
      ...parsed,
      // تاريخ الفاتورة يُحدّث لليوم عند كل فتح (لأنه نشرة يومية)
      invoiceDate: new Date().toISOString().slice(0, 10),
      // دمج بيانات التواصل لضمان عدم فقد أي حقل جديد
      contact: { ...DEFAULT_CONTACT, ...(parsed.contact ?? {}) },
    };
  } catch {
    return DEFAULT_POSTER_SETTINGS;
  }
}

export function usePersistentSettings() {
  const [settings, setSettings] = useState<PosterSettings>(loadSettings);

  // حفظ تلقائي عند أي تغيير
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // تجاهل أخطاء التخزين (مثلاً وضع التصفح الخاص)
    }
  }, [settings]);

  /** إعادة الضبط للافتراضي (اختياري). */
  const resetSettings = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(loadSettings());
  };

  return { settings, setSettings, resetSettings };
}

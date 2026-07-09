import { useEffect, useState } from 'react';
import {
  DEFAULT_POSTER_SETTINGS,
  DEFAULT_CONTACT,
  DEFAULT_PRODUCT_FONTS,
  DEFAULT_COLUMNS,
  type PosterSettings,
  DEFAULT_THEME,
} from '@/features/newsletter/lib/poster';

const STORAGE_KEY = 'bareq_poster_settings_v7';


function loadSettings(): PosterSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_POSTER_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<PosterSettings>;
    return {
      ...DEFAULT_POSTER_SETTINGS,
      ...parsed,
      invoiceDate: new Date().toISOString().slice(0, 10),
      contact: { ...DEFAULT_CONTACT, ...(parsed.contact ?? {}) },
      productFonts: { ...DEFAULT_PRODUCT_FONTS, ...(parsed.productFonts ?? {}) },
      columns: { ...DEFAULT_COLUMNS, ...(parsed.columns ?? {}) },
      theme: { ...DEFAULT_THEME, ...(parsed.theme ?? {}) },

    };
  } catch {
    return DEFAULT_POSTER_SETTINGS;
  }
}

export function usePersistentSettings() {
  const [settings, setSettings] = useState<PosterSettings>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // تجاهل أخطاء التخزين
    }
  }, [settings]);

  const resetSettings = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(loadSettings());
  };

  return { settings, setSettings, resetSettings };
}

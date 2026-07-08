import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { APP } from '@/constants/app';

/** القيمة التي يختارها المستخدم (تشمل "حسب النظام"). */
export type ThemePreference = 'light' | 'dark' | 'system';

/** الثيم الفعلي المُطبَّق على الواجهة (لا يشمل "system"). */
export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  /** الثيم الفعلي المُطبَّق (light أو dark). */
  theme: Theme;
  /** تفضيل المستخدم المحفوظ (قد يكون system). */
  preference: ThemePreference;
  toggleTheme: () => void;
  setTheme: (preference: ThemePreference) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** يحدد التفضيل الأولي من التخزين المحلي أو يعود إلى "system". */
function getInitialPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(APP.THEME_STORAGE_KEY) as ThemePreference | null;
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function resolveTheme(preference: ThemePreference): Theme {
  return preference === 'system' ? getSystemTheme() : preference;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(getInitialPreference);
  const [theme, setThemeState] = useState<Theme>(() => resolveTheme(getInitialPreference()));

  // تطبيق الثيم على عنصر <html> وحفظ التفضيل
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(APP.THEME_STORAGE_KEY, preference);
  }, [theme, preference]);

  // متابعة تغييرات ثيم النظام عند اختيار "system"
  useEffect(() => {
    if (preference !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setThemeState(resolveTheme('system'));

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference]);

  const setTheme = useCallback((next: ThemePreference) => {
    setPreference(next);
    setThemeState(resolveTheme(next));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, preference, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

/** خطاف الوصول لحالة الثيم. يجب استخدامه داخل ThemeProvider. */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

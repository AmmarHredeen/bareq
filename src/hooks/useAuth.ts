import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/** خطاف الوصول لحالة المصادقة. يجب استخدامه داخل AuthProvider. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { useEffect, useState } from 'react';

/** يؤخّر تحديث القيمة حتى يتوقف المستخدم عن الكتابة (للبحث الفوري). */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

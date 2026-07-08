import { QueryClient } from '@tanstack/react-query';

/** إعداد عميل TanStack Query بقيم افتراضية محسّنة للإنتاج. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

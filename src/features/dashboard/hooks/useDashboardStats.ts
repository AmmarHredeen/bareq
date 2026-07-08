import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_STATS,
    queryFn: () => dashboardService.getStats(),
  });
}

export function useRecentProducts() {
  return useQuery({
    queryKey: [...QUERY_KEYS.DASHBOARD_STATS, 'recent'],
    queryFn: () => dashboardService.getRecentProducts(5),
  });
}

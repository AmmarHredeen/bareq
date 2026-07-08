import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ordersService, type OrderFilters } from '@/services/orders.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { OrderFulfillmentType } from '@/types/order.types';

export function useOrders(params: OrderFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORDERS, params],
    queryFn: () => ordersService.getAll(params),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORDERS, 'detail', id],
    queryFn: () => ordersService.getById(id as string),
    enabled: !!id,
  });
}
export function usePendingOrdersCount() {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORDERS, 'pending-count'],
    queryFn: () => ordersService.countPending(),
    refetchOnWindowFocus: true,
  });
}


export function useOrderMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
  };

  const confirm = useMutation({
    mutationFn: (id: string) => ordersService.confirm(id),
    onSuccess: () => {
      toast.success('تم تأكيد الطلب');
      invalidate();
    },
    onError: () => toast.error('فشل تأكيد الطلب'),
  });

  const deliver = useMutation({
  mutationFn: ({ id, fulfillmentType }: { id: string; fulfillmentType: OrderFulfillmentType }) =>
    ordersService.deliver(id, fulfillmentType),
  onSuccess: () => {
    toast.success('تم تسليم الطلب');
    invalidate();
  },
  onError: () => toast.error('فشل تسليم الطلب'),
});


  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ordersService.reject(id, reason),
    onSuccess: () => {
      toast.success('تم رفض الطلب');
      invalidate();
    },
    onError: () => toast.error('فشل رفض الطلب'),
  });
  

  const cancel = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ordersService.cancel(id, reason),
    onSuccess: () => {
      toast.success('تم إلغاء الطلب');
      invalidate();
    },
    onError: () => toast.error('فشل إلغاء الطلب'),
  });

  return { confirm, deliver, reject, cancel };
}

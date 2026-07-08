import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { upgradeRequestsService } from '@/services/upgrade-requests.service';

export const upgradeRequestsKeys = {
  all: ['upgrade-requests'] as const,
};

export function useUpgradeRequests() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('upgrade-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'upgrade_requests',
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: upgradeRequestsKeys.all,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: upgradeRequestsKeys.all,
    queryFn: () => upgradeRequestsService.getAll(),
  });
}

export function useUpgradeRequestMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: upgradeRequestsKeys.all });

  const approve = useMutation({
    mutationFn: ({ id, reviewedBy }: { id: string; reviewedBy: string }) =>
      upgradeRequestsService.approve(id, reviewedBy),
    onSuccess: () => {
      invalidate();
      toast.success('تمت الموافقة على طلب الترقية');
    },
    onError: (e: Error) => toast.error(e.message || 'تعذّرت الموافقة'),
  });

  const reject = useMutation({
    mutationFn: ({
      id,
      reviewedBy,
      reason,
    }: {
      id: string;
      reviewedBy: string;
      reason: string;
    }) => upgradeRequestsService.reject(id, reviewedBy, reason),
    onSuccess: () => {
      invalidate();
      toast.success('تم رفض طلب الترقية');
    },
    onError: (e: Error) => toast.error(e.message || 'تعذّر الرفض'),
  });

  return { approve, reject };
  
}


export function usePendingUpgradeRequestsCount() {
  return useQuery({
    queryKey: [...upgradeRequestsKeys.all, 'pending-count'],
    queryFn: () => upgradeRequestsService.countPending(),
    refetchOnWindowFocus: true,
  });
}

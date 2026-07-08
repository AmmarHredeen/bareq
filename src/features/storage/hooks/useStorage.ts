import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  storageService,
  type StorageInput,
  type StorageQueryParams,
} from '@/services/storage.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useStorageOptions(params: StorageQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.STORAGE, params],
    queryFn: () => storageService.getAll(params),
  });
}

export function useInfiniteStorageOptions(params: Omit<StorageQueryParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.STORAGE, 'infinite', params],
    queryFn: ({ pageParam }) => storageService.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, p) => sum + p.data.length, 0);
      return totalFetched < lastPage.count ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useStorageMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: QUERY_KEYS.STORAGE });

  const create = useMutation({
    mutationFn: (input: StorageInput) => storageService.create(input),
    onSuccess: () => {
      toast.success('تمت إضافة خيار الذاكرة بنجاح');
      invalidate();
    },
    onError: () =>
      toast.error('فشل الإضافة. قد يكون هذا الخيار موجوداً مسبقاً.'),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: StorageInput }) =>
      storageService.update(id, input),
    onSuccess: () => {
      toast.success('تم تحديث خيار الذاكرة بنجاح');
      invalidate();
    },
    onError: () =>
      toast.error('فشل التحديث. قد يكون هذا الخيار موجوداً مسبقاً.'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => storageService.remove(id),
    onSuccess: () => {
      toast.success('تم حذف خيار الذاكرة بنجاح');
      invalidate();
    },
    onError: () => toast.error('فشل الحذف. قد يكون مرتبطاً بمنتجات.'),
  });

  return { create, update, remove };
}

import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  productsService,
  type ProductInput,
  type ProductFilters,
} from '@/services/products.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useProducts(params: ProductFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, params],
    queryFn: () => productsService.getAll(params),
  });
}

export function useInfiniteProducts(params: Omit<ProductFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, 'infinite', params],
    queryFn: ({ pageParam }) => productsService.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, p) => sum + p.data.length, 0);
      return totalFetched < lastPage.count ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useProductMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.NEWSLETTER });
  };

  const create = useMutation({
    mutationFn: (input: ProductInput) => productsService.create(input),
    onSuccess: () => {
      toast.success('تمت إضافة المنتج بنجاح');
      invalidate();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'فشل إضافة المنتج'),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) =>
      productsService.update(id, input),
    onSuccess: () => {
      toast.success('تم تحديث المنتج بنجاح');
      invalidate();
    },
    onError: () => toast.error('فشل تحديث المنتج'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => productsService.remove(id),
    onSuccess: () => {
      toast.success('تم حذف المنتج بنجاح');
      invalidate();
    },
    onError: () => toast.error('فشل حذف المنتج'),
  });

  return { create, update, remove };
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  brandsService,
  type BrandInput,
  type BrandQueryParams,
} from '@/services/brands.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useBrands(params: BrandQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.BRANDS, params],
    queryFn: () => brandsService.getAll(params),
  });
}

export function useBrandMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.BRANDS });

  const create = useMutation({
    mutationFn: (input: BrandInput) => brandsService.create(input),
    onSuccess: () => {
      toast.success('تمت إضافة العلامة بنجاح');
      invalidate();
    },
    onError: () => toast.error('فشل إضافة العلامة'),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: BrandInput }) =>
      brandsService.update(id, input),
    onSuccess: () => {
      toast.success('تم تحديث العلامة بنجاح');
      invalidate();
    },
    onError: () => toast.error('فشل تحديث العلامة'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => brandsService.remove(id),
    onSuccess: () => {
      toast.success('تم حذف العلامة بنجاح');
      invalidate();
    },
    onError: () => toast.error('فشل الحذف. قد تكون العلامة مرتبطة بمنتجات.'),
  });

  return { create, update, remove };
}

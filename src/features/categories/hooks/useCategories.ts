import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  categoriesService,
  type CategoryInput,
  type CategoryQueryParams,
} from '@/services/categories.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

/** جلب قائمة الفئات. */
export function useCategories(params: CategoryQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CATEGORIES, params],
    queryFn: () => categoriesService.getAll(params),
  });
}

/** إنشاء/تعديل/حذف فئة مع تحديث الكاش تلقائياً. */
export function useCategoryMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });

  const create = useMutation({
    mutationFn: (input: CategoryInput) => categoriesService.create(input),
    onSuccess: () => {
      toast.success('تمت إضافة الفئة بنجاح');
      invalidate();
    },
    onError: () => toast.error('فشل إضافة الفئة'),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) =>
      categoriesService.update(id, input),
    onSuccess: () => {
      toast.success('تم تحديث الفئة بنجاح');
      invalidate();
    },
    onError: () => toast.error('فشل تحديث الفئة'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => {
      toast.success('تم حذف الفئة بنجاح');
      invalidate();
    },
    onError: () => toast.error('فشل الحذف. قد تكون الفئة مرتبطة بمنتجات.'),
  });

  return { create, update, remove };
}

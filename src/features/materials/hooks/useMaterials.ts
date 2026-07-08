import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  materialsService,
  type MaterialInput,
} from '@/services/materials.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { QueryParams } from '@/types/common.types';

export function useMaterials(params: QueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.MATERIALS, params],
    queryFn: () => materialsService.getAll(params),
  });
}

export function useMaterialMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: QUERY_KEYS.MATERIALS });

  const create = useMutation({
    mutationFn: (input: MaterialInput) => materialsService.create(input),
    onSuccess: () => {
      toast.success('تمت إضافة الخامة بنجاح');
      invalidate();
    },
    onError: () => toast.error('فشل إضافة الخامة'),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: MaterialInput }) =>
      materialsService.update(id, input),
    onSuccess: () => {
      toast.success('تم تحديث الخامة بنجاح');
      invalidate();
    },
    onError: () => toast.error('فشل تحديث الخامة'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => materialsService.remove(id),
    onSuccess: () => {
      toast.success('تم حذف الخامة بنجاح');
      invalidate();
    },
    onError: () => toast.error('فشل الحذف. قد تكون الخامة مرتبطة بمنتجات.'),
  });

  return { create, update, remove };
}

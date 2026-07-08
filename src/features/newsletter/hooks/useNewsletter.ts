import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { newsletterService } from '@/services/newsletter.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useNewsletter() {
  return useQuery({
    queryKey: QUERY_KEYS.NEWSLETTER,
    queryFn: () => newsletterService.getAll(),
  });
}

export function useNewsletterMutations() {
  const qc = useQueryClient();

  const removeItem = useMutation({
    mutationFn: (id: string) => newsletterService.removeFromNewsletter(id),
    onSuccess: () => {
      toast.success('تمت إزالة المنتج من النشرة');
      qc.invalidateQueries({ queryKey: QUERY_KEYS.NEWSLETTER });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
    },
    onError: () => toast.error('فشل إزالة المنتج'),
  });

  return { removeItem };
}

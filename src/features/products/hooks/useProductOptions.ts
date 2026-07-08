import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories.service';
import { brandsService } from '@/services/brands.service';
import { storageService } from '@/services/storage.service';

/** جلب كل خيارات القوائم المنسدلة لفورم المنتج دفعة واحدة. */
export function useProductOptions() {
  const categories = useQuery({
    queryKey: ['options', 'categories'],
    queryFn: () => categoriesService.getActive(),
    staleTime: 1000 * 60 * 5,
  });
  const brands = useQuery({
    queryKey: ['options', 'brands'],
    queryFn: () => brandsService.getActive(),
    staleTime: 1000 * 60 * 5,
  });
  const storage = useQuery({
    queryKey: ['options', 'storage'],
    queryFn: () => storageService.getActive(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    categories: categories.data ?? [],
    brands: brands.data ?? [],
    storage: storage.data ?? [],
    isLoading:
      categories.isLoading ||
      brands.isLoading ||
      storage.isLoading,
  };
}

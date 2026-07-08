import { Filter } from 'lucide-react';
import { Select } from '@/components/ui';
import { PRODUCT_STATUS_OPTIONS } from '@/constants/app';
import type { Category, Brand, ProductStatus } from '@/types/database.types';

export type VisibilityFilter = '' | 'app' | 'newsletter';

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  categoryId: string;
  brandId: string;
  status: ProductStatus | '';
  visibility: VisibilityFilter;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onStatusChange: (value: ProductStatus | '') => void;
  onVisibilityChange: (value: VisibilityFilter) => void;
}

const VISIBILITY_OPTIONS = [
  { value: 'app', label: 'يظهر في التطبيق' },
  { value: 'newsletter', label: 'يظهر في النشرة' },
] as const;

export function ProductFilters({
  categories,
  brands,
  categoryId,
  brandId,
  status,
  visibility,
  onCategoryChange,
  onBrandChange,
  onStatusChange,
  onVisibilityChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 sm:flex">
        <Filter className="h-3.5 w-3.5" />
        تصفية
      </div>
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          placeholder="كل الفئات"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
        />
        <Select
          placeholder="كل العلامات"
          options={brands.map((b) => ({ value: b.id, label: b.name }))}
          value={brandId}
          onChange={(e) => onBrandChange(e.target.value)}
        />
        <Select
          placeholder="كل الحالات"
          options={[...PRODUCT_STATUS_OPTIONS]}
          value={status}
          onChange={(e) => onStatusChange(e.target.value as ProductStatus | '')}
        />
        <Select
          placeholder="كل الظهور"
          options={[...VISIBILITY_OPTIONS]}
          value={visibility}
          onChange={(e) => onVisibilityChange(e.target.value as VisibilityFilter)}
        />
      </div>
    </div>
  );
}

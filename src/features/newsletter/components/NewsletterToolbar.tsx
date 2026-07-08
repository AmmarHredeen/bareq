import { Printer, Users, Store } from 'lucide-react';
import {
  NEWSLETTER_AUDIENCE,
  NEWSLETTER_AUDIENCE_META,
  type NewsletterAudience,
} from '@/constants/app';
import { Button, Select } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { NewsletterFilterOption } from '@/services/newsletter.service';

/** الأعمدة القابلة للإظهار/الإخفاء في الجدول. */
export interface NewsletterColumns {
  index: boolean;
  brand: boolean;
  category: boolean;
  storage: boolean;
  model: boolean;
  price: boolean;
}

export interface NewsletterFilters {
  brandId: string;
  categoryId: string;
  sortBy: 'name' | 'price';
  sortDir: 'asc' | 'desc';
}

const COLUMN_LABELS: { key: keyof NewsletterColumns; label: string }[] = [
  { key: 'index', label: 'التسلسل #' },
  { key: 'brand', label: 'العلامة' },
  { key: 'category', label: 'الفئة' },
  { key: 'storage', label: 'الذاكرة' },
  { key: 'model', label: 'الموديل' },
  { key: 'price', label: 'السعر' },
];

interface NewsletterToolbarProps {
  audience: NewsletterAudience;
  onAudienceChange: (a: NewsletterAudience) => void;
  filters: NewsletterFilters;
  onFiltersChange: (f: NewsletterFilters) => void;
  columns: NewsletterColumns;
  onColumnsChange: (c: NewsletterColumns) => void;
  brands: NewsletterFilterOption[];
  categories: NewsletterFilterOption[];
  onPrint: () => void;
}

/** عنوان قسم صغير داخل اللوحة. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
      {children}
    </p>
  );
}

export function NewsletterToolbar({
  audience,
  onAudienceChange,
  filters,
  onFiltersChange,
  columns,
  onColumnsChange,
  brands,
  categories,
  onPrint,
}: NewsletterToolbarProps) {
  const updateFilter = (patch: Partial<NewsletterFilters>) =>
    onFiltersChange({ ...filters, ...patch });
  const toggleColumn = (key: keyof NewsletterColumns) =>
    onColumnsChange({ ...columns, [key]: !columns[key] });

  return (
    <div className="no-print space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-card)] dark:border-slate-800 dark:bg-slate-900">
      {/* الجمهور + زر الطباعة */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <SectionLabel>جمهور النشرة</SectionLabel>
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/60">
            {(
              [
                { key: NEWSLETTER_AUDIENCE.CUSTOMER, icon: Users },
                { key: NEWSLETTER_AUDIENCE.WHOLESALER, icon: Store },
              ] as const
            ).map(({ key, icon: Icon }) => {
              const active = audience === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onAudienceChange(key)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    active
                      ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  )}
                >
                  <Icon size={16} />
                  {NEWSLETTER_AUDIENCE_META[key].label}
                </button>
              );
            })}
          </div>
        </div>

        <Button onClick={onPrint} className="self-end">
          <Printer size={16} />
          طباعة / تصدير PDF
        </Button>
      </div>

      {/* الفلاتر والترتيب */}
      <div>
        <SectionLabel>التصفية والترتيب</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            placeholder="كل العلامات"
            value={filters.brandId}
            options={brands.map((b) => ({ value: b.id, label: b.name }))}
            onChange={(e) => updateFilter({ brandId: e.target.value })}
          />
          <Select
            placeholder="كل الفئات"
            value={filters.categoryId}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            onChange={(e) => updateFilter({ categoryId: e.target.value })}
          />
          <Select
            value={filters.sortBy}
            options={[
              { value: 'name', label: 'ترتيب بالاسم' },
              { value: 'price', label: 'ترتيب بالسعر' },
            ]}
            onChange={(e) =>
              updateFilter({ sortBy: e.target.value as NewsletterFilters['sortBy'] })
            }
          />
          <Select
            value={filters.sortDir}
            options={[
              { value: 'asc', label: 'تصاعدي' },
              { value: 'desc', label: 'تنازلي' },
            ]}
            onChange={(e) =>
              updateFilter({
                sortDir: e.target.value as NewsletterFilters['sortDir'],
              })
            }
          />
        </div>
      </div>

      {/* الأعمدة الظاهرة */}
      <div>
        <SectionLabel>الأعمدة الظاهرة في الطباعة</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {COLUMN_LABELS.map(({ key, label }) => {
            const active = columns[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleColumn(key)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                  active
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
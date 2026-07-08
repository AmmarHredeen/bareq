import { useState, useMemo } from 'react';
import { Plus, Award, X, Filter } from 'lucide-react';
import {
  Button,
  Card,
  SearchBar,
  Select,
  Modal,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Pagination,
} from '@/components/ui';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useBrands, useBrandMutations } from '@/features/brands/hooks/useBrands';
import { BrandForm } from '@/features/brands/components/BrandForm';
import { BrandTable } from '@/features/brands/components/BrandTable';
import type { BrandFormValues } from '@/features/brands/schemas/brand.schema';
import type { Brand } from '@/types/entities.types';
import { APP } from '@/constants/app';

type StatusFilter = '' | 'active' | 'inactive';
type VisibilityFilter = '' | 'app' | 'newsletter';

export function BrandsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [visibility, setVisibility] = useState<VisibilityFilter>('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Brand | null>(null);
  const [toDelete, setToDelete] = useState<Brand | null>(null);

  const debouncedSearch = useDebounce(search, APP.SEARCH_DEBOUNCE_MS);
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      // القاعدة مطبّقة في طبقة الخدمة: "غير نشط لا يظهر"
      is_active:
        statusFilter === 'active'
          ? true
          : statusFilter === 'inactive'
          ? false
          : undefined,
      show_in_app: visibility === 'app' ? true : undefined,
      show_in_newsletter: visibility === 'newsletter' ? true : undefined,
      page,
      pageSize: APP.PAGE_SIZE,
    }),
    [debouncedSearch, statusFilter, visibility, page]
  );

  const { data, isLoading, isError, refetch } = useBrands(queryParams);
  const { create, update, remove } = useBrandMutations();

  const brands = data?.data ?? [];
  const totalItems = data?.count ?? 0;
  const totalPages = Math.ceil(totalItems / APP.PAGE_SIZE);

  const handleAdd = () => {
    setSelected(null);
    formModal.open();
  };

  const handleEdit = (brand: Brand) => {
    setSelected(brand);
    formModal.open();
  };

  // حفظ (إضافة أو تعديل) — تطبيق قاعدة: غير نشط ⟵ لا يظهر
  const handleSubmit = (values: BrandFormValues) => {
    const input = {
      name: values.name,
      description: values.description || null,
      is_active: values.is_active,
      show_in_app: values.is_active ? values.show_in_app : false,
      show_in_newsletter: values.is_active ? values.show_in_newsletter : false,
    };

    if (selected) {
      update.mutate(
        { id: selected.id, input },
        { onSuccess: () => formModal.close() }
      );
    } else {
      create.mutate(input, { onSuccess: () => formModal.close() });
    }
  };

  const handleDeleteRequest = (brand: Brand) => {
    setToDelete(brand);
    deleteModal.open();
  };

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    remove.mutate(toDelete.id, {
      onSuccess: () => {
        deleteModal.close();
        setToDelete(null);
      },
    });
  };

  const hasFilters = !!(debouncedSearch || statusFilter || visibility);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setVisibility('');
    setPage(1);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* العنوان وزر الإضافة */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25">
            <Award className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              العلامات التجارية
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              إدارة العلامات التجارية
              {!isLoading && !isError && (
                <span className="ms-1 text-slate-400 dark:text-slate-500">
                  · {totalItems} علامة
                </span>
              )}
            </p>
          </div>
        </div>
        <Button onClick={handleAdd} className="shrink-0">
          <Plus className="h-4 w-4" />
          إضافة علامة
        </Button>
      </div>

      {/* البحث والفلاتر */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                placeholder="ابحث بالاسم..."
              />
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="shrink-0 self-start text-slate-500 lg:self-auto"
              >
                <X className="h-4 w-4" />
                مسح الفلاتر
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 sm:flex">
              <Filter className="h-3.5 w-3.5" />
              تصفية
            </div>
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                placeholder="كل الحالات"
                options={[
                  { value: 'active', label: 'نشط' },
                  { value: 'inactive', label: 'غير نشط' },
                ]}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
                  setPage(1);
                }}
              />
              <Select
                placeholder="كل الظهور"
                options={[
                  { value: 'app', label: 'يظهر في التطبيق' },
                  { value: 'newsletter', label: 'يظهر في النشرة' },
                ]}
                value={visibility}
                onChange={(e) => {
                  setVisibility(e.target.value as VisibilityFilter);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* الجدول */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : brands.length === 0 ? (
          <EmptyState
            icon={Award}
            title="لا توجد علامات تجارية"
            description={
              hasFilters
                ? 'لا توجد نتائج مطابقة للبحث أو الفلاتر'
                : 'ابدأ بإضافة أول علامة تجارية'
            }
            action={
              hasFilters ? (
                <Button onClick={clearFilters} size="sm" variant="outline">
                  <X className="h-4 w-4" />
                  مسح الفلاتر
                </Button>
              ) : (
                <Button onClick={handleAdd} size="sm">
                  <Plus className="h-4 w-4" />
                  إضافة علامة
                </Button>
              )
            }
          />
        ) : (
          <>
            <BrandTable
              brands={brands}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={APP.PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      {/* مودال الإضافة/التعديل */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={selected ? 'تعديل العلامة' : 'إضافة علامة جديدة'}
      >
        <BrandForm
          initialData={selected}
          onSubmit={handleSubmit}
          onCancel={formModal.close}
          isLoading={create.isPending || update.isPending}
        />
      </Modal>

      {/* مودال تأكيد الحذف */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleConfirmDelete}
        message={`هل أنت متأكد من حذف علامة "${toDelete?.name}"؟`}
        isLoading={remove.isPending}
      />
    </div>
  );
}

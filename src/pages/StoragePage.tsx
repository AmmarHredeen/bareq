import { useState, useMemo } from 'react';
import { Plus, HardDrive, X, Filter } from 'lucide-react';
import {
  Button,
  Card,
  SearchBar,
  Select,
  Modal,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Spinner,
} from '@/components/ui';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import {
  useInfiniteStorageOptions,
  useStorageMutations,
} from '@/features/storage/hooks/useStorage';
import { StorageForm } from '@/features/storage/components/StorageForm';
import { StorageTable } from '@/features/storage/components/StorageTable';
import type { StorageFormValues } from '@/features/storage/schemas/storage.schema';
import type { StorageOption } from '@/types/entities.types';
import { APP } from '@/constants/app';

type StatusFilter = '' | 'active' | 'inactive';

export function StoragePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [selected, setSelected] = useState<StorageOption | null>(null);
  const [toDelete, setToDelete] = useState<StorageOption | null>(null);

  const debouncedSearch = useDebounce(search, APP.SEARCH_DEBOUNCE_MS);
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      is_active:
        statusFilter === 'active'
          ? true
          : statusFilter === 'inactive'
          ? false
          : undefined,
      pageSize: APP.PAGE_SIZE,
    }),
    [debouncedSearch, statusFilter]
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteStorageOptions(queryParams);
  const { create, update, remove } = useStorageMutations();

  const options = data?.pages.flatMap((p) => p.data) ?? [];
  const totalItems = data?.pages?.[0]?.count ?? 0;

  const handleAdd = () => {
    setSelected(null);
    formModal.open();
  };

  const handleEdit = (option: StorageOption) => {
    setSelected(option);
    formModal.open();
  };

  const handleSubmit = (values: StorageFormValues) => {
    const input = {
      ram_gb: values.ram_gb,
      storage_gb: values.storage_gb,
      is_active: values.is_active,
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

  const handleDeleteRequest = (option: StorageOption) => {
    setToDelete(option);
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

  const sentinelRef = useInfiniteScroll(
    fetchNextPage,
    !!(hasNextPage && !isFetchingNextPage)
  );

  const hasFilters = !!(debouncedSearch || statusFilter);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* العنوان وزر الإضافة */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/25">
            <HardDrive className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              الذاكرة
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              إدارة خيارات الرام والتخزين
              {!isLoading && !isError && (
                <span className="ms-1 text-slate-400 dark:text-slate-500">
                  · {totalItems} خيار
                </span>
              )}
            </p>
          </div>
        </div>
        <Button onClick={handleAdd} className="shrink-0">
          <Plus className="h-4 w-4" />
          إضافة خيار
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
                }}
                placeholder="ابحث (مثال: 8/256)..."
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
            <div className="grid flex-1 grid-cols-1 gap-3 sm:max-w-xs">
              <Select
                placeholder="كل الحالات"
                options={[
                  { value: 'active', label: 'نشط' },
                  { value: 'inactive', label: 'غير نشط' },
                ]}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
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
        ) : options.length === 0 ? (
          <EmptyState
            icon={HardDrive}
            title="لا توجد خيارات ذاكرة"
            description={
              hasFilters
                ? 'لا توجد نتائج مطابقة للبحث أو الفلاتر'
                : 'ابدأ بإضافة أول خيار ذاكرة'
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
                  إضافة خيار
                </Button>
              )
            }
          />
        ) : (
          <>
            <StorageTable
              options={options}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4">
                <Spinner className="h-5 w-5" />
              </div>
            )}
            <div ref={sentinelRef} />
          </>
        )}
      </Card>

      {/* مودال الإضافة/التعديل */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={selected ? 'تعديل خيار الذاكرة' : 'إضافة خيار ذاكرة'}
      >
        <StorageForm
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
        message={`هل أنت متأكد من حذف خيار "${toDelete?.label}"؟`}
        isLoading={remove.isPending}
      />
    </div>
  );
}

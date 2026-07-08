import { useState, useMemo } from 'react';
import { Plus, Layers } from 'lucide-react';
import {
  Button,
  Card,
  SearchBar,
  Modal,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Pagination,
} from '@/components/ui';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import {
  useMaterials,
  useMaterialMutations,
} from '@/features/materials/hooks/useMaterials';
import { MaterialForm } from '@/features/materials/components/MaterialForm';
import { MaterialTable } from '@/features/materials/components/MaterialTable';
import type { MaterialFormValues } from '@/features/materials/schemas/material.schema';
import type { Material } from '@/types/database.types';
import { APP } from '@/constants/app';

export function MaterialsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Material | null>(null);
  const [toDelete, setToDelete] = useState<Material | null>(null);

  const debouncedSearch = useDebounce(search, APP.SEARCH_DEBOUNCE_MS);
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const queryParams = useMemo(
    () => ({ search: debouncedSearch, page, pageSize: APP.PAGE_SIZE }),
    [debouncedSearch, page]
  );

  const { data, isLoading, isError, refetch } = useMaterials(queryParams);
  const { create, update, remove } = useMaterialMutations();

  const materials = data?.data ?? [];
  const totalItems = data?.count ?? 0;
  const totalPages = Math.ceil(totalItems / APP.PAGE_SIZE);

  const handleAdd = () => {
    setSelected(null);
    formModal.open();
  };

  const handleEdit = (material: Material) => {
    setSelected(material);
    formModal.open();
  };

  const handleSubmit = (values: MaterialFormValues) => {
    const input = {
      name: values.name,
      description: values.description || null,
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

  const handleDeleteRequest = (material: Material) => {
    setToDelete(material);
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

  return (
    <div className="space-y-5">
      {/* العنوان وزر الإضافة */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            الخامات
          </h1>
          <p className="mt-1 text-sm text-slate-500">إدارة خامات المنتجات</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          إضافة خامة
        </Button>
      </div>

      {/* البحث */}
      <SearchBar
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder="ابحث بالاسم..."
        className="max-w-sm"
      />

      {/* الجدول */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : materials.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="لا توجد خامات"
            description={
              debouncedSearch
                ? 'لا توجد نتائج مطابقة لبحثك'
                : 'ابدأ بإضافة أول خامة'
            }
            action={
              !debouncedSearch && (
                <Button onClick={handleAdd} size="sm">
                  <Plus className="h-4 w-4" />
                  إضافة خامة
                </Button>
              )
            }
          />
        ) : (
          <>
            <MaterialTable
              materials={materials}
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
        title={selected ? 'تعديل الخامة' : 'إضافة خامة جديدة'}
      >
        <MaterialForm
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
        message={`هل أنت متأكد من حذف خامة "${toDelete?.name}"؟`}
        isLoading={remove.isPending}
      />
    </div>
  );
}

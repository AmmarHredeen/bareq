import { useState, useMemo } from 'react';
import { Plus, Smartphone, X } from 'lucide-react';
import {
  Button,
  Card,
  SearchBar,
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
  useInfiniteProducts,
  useProductMutations,
} from '@/features/products/hooks/useProducts';
import { useProductOptions } from '@/features/products/hooks/useProductOptions';
import { ProductForm } from '@/features/products/components/ProductForm';
import { ProductTable } from '@/features/products/components/ProductTable';
import {
  ProductFilters,
  type VisibilityFilter,
} from '@/features/products/components/ProductFilters';
import type { ProductFormValues } from '@/features/products/schemas/product.schema';
import type { ProductWithRelations, ProductStatus } from '@/types/database.types';
import { APP } from '@/constants/app';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [visibility, setVisibility] = useState<VisibilityFilter>('');
  const [selected, setSelected] = useState<ProductWithRelations | null>(null);
  const [toDelete, setToDelete] = useState<ProductWithRelations | null>(null);

  const debouncedSearch = useDebounce(search, APP.SEARCH_DEBOUNCE_MS);
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      category_id: categoryId,
      brand_id: brandId,
      status,
      // فلاتر الظهور: نطبّق قاعدة "غير نشط لا يظهر" في طبقة الخدمة
      show_in_app: visibility === 'app' ? true : undefined,
      show_in_newsletter: visibility === 'newsletter' ? true : undefined,
      pageSize: APP.PAGE_SIZE,
    }),
    [debouncedSearch, categoryId, brandId, status, visibility]
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts(queryParams);
  const { create, update, remove } = useProductMutations();
  const options = useProductOptions();

  const products = data?.pages.flatMap((p) => p.data) ?? [];
  const totalItems = data?.pages?.[0]?.count ?? 0;

  const sentinelRef = useInfiniteScroll(
    fetchNextPage,
    !!(hasNextPage && !isFetchingNextPage)
  );

  const handleAdd = () => {
    setSelected(null);
    formModal.open();
  };

  const handleEdit = (product: ProductWithRelations) => {
    setSelected(product);
    formModal.open();
  };

  const handleSubmit = (values: ProductFormValues) => {
    // القاعدة: إذا كان المنتج غير نشط، فلا يظهر في التطبيق ولا النشرة
    const isActive = values.status === 'active';
    const input = {
      name: values.name,
      category_id: values.category_id,
      brand_id: values.brand_id,
      storage_option_id: values.storage_option_id,
      price: values.price,
      wholesale_price: values.wholesale_price,
      description: values.description || null,
      status: values.status,
      show_in_app: isActive ? values.show_in_app : false,
      show_in_newsletter: isActive ? values.show_in_newsletter : false,
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

  const handleDeleteRequest = (product: ProductWithRelations) => {
    setToDelete(product);
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

  const hasFilters = !!(
    debouncedSearch ||
    categoryId ||
    brandId ||
    status ||
    visibility
  );

  const clearFilters = () => {
    setSearch('');
    setCategoryId('');
    setBrandId('');
    setStatus('');
    setVisibility('');
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* العنوان وزر الإضافة */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25">
            <Smartphone className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              المنتجات
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              إدارة مخزون الأجهزة
              {!isLoading && !isError && (
                <span className="ms-1 text-slate-400 dark:text-slate-500">
                  · {totalItems} منتج
                </span>
              )}
            </p>
          </div>
        </div>
        <Button onClick={handleAdd} className="shrink-0">
          <Plus className="h-4 w-4" />
          إضافة منتج
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
                placeholder="ابحث بالاسم ..."
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
          <ProductFilters
            categories={options.categories}
            brands={options.brands}
            categoryId={categoryId}
            brandId={brandId}
            status={status}
            visibility={visibility}
            onCategoryChange={(v) => {
              setCategoryId(v);
            }}
            onBrandChange={(v) => {
              setBrandId(v);
            }}
            onStatusChange={(v) => {
              setStatus(v);
            }}
            onVisibilityChange={(v) => {
              setVisibility(v);
            }}
          />
        </div>
      </Card>

      {/* الجدول */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={8} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Smartphone}
            title="لا توجد منتجات"
            description={
              hasFilters
                ? 'لا توجد نتائج مطابقة للبحث أو الفلاتر'
                : 'ابدأ بإضافة أول منتج'
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
                  إضافة منتج
                </Button>
              )
            }
          />
        ) : (
          <>
            <ProductTable
              products={products}
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
        title={selected ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        size="lg"
        closeOnBackdropClick={false}
      >
        <ProductForm
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
        message={`هل أنت متأكد من حذف منتج "${toDelete?.name}"؟`}
        isLoading={remove.isPending}
      />
    </div>
  );
}

import { useState, useMemo } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import {
  Button,
  Card,
  SearchBar,
  Modal,
  EmptyState,
  ErrorState,
  Pagination,
} from '@/components/ui';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import {
  useOrders,
  useOrderMutations,
} from '@/features/orders/hooks/useOrders';
import { OrderTable } from '@/features/orders/components/OrderTable';
import { OrderFilters } from '@/features/orders/components/OrderFilters';
import { OrderDetails } from '@/features/orders/components/OrderDetails';
import { RejectCancelForm } from '@/features/orders/components/RejectCancelForm';
import type {
  OrderWithRelations,
  OrderStatus,
  OrderFulfillmentType,
} from '@/types/database.types';
import { APP } from '@/constants/app';
import { DeliverForm } from '@/features/orders/components/DeliverForm';


export function OrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
 
  const [fulfillmentType, setFulfillmentType] = useState<
    OrderFulfillmentType | ''
  >('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<OrderWithRelations | null>(null);
 
const deliverModal = useDisclosure();

  const debouncedSearch = useDebounce(search, APP.SEARCH_DEBOUNCE_MS);
  const detailsModal = useDisclosure();
  const reasonModal = useDisclosure();

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      status,
      fulfillment_type: fulfillmentType,
      page,
      pageSize: APP.PAGE_SIZE,
    }),
    [debouncedSearch, status, fulfillmentType, page]
  );

  const { data, isLoading, isError, refetch } = useOrders(queryParams);
  const { confirm, deliver, reject } = useOrderMutations();

  const orders = data?.data ?? [];
  const totalItems = data?.count ?? 0;
  const totalPages = Math.ceil(totalItems / APP.PAGE_SIZE);

  const resetPage = () => setPage(1);
  const isBusy =
    confirm.isPending ||
    deliver.isPending ||
    reject.isPending;

  const handleView = (order: OrderWithRelations) => {
    setSelected(order);
    detailsModal.open();
  };

  const handleConfirm = () => {
    if (!selected) return;
    confirm.mutate(selected.id, { onSuccess: () => detailsModal.close() });
  };

 const handleDeliver = () => {
  deliverModal.open();
};

const handleDeliverSubmit = (fulfillmentType: OrderFulfillmentType) => {
  if (!selected) return;
  deliver.mutate(
    { id: selected.id, fulfillmentType },
    {
      onSuccess: () => {
        deliverModal.close();
        detailsModal.close();
      },
    }
  );
};


  // فتح نموذج السبب (رفض/إلغاء)
  const handleReject = () => {
    reasonModal.open();
  };

  const handleRejectSubmit = (reason: string) => {
    if (!selected) return;
    reject.mutate(
      { id: selected.id, reason },
      {
        onSuccess: () => {
          reasonModal.close();
          detailsModal.close();
        },
      }
    );
  };


  const hasFilters = !!(
    debouncedSearch ||
    status ||
    fulfillmentType
  );

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setFulfillmentType('');
    resetPage();
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* العنوان */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              الطلبات
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              استقبال ومعالجة طلبات التطبيق
              {!isLoading && !isError && (
                <span className="ms-1 text-slate-400 dark:text-slate-500">
                  · {totalItems} طلب
                </span>
              )}
            </p>
          </div>
        </div>
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
                  resetPage();
                }}
                placeholder="ابحث برقم الطلب أو الهاتف ..."
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
          <OrderFilters
            status={status}
            fulfillmentType={fulfillmentType}
            onStatusChange={(v) => {
              setStatus(v);
              resetPage();
            }}
            
            onFulfillmentChange={(v) => {
              setFulfillmentType(v);
              resetPage();
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
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="لا توجد طلبات"
            description={
              hasFilters
                ? 'لا توجد نتائج مطابقة للبحث أو الفلاتر'
                : 'لم تصل أي طلبات بعد'
            }
            action={
              hasFilters ? (
                <Button onClick={clearFilters} size="sm" variant="outline">
                  <X className="h-4 w-4" />
                  مسح الفلاتر
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <OrderTable orders={orders} onView={handleView} />
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

      {/* مودال التفاصيل */}
      <Modal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.close}
        title="تفاصيل الطلب"
        size="lg"
      >
        {selected && (
          <OrderDetails
            order={selected}
            onConfirm={handleConfirm}
            onDeliver={handleDeliver}
            onReject={handleReject}
            isBusy={isBusy}
          />
        )}
      </Modal>

      {/* مودال سبب الرفض/الإلغاء */}
      {/* مودال سبب الرفض */}
      <Modal
        isOpen={reasonModal.isOpen}
        onClose={reasonModal.close}
        title="رفض الطلب"
        size="md"
      >
        <RejectCancelForm
          mode="reject"
          onSubmit={handleRejectSubmit}
          onCancel={reasonModal.close}
          isLoading={reject.isPending}
        />
      </Modal>

      {/* مودال اختيار طريقة التسليم */}
<Modal
  isOpen={deliverModal.isOpen}
  onClose={deliverModal.close}
  title="تسليم الطلب"
  size="md"
>
  {selected && (
    <DeliverForm
      defaultValue={selected.fulfillment_type}
      onSubmit={handleDeliverSubmit}
      onCancel={deliverModal.close}
      isLoading={deliver.isPending}
    />
  )}
</Modal>


    </div>
  );
}

import { useMemo, useState } from 'react';
import { UserPlus, Users as UsersIcon, ArrowUpRight } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useAuth } from '@/hooks/useAuth';
import { useUsers, useUserMutations } from '@/features/users/hooks/useUsers';
import { useUpgradeRequests, useUpgradeRequestMutations } from '@/features/users/hooks/useUpgradeRequests';
import { UserTable } from '@/features/users/components/UserTable';
import { ManagerForm } from '@/features/users/components/ManagerForm';
import { ChangeRoleDialog } from '@/features/users/components/ChangeRoleDialog';
import { UpgradeRequestsTable } from '@/features/users/components/UpgradeRequestsTable';
import { ReviewUpgradeDialog } from '@/features/users/components/ReviewUpgradeDialog';
import { EditUserForm } from '@/features/users/components/EditUserForm';
import { ResetPasswordForm } from '@/features/users/components/ResetPasswordForm';
import {
  Button,
  Card,
  Input,
  Select,
  Modal,
  Pagination,
  EmptyState,
  TableSkeleton,
} from '@/components/ui';
import { APP, USER_ROLE_OPTIONS } from '@/constants/app';
import type { Profile, UserRole } from '@/types/database.types';
import type { UpgradeRequest } from '@/types/upgrade-request.types';

const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'active', label: 'مفعّل' },
  { value: 'inactive', label: 'معطّل' },
] as const;

type Tab = 'users' | 'upgrade-requests';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState<Tab>('users');

  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [status, setStatus] = useState<'' | 'active' | 'inactive'>('');
  const [page, setPage] = useState(1);
  const roleModal = useDisclosure();

  const debouncedSearch = useDebounce(search, APP.SEARCH_DEBOUNCE_MS);

  const isSuperAdmin = currentUser?.email === 'admin@bareq.com';

  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      role,
      is_active:
        status === '' ? undefined : status === 'active' ? true : false,
      excludeEmail: isSuperAdmin ? undefined : 'admin@bareq.com',
      page,
      pageSize: APP.PAGE_SIZE,
    }),
    [debouncedSearch, role, status, page, isSuperAdmin]
  );

  const { data, isLoading, isError } = useUsers(filters);
  const { updateRole, toggleActive, update, createManager, resetPassword, deleteUser } =
    useUserMutations();

  const { data: upgradeRequests = [], isLoading: requestsLoading } =
    useUpgradeRequests();
  const { approve: approveMutation, reject: rejectMutation } =
    useUpgradeRequestMutations();

  const addModal = useDisclosure();
  const editModal = useDisclosure();
  const resetModal = useDisclosure();
  const [selected, setSelected] = useState<Profile | null>(null);

  const deleteModal = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);

  const reviewModal = useDisclosure();
  const [reviewTarget, setReviewTarget] = useState<UpgradeRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');

  const totalItems = data?.count ?? 0;
  const totalPages = Math.ceil(totalItems / APP.PAGE_SIZE);

  const handleChangeRole = (u: Profile) => {
    setSelected(u);
    roleModal.open();
  };

  const handleToggleActive = (u: Profile) => {
    toggleActive.mutate({ id: u.id, is_active: !u.is_active });
  };

  const handleEdit = (u: Profile) => {
    setSelected(u);
    editModal.open();
  };

  const handleResetPassword = (u: Profile) => {
    setSelected(u);
    resetModal.open();
  };

  const handleDelete = (u: Profile) => {
    setDeleteTarget(u);
    deleteModal.open();
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteUser.mutate(deleteTarget.id, {
      onSuccess: deleteModal.close,
    });
  };

  const handleOpenApprove = (req: UpgradeRequest) => {
    setReviewTarget(req);
    setReviewAction('approve');
    reviewModal.open();
  };

  const handleOpenReject = (req: UpgradeRequest) => {
    setReviewTarget(req);
    setReviewAction('reject');
    reviewModal.open();
  };

  const handleReviewConfirm = (reason?: string) => {
    if (!reviewTarget || !currentUser) return;
    if (reviewAction === 'approve') {
      approveMutation.mutate(
        { id: reviewTarget.id, reviewedBy: currentUser.id },
        { onSuccess: reviewModal.close }
      );
    } else {
      rejectMutation.mutate(
        { id: reviewTarget.id, reviewedBy: currentUser.id, reason: reason ?? '' },
        { onSuccess: reviewModal.close }
      );
    }
  };

  const pendingCount = upgradeRequests.filter(
    (r) => r.status === 'pending'
  ).length;

  return (
    <div className="space-y-6">
      {/* الترويسة */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              إدارة المستخدمين
            </h1>
            <p className="text-sm text-slate-500">
              {totalItems} مستخدم — التحكم بالأدوار والحالة
            </p>
          </div>
        </div>

        <Button onClick={addModal.open}>
          <UserPlus className="h-4 w-4" />
          إضافة مدير
        </Button>
      </div>

      {/* التبويب */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60">
        <button
          type="button"
          onClick={() => setTab('users')}
          className={`relative flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tab === 'users'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          المستخدمون
          {pendingCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('upgrade-requests')}
          className={`relative flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tab === 'upgrade-requests'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          طلبات الترقية
          {pendingCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {tab === 'users' ? (
        <>
          {/* شريط الفلاتر */}
          <Card>
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <Input
                className="sm:max-w-xs"
                placeholder="بحث بالاسم أو البريد أو الهاتف..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <Select
                className="sm:w-48"
                options={[{ value: '', label: 'كل الأدوار' }, ...USER_ROLE_OPTIONS]}
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as UserRole | '');
                  setPage(1);
                }}
              />
              <Select
                className="sm:w-44"
                options={[...STATUS_OPTIONS]}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as '' | 'active' | 'inactive');
                  setPage(1);
                }}
              />
            </div>
          </Card>

          {/* المحتوى */}
          <Card>
            {isLoading ? (
              <TableSkeleton rows={APP.PAGE_SIZE} cols={5} />
            ) : isError ? (
              <EmptyState
                title="تعذّر تحميل المستخدمين"
                description="حدث خطأ أثناء جلب البيانات. حاول مرة أخرى."
              />
            ) : (data?.data.length ?? 0) === 0 ? (
              <EmptyState
                title="لا يوجد مستخدمون"
                description="لم يتم العثور على مستخدمين مطابقين للفلاتر."
              />
            ) : (
              <>
                <UserTable
                  users={data!.data}
                  currentUserId={currentUser?.id ?? ''}
                  onChangeRole={handleChangeRole}
                  onToggleActive={handleToggleActive}
                  onEdit={handleEdit}
                  onResetPassword={handleResetPassword}
                  onDelete={handleDelete}
                />
                {totalPages > 1 && (
                  <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                    <Pagination
                      currentPage={page}
                      totalItems={totalItems}
                      pageSize={APP.PAGE_SIZE}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        </>
      ) : (
        /* طلبات الترقية */
        <Card>
          {requestsLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : upgradeRequests.length === 0 ? (
            <EmptyState
              icon={ArrowUpRight}
              title="لا توجد طلبات ترقية"
              description="سيظهر هنا طلبات ترقية الحساب من زبون عادي إلى تاجر"
            />
          ) : (
            <UpgradeRequestsTable
              requests={upgradeRequests}
              onApprove={handleOpenApprove}
              onReject={handleOpenReject}
            />
          )}
        </Card>
      )}

      {/* نافذة إضافة مدير */}
      <Modal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        title="إضافة مدير جديد"
      >
        <ManagerForm
          isSubmitting={createManager.isPending}
          onCancel={addModal.close}
          onSubmit={(values) =>
            createManager.mutate(
              {
                email: values.email,
                password: values.password,
                full_name: values.full_name,
                phone: values.phone || null,
              },
              { onSuccess: addModal.close }
            )
          }
        />
      </Modal>

      {/* نافذة تغيير الدور */}
      <ChangeRoleDialog
        user={selected}
        isOpen={roleModal.isOpen}
        isSubmitting={updateRole.isPending}
        onClose={roleModal.close}
        onConfirm={(role) => {
          if (!selected) return;
          if (role === selected.role) {
            roleModal.close();
            return;
          }
          updateRole.mutate(
            { id: selected.id, role },
            { onSuccess: roleModal.close }
          );
        }}
      />

      {/* نافذة تعديل البيانات */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="تعديل بيانات المستخدم"
      >
        {selected && (
          <EditUserForm
            user={selected}
            isSubmitting={update.isPending}
            onCancel={editModal.close}
            onSubmit={(values) =>
              update.mutate(
                {
                  id: selected.id,
                  input: {
                    ...values,
                    phone: values.phone || null,
                    address: values.address || null,
                    city: values.city || null,
                    notes: values.notes || null,
                    shop_name: values.shop_name || null,
                    manager_name: values.manager_name || null,
                    shop_phone: values.shop_phone || null,
                    shop_landline: values.shop_landline || null,
                    shop_address: values.shop_address || null,
                  },
                },
                { onSuccess: editModal.close }
              )
            }
          />
        )}
      </Modal>

      {/* نافذة إعادة تعيين كلمة المرور */}
      <Modal
        isOpen={resetModal.isOpen}
        onClose={resetModal.close}
        title="إعادة تعيين كلمة المرور"
      >
        {selected && (
          <ResetPasswordForm
            user={selected}
            isSubmitting={resetPassword.isPending}
            onCancel={resetModal.close}
            onSubmit={(values) =>
              resetPassword.mutate(
                { id: selected.id, newPassword: values.password },
                { onSuccess: resetModal.close }
              )
            }
          />
        )}
      </Modal>

      {/* نافذة تأكيد حذف المستخدم */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="حذف المستخدم نهائياً"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            <p className="font-medium">تحذير! هذا الإجراء لا يمكن التراجع عنه.</p>
            <p className="mt-1">
              سيتم حذف المستخدم
              {deleteTarget && (
                <strong> ({deleteTarget.full_name || deleteTarget.email})</strong>
              )}
              نهائياً من قاعدة البيانات بما في ذلك حسابه وسجلّاته.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={deleteModal.close}>
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? 'جارٍ الحذف…' : 'تأكيد الحذف'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* نافذة مراجعة طلب الترقية */}
      <ReviewUpgradeDialog
        request={reviewTarget}
        action={reviewAction}
        isOpen={reviewModal.isOpen}
        isSubmitting={
          reviewAction === 'approve'
            ? approveMutation.isPending
            : rejectMutation.isPending
        }
        onClose={reviewModal.close}
        onConfirm={handleReviewConfirm}
      />
    </div>
  );
}

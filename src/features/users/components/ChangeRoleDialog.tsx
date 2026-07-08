import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Modal, Button, Select, Badge } from '@/components/ui';
import { USER_ROLE_META } from '@/constants/app';
import type { Profile, UserRole } from '@/types/entities.types';

interface ChangeRoleDialogProps {
  user: Profile | null;
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (role: UserRole) => void;
}

export function ChangeRoleDialog({
  user,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: ChangeRoleDialogProps) {
  const [newRole, setNewRole] = useState<UserRole>('customer');

  // إعادة ضبط القيمة كلما فُتحت النافذة على مستخدم جديد
  useEffect(() => {
    if (user) setNewRole(user.role);
  }, [user]);

  if (!user) return null;

  const currentMeta = USER_ROLE_META[user.role] ?? {
    label: user.role,
    color: 'gray' as const,
  };
  const nextMeta = USER_ROLE_META[newRole] ?? {
    label: newRole,
    color: 'gray' as const,
  };

  const ROLE_CHANGE_OPTIONS = [
    { value: 'customer', label: 'زبون عادي' },
    { value: 'wholesaler', label: 'تاجر' },
  ] as const;

  const isSameRole = newRole === user.role;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تغيير دور المستخدم">
      <div className="space-y-5">
        {/* اسم المستخدم */}
        <p className="text-sm text-slate-500">
          المستخدم:{' '}
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {user.full_name || user.email}
          </span>
        </p>

        {/* الانتقال البصري: من → إلى */}
        <div className="flex items-center justify-center gap-4 rounded-lg bg-slate-50 py-4 dark:bg-slate-800/50">
          <div className="text-center">
            <p className="mb-1 text-xs text-slate-400">الدور الحالي</p>
            <Badge color={currentMeta.color}>{currentMeta.label}</Badge>
          </div>

          <ArrowLeft className="h-5 w-5 text-slate-400" />

          <div className="text-center">
            <p className="mb-1 text-xs text-slate-400">الدور الجديد</p>
            <Badge color={nextMeta.color}>{nextMeta.label}</Badge>
          </div>
        </div>

        {/* اختيار الدور الجديد */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            اختر الدور الجديد
          </label>
          <Select
            options={ROLE_CHANGE_OPTIONS.map((o) => ({ ...o }))}
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as UserRole)}
          />
        </div>

        {/* الأزرار */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSameRole}
            onClick={() => onConfirm(newRole)}
          >
            {isSameRole ? 'لا تغيير' : 'تأكيد التغيير'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

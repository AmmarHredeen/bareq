import { useState } from 'react';
import { ShieldCheck, XCircle } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import type { UpgradeRequest } from '@/types/upgrade-request.types';

interface ReviewUpgradeDialogProps {
  request: UpgradeRequest | null;
  action: 'approve' | 'reject';
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export function ReviewUpgradeDialog({
  request,
  action,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: ReviewUpgradeDialogProps) {
  const [reason, setReason] = useState('');

  if (!request) return null;

  const isApprove = action === 'approve';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isApprove ? 'تأكيد الموافقة على طلب الترقية' : 'رفض طلب الترقية'}
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800/50">
          <p>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              المستخدم:
            </span>{' '}
            {request.user?.full_name || request.user?.email}
          </p>
          <p>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              المتجر:
            </span>{' '}
            {request.shop_name}
          </p>
          <p>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              المدير:
            </span>{' '}
            {request.manager_name}
          </p>
          <p>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              هاتف المتجر:
            </span>{' '}
            {request.shop_phone}
          </p>
          {request.shop_address && (
            <p>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                العنوان:
              </span>{' '}
              {request.shop_address}
            </p>
          )}
        </div>

        {isApprove ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            سيتم ترقية حساب المستخدم إلى <strong>تاجر</strong> والسماح له
            بالوصول إلى مميزات التجار.
          </p>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              سبب الرفض
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              rows={3}
              placeholder="اذكر سبب الرفض…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          {isApprove ? (
            <Button
              onClick={() => onConfirm()}
              disabled={isSubmitting}
            >
              <ShieldCheck className="h-4 w-4" />
              {isSubmitting ? 'جارٍ الموافقة…' : 'تأكيد الموافقة'}
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={() => onConfirm(reason)}
              disabled={isSubmitting || !reason.trim()}
            >
              <XCircle className="h-4 w-4" />
              {isSubmitting ? 'جارٍ الرفض…' : 'تأكيد الرفض'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

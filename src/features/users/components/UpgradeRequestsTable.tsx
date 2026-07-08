import { ShieldCheck, XCircle } from 'lucide-react';
import { Badge, Button, Avatar } from '@/components/ui';
import { formatDate } from '@/utils/format';
import type { UpgradeRequest } from '@/types/upgrade-request.types';

interface UpgradeRequestsTableProps {
  requests: UpgradeRequest[];
  onApprove: (r: UpgradeRequest) => void;
  onReject: (r: UpgradeRequest) => void;
}

const STATUS_META: Record<
  string,
  { label: string; color: 'yellow' | 'green' | 'red' }
> = {
  pending: { label: 'بانتظار المراجعة', color: 'yellow' },
  approved: { label: 'مقبول', color: 'green' },
  rejected: { label: 'مرفوض', color: 'red' },
};

export function UpgradeRequestsTable({
  requests,
  onApprove,
  onReject,
}: UpgradeRequestsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
            <th className="px-4 py-3 font-medium">مقدم الطلب</th>
            <th className="px-4 py-3 font-medium">المتجر</th>
            <th className="px-4 py-3 font-medium">المدير</th>
            <th className="px-4 py-3 font-medium">الحالة</th>
            <th className="px-4 py-3 font-medium">التاريخ</th>
            <th className="px-4 py-3 font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {requests.map((req) => {
            const statusMeta = STATUS_META[req.status] ?? STATUS_META.pending;
            const isPending = req.status === 'pending';

            return (
              <tr
                key={req.id}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={req.user?.full_name || req.user?.email || ''}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                        {req.user?.full_name || '—'}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {req.user?.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {req.shop_name}
                  </p>
                  <p className="text-xs text-slate-500">{req.shop_phone}</p>
                </td>

                <td className="px-4 py-3">
                  <p className="text-slate-900 dark:text-slate-100">
                    {req.manager_name}
                  </p>
                </td>

                <td className="px-4 py-3">
                  <Badge color={statusMeta.color}>{statusMeta.label}</Badge>
                  {req.status === 'rejected' && req.rejection_reason && (
                    <p className="mt-1 text-xs text-red-500">
                      {req.rejection_reason}
                    </p>
                  )}
                </td>

                <td className="px-4 py-3 text-slate-500">
                  {formatDate(req.created_at)}
                </td>

                <td className="px-4 py-3">
                  {isPending ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onApprove(req)}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        قبول
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => onReject(req)}
                      >
                        <XCircle className="h-4 w-4" />
                        رفض
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">
                      {req.status === 'approved' ? 'تمت الموافقة' : 'تم الرفض'}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

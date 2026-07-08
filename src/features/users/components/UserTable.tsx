import { ShieldCheck, ShieldOff, Pencil, KeyRound, UserCog, Trash2 } from 'lucide-react';
import { Avatar, Badge, Button } from '@/components/ui';
import { formatDate } from '@/utils/format';
import { USER_ROLE_META } from '@/constants/app';
import type { Profile } from '@/types/entities.types';

interface UserTableProps {
  users: Profile[];
  currentUserId: string;
  onChangeRole: (user: Profile) => void;
  onToggleActive: (user: Profile) => void;
  onEdit: (user: Profile) => void;
  onResetPassword: (user: Profile) => void;
  onDelete: (user: Profile) => void;
}

export function UserTable({
  users,
  currentUserId,
  onChangeRole,
  onToggleActive,
  onEdit,
  onResetPassword,
  onDelete,
}: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
            <th className="px-4 py-3 font-medium">المستخدم</th>
            <th className="px-4 py-3 font-medium">الدور</th>
            <th className="px-4 py-3 font-medium">الحالة</th>
            <th className="px-4 py-3 font-medium">تاريخ التسجيل</th>
            <th className="px-4 py-3 font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const roleMeta = USER_ROLE_META[user.role] ?? {
              label: user.role,
              color: 'gray' as const,
            };

            return (
              <tr
                key={user.id}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.full_name || user.email} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                        {user.full_name || '—'}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge color={roleMeta.color}>{roleMeta.label}</Badge>
                    {!isSelf && user.role !== 'admin' && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="تغيير الدور"
                        onClick={() => onChangeRole(user)}
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3">
                  {user.is_active ? (
                    <Badge color="green">مفعّل</Badge>
                  ) : (
                    <Badge color="red">معطّل</Badge>
                  )}
                </td>

                <td className="px-4 py-3 text-slate-500">
                  {formatDate(user.created_at)}
                </td>

                <td className="px-4 py-3">
                  {isSelf ? (
                    <span className="text-xs text-slate-400">حسابك الحالي</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="تعديل البيانات"
                        onClick={() => onEdit(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="إعادة تعيين كلمة المرور"
                        onClick={() => onResetPassword(user)}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="حذف المستخدم نهائياً"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={user.is_active ? 'outline' : 'secondary'}
                        size="sm"
                        onClick={() => onToggleActive(user)}
                      >
                        {user.is_active ? (
                          <>
                            <ShieldOff className="h-4 w-4" />
                            تعطيل
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-4 w-4" />
                            تفعيل
                          </>
                        )}
                      </Button>
                    </div>
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

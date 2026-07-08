import { Pencil, Trash2, Tag } from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatDate } from '@/utils/format';
import type { Category } from '@/types/database.types';

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
            <th className="px-4 py-3 font-medium">الاسم</th>
            <th className="px-4 py-3 font-medium">الوصف</th>
            <th className="px-4 py-3 font-medium">الظهور</th>
            <th className="px-4 py-3 font-medium">تاريخ الإضافة</th>
            <th className="px-4 py-3 text-left font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {categories.map((category) => (
            <tr
              key={category.id}
              className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-500 dark:bg-violet-500/15 dark:text-violet-400">
                    <Tag className="h-4 w-4" />
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {category.name}
                  </span>
                </div>
              </td>
              <td className="max-w-xs px-4 py-3 text-slate-500 dark:text-slate-400">
                <span className="line-clamp-1">{category.description || '—'}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {category.is_active ? (
                    <Badge color="green">نشط</Badge>
                  ) : (
                    <Badge color="gray">معطّل</Badge>
                  )}
                  {category.show_in_app && <Badge color="indigo">التطبيق</Badge>}
                  {category.show_in_newsletter && (
                    <Badge color="yellow">النشرة</Badge>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400 tabular-nums">
                {formatDate(category.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => onEdit(category)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
                    aria-label="تعديل"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(category)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    aria-label="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

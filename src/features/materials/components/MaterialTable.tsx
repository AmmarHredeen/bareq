import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatDate } from '@/utils/format';
import type { Material } from '@/types/database.types';

interface MaterialTableProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
}

export function MaterialTable({
  materials,
  onEdit,
  onDelete,
}: MaterialTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
            <th className="px-4 py-3 font-medium">الاسم</th>
            <th className="px-4 py-3 font-medium">الوصف</th>
            <th className="px-4 py-3 font-medium">الحالة</th>
            <th className="px-4 py-3 font-medium">تاريخ الإضافة</th>
            <th className="px-4 py-3 font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {materials.map((material) => (
            <tr
              key={material.id}
              className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                {material.name}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {material.description || '—'}
              </td>
              <td className="px-4 py-3">
                {material.is_active ? (
                  <Badge color="green">نشط</Badge>
                ) : (
                  <Badge color="gray">معطّل</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {formatDate(material.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(material)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40"
                    aria-label="تعديل"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(material)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
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

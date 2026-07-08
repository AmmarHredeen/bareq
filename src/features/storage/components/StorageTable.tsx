import { Pencil, Trash2, MemoryStick, HardDrive } from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatStorageSize } from '@/utils/storage';
import type { StorageOption } from '@/types/entities.types';

interface StorageTableProps {
  options: StorageOption[];
  onEdit: (option: StorageOption) => void;
  onDelete: (option: StorageOption) => void;
}

export function StorageTable({ options, onEdit, onDelete }: StorageTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
            <th className="px-4 py-3 font-medium">الخيار</th>
            <th className="px-4 py-3 font-medium">الرام</th>
            <th className="px-4 py-3 font-medium">التخزين</th>
            <th className="px-4 py-3 font-medium">الحالة</th>
            <th className="px-4 py-3 text-left font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {options.map((option) => (
            <tr
              key={option.id}
              className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-500 dark:bg-sky-500/15 dark:text-sky-400">
                    <HardDrive className="h-4 w-4" />
                  </span>
                  <span className="rounded-md bg-indigo-50 px-2.5 py-1 font-mono font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                    {option.label}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <MemoryStick className="h-3.5 w-3.5 text-slate-400" />
                  {option.ram_gb} GB
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                {formatStorageSize(option.storage_gb) === `${option.storage_gb}`
                  ? `${option.storage_gb} GB`
                  : formatStorageSize(option.storage_gb)}
              </td>
              <td className="px-4 py-3">
                {option.is_active ? (
                  <Badge color="green">نشط</Badge>
                ) : (
                  <Badge color="gray">معطّل</Badge>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => onEdit(option)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
                    aria-label="تعديل"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(option)}
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

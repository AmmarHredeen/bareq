import { Printer, ImageDown, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button, Input, Select } from '@/components/ui';
import {
  genId,
  type PosterSettings,
  type PosterMode,
  type WarrantyItem,
  type AgentItem,
} from '@/features/newsletter/lib/poster';
import type { NewsletterFilterOption } from '@/services/newsletter.service';

interface PosterToolbarProps {
  settings: PosterSettings;
  onChange: (s: PosterSettings) => void;
  brands: NewsletterFilterOption[];
  onPrint: () => void;
  onExportPng: () => void;
  exporting: boolean;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
      {children}
    </p>
  );
}

export function PosterToolbar({
  settings,
  onChange,
  brands,
  onPrint,
  onExportPng,
  exporting,
}: PosterToolbarProps) {
  const patch = (p: Partial<PosterSettings>) => onChange({ ...settings, ...p });

  const patchContact = (p: Partial<PosterSettings['contact']>) =>
    patch({ contact: { ...settings.contact, ...p } });

  const toggleBrand = (id: string) => {
    const set = new Set(settings.onlyBrandIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    patch({ onlyBrandIds: [...set] });
  };

  // ===== الكفالات =====
  const updateWarranty = (id: string, p: Partial<WarrantyItem>) =>
    patch({
      warranties: settings.warranties.map((w) =>
        w.id === id ? { ...w, ...p } : w
      ),
    });

  const addWarranty = () =>
    patch({
      warranties: [
        ...settings.warranties,
        { id: genId(), name: '', duration: '', brandIds: [] },
      ],
    });

  const removeWarranty = (id: string) =>
    patch({ warranties: settings.warranties.filter((w) => w.id !== id) });

  const toggleWarrantyBrand = (wid: string, bid: string) => {
    const w = settings.warranties.find((x) => x.id === wid);
    if (!w) return;
    const set = new Set(w.brandIds);
    if (set.has(bid)) set.delete(bid);
    else set.add(bid);
    updateWarranty(wid, { brandIds: [...set] });
  };

  // ===== الوكلاء =====
  const updateAgent = (id: string, p: Partial<AgentItem>) =>
    patch({
      agents: settings.agents.map((a) => (a.id === id ? { ...a, ...p } : a)),
    });

  const addAgent = () =>
    patch({
      agents: [...settings.agents, { id: genId(), name: '', phone: '' }],
    });

  const removeAgent = (id: string) =>
    patch({ agents: settings.agents.filter((a) => a.id !== id) });

  return (
    <div className="no-print space-y-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-card)] dark:border-slate-800 dark:bg-slate-900">
      {/* أزرار الإخراج */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="secondary" onClick={onExportPng} disabled={exporting}>
          <ImageDown size={16} />
          {exporting ? 'جارٍ التصدير…' : 'تصدير PNG'}
        </Button>
        <Button onClick={onPrint}>
          <Printer size={16} />
          PDF
        </Button>
      </div>

      {/* الإعدادات الأساسية — نوع السعر فقط (بلا تاريخ) */}
      <div>
        <SectionLabel>نوع السعر</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            value={settings.mode}
            options={[
              { value: 'retail', label: 'مفرق' },
              { value: 'wholesale', label: 'جملة' },
            ]}
            onChange={(e) => patch({ mode: e.target.value as PosterMode })}
          />
        </div>
      </div>

      {/* فلترة الماركات */}
      <div>
        <SectionLabel>عرض ماركات محددة (فارغ = الكل)</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => {
            const active = settings.onlyBrandIds.includes(b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => toggleBrand(b.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                  active
                    ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-300'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                )}
              >
                {b.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* بيانات التواصل والفوتر — كلها قابلة للتحكم */}
      <div>
        <SectionLabel>بيانات التواصل (تظهر في الفوتر)</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="الشعار / العبارة"
            value={settings.contact.slogan}
            onChange={(e) => patchContact({ slogan: e.target.value })}
          />
          <Input
            label="أرقام الهاتف (بفاصلة)"
            placeholder="0965677701, 0965677702"
            value={settings.contact.phones}
            onChange={(e) => patchContact({ phones: e.target.value })}
          />
          <Input
            label="رقم الشكاوى"
            value={settings.contact.complaints}
            onChange={(e) => patchContact({ complaints: e.target.value })}
          />
          <Input
            label="Tel"
            value={settings.contact.tel}
            onChange={(e) => patchContact({ tel: e.target.value })}
          />
          <Input
            label="الموقع / العنوان"
            value={settings.contact.address}
            onChange={(e) => patchContact({ address: e.target.value })}
          />
          <Input
            label="ملاحظة التوصيل"
            value={settings.contact.deliveryNote}
            onChange={(e) => patchContact({ deliveryNote: e.target.value })}
          />
          <Input
            label="ملاحظة الدفع"
            value={settings.contact.paymentNote}
            onChange={(e) => patchContact({ paymentNote: e.target.value })}
          />
        </div>
      </div>

      {/* الكفالات */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <SectionLabel>الكفالات</SectionLabel>
          <Button variant="secondary" onClick={addWarranty}>
            <Plus size={14} />
            إضافة كفالة
          </Button>
        </div>

        <div className="space-y-3">
          {settings.warranties.map((w) => (
            <div
              key={w.id}
              className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  placeholder="اسم الكفالة (كفالة كسر شاشة)"
                  value={w.name}
                  onChange={(e) => updateWarranty(w.id, { name: e.target.value })}
                />
                <Input
                  placeholder="المدة (120 يوم)"
                  value={w.duration}
                  onChange={(e) =>
                    updateWarranty(w.id, { duration: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => removeWarranty(w.id)}
                  className="flex items-center justify-center rounded-lg border border-red-200 px-3 text-red-500 transition hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                  title="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* الماركات المستفيدة */}
              <div className="mt-2">
                <p className="mb-1.5 text-[11px] text-slate-400">
                  الماركات المستفيدة (فارغ = كل الماركات)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {brands.map((b) => {
                    const active = w.brandIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => toggleWarrantyBrand(w.id, b.id)}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                          active
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                        )}
                      >
                        {b.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* الوكلاء */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <SectionLabel>الوكلاء</SectionLabel>
          <Button variant="secondary" onClick={addAgent}>
            <Plus size={14} />
            إضافة وكيل
          </Button>
        </div>

        <div className="space-y-2">
          {settings.agents.length === 0 && (
            <p className="text-xs text-slate-400">لا يوجد وكلاء مضافون بعد</p>
          )}
          {settings.agents.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]"
            >
              <Input
                placeholder="اسم الوكيل"
                value={a.name}
                onChange={(e) => updateAgent(a.id, { name: e.target.value })}
              />
              <Input
                placeholder="رقم الهاتف"
                value={a.phone}
                onChange={(e) => updateAgent(a.id, { phone: e.target.value })}
              />
              <button
                type="button"
                onClick={() => removeAgent(a.id)}
                className="flex items-center justify-center rounded-lg border border-red-200 px-3 text-red-500 transition hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                title="حذف"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

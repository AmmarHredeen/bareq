import { useState } from 'react';
import {
  Printer,
  ImageDown,
  Plus,
  Trash2,
  Columns3,
  ChevronDown,
  LayoutTemplate,
  Type,
  ShieldCheck,
  MapPin,
  Users,
  Palette,
  PaintBucket,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button, Input, Select } from '@/components/ui';
import {
  genId,
  DEFAULT_PRODUCT_FONTS,
  DEFAULT_FONT_FAMILY,
  FONT_FAMILIES,
  type PosterSettings,
  type PosterMode,
  type WarrantyItem,
  type AgentItem,
  type ContactInfo,
  type ContactField,
  type ProductFonts,
} from '@/features/newsletter/lib/poster';
import type { NewsletterFilterOption, NewsletterProduct } from '@/services/newsletter.service';
import { DEFAULT_THEME } from '@/features/newsletter/lib/poster';

interface PosterToolbarProps {
  settings: PosterSettings;
  onChange: (s: PosterSettings) => void;
  brands: NewsletterFilterOption[];
  products: NewsletterProduct[];
  onPrint: () => void;
  onExportPng: () => void;
  exporting: boolean;
}

const FONT_OPTIONS = FONT_FAMILIES.map((f) => ({
  value: f.value,
  label: f.label,
}));

function Accordion({
  title,
  icon: Icon,
  defaultOpen = false,
  action,
  children,
}: {
  title: React.ReactNode;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultOpen?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <Icon size={16} className="text-blue-500" />
          {title}
          <ChevronDown
            size={16}
            className={cn(
              'ms-auto text-slate-400 transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>
        {action && <div className="ms-2">{action}</div>}
      </div>
      {open && (
        <div className="border-t border-slate-100 p-3 dark:border-slate-700/60">
          {children}
        </div>
      )}
    </div>
  );
}

function ProductHighlightSection({
  products,
  productColors,
  onChange,
}: {
  products: NewsletterProduct[];
  productColors: Record<string, string>;
  onChange: (colors: Record<string, string>) => void;
}) {
  const [selectedId, setSelectedId] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ef4444');

  const addHighlight = () => {
    if (!selectedId) return;
    onChange({ ...productColors, [selectedId]: selectedColor });
    setSelectedId('');
  };

  const removeHighlight = (id: string) => {
    const next = { ...productColors };
    delete next[id];
    onChange(next);
  };

  const coloredCount = Object.keys(productColors).length;

  return (
    <Accordion
      title={
        <span>
          تمييز المنتجات بالألوان
          {coloredCount > 0 && (
            <span className="ms-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
              {coloredCount}
            </span>
          )}
        </span>
      }
      icon={PaintBucket}
    >
      {/* إضافة تلوين جديد */}
      <div className="mb-3 flex items-end gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
            اختر منتج
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">-- اختر --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.model || p.name}
                {p.storage_label ? ` (${p.storage_label})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
            اللون
          </label>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="h-9 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
            style={{ appearance: 'none' }}
          />
        </div>
        <Button
          variant="secondary"
          onClick={addHighlight}
          disabled={!selectedId}
        >
          <Plus size={14} />
          إضافة
        </Button>
      </div>

      {/* قائمة المنتجات الملونة */}
      {coloredCount === 0 ? (
        <p className="text-xs text-slate-400">
          لا توجد منتجات ملونة بعد. اختر منتجاً ولوناً أعلاه.
        </p>
      ) : (
        <div className="space-y-1.5">
          {products
            .filter((p) => productColors[p.id])
            .map((p) => {
              const color = productColors[p.id];
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 dark:border-slate-700"
                  style={{
                    borderInlineStart: `4px solid ${color}`,
                  }}
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="flex-1 truncate text-sm text-slate-700 dark:text-slate-200">
                    {p.model || p.name}
                    {p.storage_label ? ` (${p.storage_label})` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeHighlight(p.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                    title="إزالة التلوين"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </Accordion>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-slate-800/60">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-9 cursor-pointer rounded-md border-0 bg-transparent p-0"
          style={{ appearance: 'none' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent font-mono text-xs uppercase tabular-nums text-slate-600 outline-none dark:text-slate-300"
          spellCheck={false}
        />
      </div>
    </div>
  );
}


function SizeStepper({
  value,
  onChange,
  min = 6,
  max = 60,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div
      className="flex shrink-0 items-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60"
      title="حجم الخط"
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        className="flex h-8 w-7 items-center justify-center rounded-r-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
        className="w-9 bg-transparent text-center text-sm font-bold tabular-nums text-slate-700 outline-none dark:text-slate-200"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        className="flex h-8 w-7 items-center justify-center rounded-l-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        +
      </button>
    </div>
  );
}

/** حقل نصي + حجم + نوع خط. */
function FieldWithSize({
  label,
  field,
  onTextChange,
  onSizeChange,
  onFontChange,
  placeholder,
  textOnlySize = false,
}: {
  label: string;
  field: ContactField;
  onTextChange?: (v: string) => void;
  onSizeChange: (v: number) => void;
  onFontChange: (v: string) => void;
  placeholder?: string;
  textOnlySize?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        {textOnlySize ? (
          <div className="flex-1 rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 text-xs text-slate-400 dark:border-slate-600">
            تلقائي
          </div>
        ) : (
          <div className="flex-1">
            <Input
              value={field.text}
              placeholder={placeholder}
              onChange={(e) => onTextChange?.(e.target.value)}
            />
          </div>
        )}
        <SizeStepper value={field.fontSize} onChange={onSizeChange} />
      </div>
      <div className="mt-1.5">
        <Select
          value={field.fontFamily}
          options={FONT_OPTIONS}
          onChange={(e) => onFontChange(e.target.value)}
        />
      </div>
    </div>
  );
}

/** تحكم بحجم صورة (شعار/لوجو). */
function LogoSizeControl({
  label,
  src,
  value,
  onChange,
}: {
  label: string;
  src: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800/60">
          <img src={src} alt="" className="h-6 w-auto object-contain" />
          <span className="truncate text-xs text-slate-400">{src}</span>
        </div>
        <SizeStepper value={value} onChange={onChange} min={20} max={200} />
      </div>
    </div>
  );
}

export function PosterToolbar({
  settings,
  onChange,
  brands,
  products,
  onPrint,
  onExportPng,
  exporting,
}: PosterToolbarProps) {
  const patch = (p: Partial<PosterSettings>) => onChange({ ...settings, ...p });
  const patchTheme = (p: Partial<typeof settings.theme>) =>
    patch({ theme: { ...settings.theme, ...p } });

  const patchContact = (key: keyof ContactInfo, p: Partial<ContactField>) =>
    patch({
      contact: {
        ...settings.contact,
        [key]: { ...settings.contact[key], ...p },
      },
    });

  const patchProductFont = (key: keyof ProductFonts, value: number | string) =>
    patch({ productFonts: { ...settings.productFonts, [key]: value } });

  const resetProductFonts = () => patch({ productFonts: DEFAULT_PRODUCT_FONTS });

  const toggleBrand = (id: string) => {
    const set = new Set(settings.onlyBrandIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    patch({ onlyBrandIds: [...set] });
  };

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
        {
          id: genId(),
          name: '',
          duration: '',
          brandIds: [],
          fontSize: 15,
          brandFontSize: 9,
          fontFamily: DEFAULT_FONT_FAMILY,
        },
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

  const updateAgent = (id: string, p: Partial<AgentItem>) =>
    patch({
      agents: settings.agents.map((a) => (a.id === id ? { ...a, ...p } : a)),
    });

  const addAgent = () =>
    patch({
      agents: [
        ...settings.agents,
        {
          id: genId(),
          name: '',
          phone: '',
          fontSize: 10,
          fontFamily: DEFAULT_FONT_FAMILY,
        },
      ],
    });

  const removeAgent = (id: string) =>
    patch({ agents: settings.agents.filter((a) => a.id !== id) });

  const productFontFields: { key: keyof ProductFonts; label: string }[] = [
    { key: 'brandTitle', label: 'عنوان الماركة' },
    { key: 'categoryLabel', label: 'اسم الفئة' },
    { key: 'productName', label: 'اسم المنتج' },
    { key: 'productStorage', label: 'الذاكرة' },
    { key: 'price', label: 'السعر' },
  ];

  return (
    <div className="no-print rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[var(--shadow-card)] dark:border-slate-800 dark:bg-slate-900">
      {/* شريط علوي */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
        <div className="min-w-[120px] flex-1">
          <Select
            value={settings.mode}
            options={[
              { value: 'retail', label: 'سعر: مفرق' },
              { value: 'wholesale', label: 'سعر: جملة' },
            ]}
            onChange={(e) => patch({ mode: e.target.value as PosterMode })}
          />
        </div>

        <div className="flex min-w-[200px] flex-1 items-center gap-2">
          <Select
            value={settings.columns.auto ? 'auto' : 'manual'}
            options={[
              { value: 'auto', label: 'أعمدة: تلقائي' },
              { value: 'manual', label: 'أعمدة: يدوي' },
            ]}
            onChange={(e) =>
              patch({
                columns: {
                  ...settings.columns,
                  auto: e.target.value === 'auto',
                },
              })
            }
          />
          {!settings.columns.auto && (
            <Select
              value={String(settings.columns.manual)}
              options={[2, 3, 4, 5, 6, 7, 8].map((n) => ({
                value: String(n),
                label: `${n}`,
              }))}
              onChange={(e) =>
                patch({
                  columns: {
                    ...settings.columns,
                    manual: Number(e.target.value),
                  },
                })
              }
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onExportPng} disabled={exporting}>
            <ImageDown size={16} />
            {exporting ? '…' : 'PNG'}
          </Button>
          <Button onClick={onPrint}>
            <Printer size={16} />
            PDF
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {/* الترويسة والوسط */}
        <Accordion title="الترويسة والوسط" icon={LayoutTemplate} defaultOpen>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FieldWithSize
              label="الشعار (ضمان يريح بالك)"
              field={settings.contact.slogan}
              onTextChange={(v) => patchContact('slogan', { text: v })}
              onSizeChange={(v) => patchContact('slogan', { fontSize: v })}
              onFontChange={(v) => patchContact('slogan', { fontFamily: v })}
            />
            <LogoSizeControl
              label="شعار الشركة (bareq.png) — الحجم"
              src="/bareq.png"
              value={settings.logoSize}
              onChange={(v) => patch({ logoSize: v })}
            />
            <LogoSizeControl
              label="لوجو الزاوية (logo.jpeg) — الحجم"
              src="/logo.jpeg"
              value={settings.cornerLogoSize}
              onChange={(v) => patch({ cornerLogoSize: v })}
            />

            <FieldWithSize
              label="بريق تيل"
              field={settings.contact.brandNameAr}
              onTextChange={(v) => patchContact('brandNameAr', { text: v })}
              onSizeChange={(v) =>
                patchContact('brandNameAr', { fontSize: v })
              }
              onFontChange={(v) =>
                patchContact('brandNameAr', { fontFamily: v })
              }
            />
            <FieldWithSize
              label="التاريخ (أعلى النشرة)"
              field={settings.contact.date}
              onSizeChange={(v) => patchContact('date', { fontSize: v })}
              onFontChange={(v) => patchContact('date', { fontFamily: v })}
              textOnlySize
            />
            <FieldWithSize
              label="حسم الجملة"
              field={settings.contact.wholesaleDiscount}
              onTextChange={(v) =>
                patchContact('wholesaleDiscount', { text: v })
              }
              onSizeChange={(v) =>
                patchContact('wholesaleDiscount', { fontSize: v })
              }
              onFontChange={(v) =>
                patchContact('wholesaleDiscount', { fontFamily: v })
              }
            />
          </div>
        </Accordion>

        {/* أحجام خطوط المنتجات */}
        <Accordion
          title="خطوط المنتجات"
          icon={Type}
          action={
            <Button variant="secondary" onClick={resetProductFonts}>
              إعادة الضبط
            </Button>
          }
        >
          <div className="mb-3">
            <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
              نوع خط بطاقات المنتجات
            </label>
            <Select
              value={settings.productFonts.fontFamily}
              options={FONT_OPTIONS}
              onChange={(e) =>
                patchProductFont('fontFamily', e.target.value)
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {productFontFields.map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {label}
                </label>
                <SizeStepper
                  value={settings.productFonts[key] as number}
                  onChange={(v) => patchProductFont(key, v)}
                />
              </div>
            ))}
          </div>
        </Accordion>

        {/* الفوتر */}
        <Accordion title="الفوتر وبيانات التواصل" icon={MapPin}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FieldWithSize
              label="أرقام الهاتف (بفاصلة)"
              field={settings.contact.phones}
              placeholder="0965677701, 0965677702"
              onTextChange={(v) => patchContact('phones', { text: v })}
              onSizeChange={(v) => patchContact('phones', { fontSize: v })}
              onFontChange={(v) => patchContact('phones', { fontFamily: v })}
            />
            <FieldWithSize
              label="ملاحظة الدفع"
              field={settings.contact.paymentNote}
              onTextChange={(v) => patchContact('paymentNote', { text: v })}
              onSizeChange={(v) =>
                patchContact('paymentNote', { fontSize: v })
              }
              onFontChange={(v) =>
                patchContact('paymentNote', { fontFamily: v })
              }
            />
            <FieldWithSize
              label="ملاحظة التوصيل"
              field={settings.contact.deliveryNote}
              onTextChange={(v) => patchContact('deliveryNote', { text: v })}
              onSizeChange={(v) =>
                patchContact('deliveryNote', { fontSize: v })
              }
              onFontChange={(v) =>
                patchContact('deliveryNote', { fontFamily: v })
              }
            />
            <FieldWithSize
              label="الموقع / العنوان"
              field={settings.contact.address}
              onTextChange={(v) => patchContact('address', { text: v })}
              onSizeChange={(v) => patchContact('address', { fontSize: v })}
              onFontChange={(v) => patchContact('address', { fontFamily: v })}
            />
            <FieldWithSize
              label="رقم الشكاوى"
              field={settings.contact.complaints}
              onTextChange={(v) => patchContact('complaints', { text: v })}
              onSizeChange={(v) =>
                patchContact('complaints', { fontSize: v })
              }
              onFontChange={(v) =>
                patchContact('complaints', { fontFamily: v })
              }
            />
            <FieldWithSize
              label="Tel"
              field={settings.contact.tel}
              onTextChange={(v) => patchContact('tel', { text: v })}
              onSizeChange={(v) => patchContact('tel', { fontSize: v })}
              onFontChange={(v) => patchContact('tel', { fontFamily: v })}
            />
          </div>
        </Accordion>

        {/* فلترة الماركات */}
        <Accordion title="عرض ماركات محددة" icon={Columns3}>
          <p className="mb-2 text-[11px] text-slate-400">فارغ = عرض الكل</p>
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
        </Accordion>

        {/* الكفالات */}
        <Accordion
          title="الكفالات"
          icon={ShieldCheck}
          action={
            <Button variant="secondary" onClick={addWarranty}>
              <Plus size={14} />
              إضافة
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {settings.warranties.map((w) => (
              <div
                key={w.id}
                className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
              >
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-[11px] text-slate-400">
                      اسم الكفالة (حجم الشريط العلوي)
                    </label>
                    <Input
                      placeholder="كفالة كسر شاشة"
                      value={w.name}
                      onChange={(e) =>
                        updateWarranty(w.id, { name: e.target.value })
                      }
                    />
                  </div>
                  <SizeStepper
                    value={w.fontSize}
                    onChange={(v) => updateWarranty(w.id, { fontSize: v })}
                  />
                </div>

                <div className="mt-2 flex items-end gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-[11px] text-slate-400">
                      المدة (حجم تحت الماركة)
                    </label>
                    <Input
                      placeholder="120 يوم"
                      value={w.duration}
                      onChange={(e) =>
                        updateWarranty(w.id, { duration: e.target.value })
                      }
                    />
                  </div>
                  <SizeStepper
                    value={w.brandFontSize}
                    onChange={(v) =>
                      updateWarranty(w.id, { brandFontSize: v })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeWarranty(w.id)}
                    className="flex h-8 items-center justify-center rounded-lg border border-red-200 px-3 text-red-500 transition hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-2">
                  <label className="mb-1 block text-[11px] text-slate-400">
                    نوع الخط
                  </label>
                  <Select
                    value={w.fontFamily}
                    options={FONT_OPTIONS}
                    onChange={(e) =>
                      updateWarranty(w.id, { fontFamily: e.target.value })
                    }
                  />
                </div>

                <div className="mt-2">
                  <p className="mb-1.5 text-[11px] text-slate-400">
                    الماركات المستفيدة (اختر ماركة على الأقل لتظهر)
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
        </Accordion>

        {/* الوكلاء */}
        <Accordion
          title="الوكلاء"
          icon={Users}
          action={
            <Button variant="secondary" onClick={addAgent}>
              <Plus size={14} />
              إضافة
            </Button>
          }
        >
          {settings.agents.length === 0 ? (
            <p className="text-xs text-slate-400">لا يوجد وكلاء مضافون بعد</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {settings.agents.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="اسم الوكيل (وكيل حمص)"
                      value={a.name}
                      onChange={(e) =>
                        updateAgent(a.id, { name: e.target.value })
                      }
                    />
                    <Input
                      placeholder="رقم الهاتف"
                      value={a.phone}
                      onChange={(e) =>
                        updateAgent(a.id, { phone: e.target.value })
                      }
                    />
                    <SizeStepper
                      value={a.fontSize}
                      onChange={(v) => updateAgent(a.id, { fontSize: v })}
                    />
                    <button
                      type="button"
                      onClick={() => removeAgent(a.id)}
                      className="flex h-8 items-center justify-center rounded-lg border border-red-200 px-3 text-red-500 transition hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-2">
                    <Select
                      value={a.fontFamily}
                      options={FONT_OPTIONS}
                      onChange={(e) =>
                        updateAgent(a.id, { fontFamily: e.target.value })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Accordion>

        {/* الألوان والتدرجات */}
        <Accordion
          title="الألوان والتدرجات"
          icon={Palette}
          action={
            <Button
              variant="secondary"
              onClick={() => patch({ theme: DEFAULT_THEME })}
            >
              إعادة الضبط
            </Button>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                تدرج الترويسة
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <ColorField
                  label="اللون الأول"
                  value={settings.theme.headerFrom}
                  onChange={(v) => patchTheme({ headerFrom: v })}
                />
                <ColorField
                  label="اللون الأوسط"
                  value={settings.theme.headerVia}
                  onChange={(v) => patchTheme({ headerVia: v })}
                />
                <ColorField
                  label="اللون الأخير"
                  value={settings.theme.headerTo}
                  onChange={(v) => patchTheme({ headerTo: v })}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                تدرج الفوتر
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ColorField
                  label="اللون الأول"
                  value={settings.theme.footerFrom}
                  onChange={(v) => patchTheme({ footerFrom: v })}
                />
                <ColorField
                  label="اللون الأخير"
                  value={settings.theme.footerTo}
                  onChange={(v) => patchTheme({ footerTo: v })}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                شارة "ضمان يريح بالك"
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ColorField
                  label="اللون الأول"
                  value={settings.theme.sloganFrom}
                  onChange={(v) => patchTheme({ sloganFrom: v })}
                />
                <ColorField
                  label="اللون الأخير"
                  value={settings.theme.sloganTo}
                  onChange={(v) => patchTheme({ sloganTo: v })}
                />
              </div>
              {/* عناوين البراندات */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    خلفية أسماء البراندات
                  </p>
                  <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-500">
                    <input
                      type="checkbox"
                      checked={settings.theme.brandAuto}
                      onChange={(e) => patchTheme({ brandAuto: e.target.checked })}
                    />
                    تلقائي (يتبع الترويسة)
                  </label>
                </div>
                {!settings.theme.brandAuto && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ColorField
                      label="اللون الأول"
                      value={settings.theme.brandFrom}
                      onChange={(v) => patchTheme({ brandFrom: v })}
                    />
                    <ColorField
                      label="اللون الأخير"
                      value={settings.theme.brandTo}
                      onChange={(v) => patchTheme({ brandTo: v })}
                    />
                  </div>
                )}
              </div>

              {/* حسم الجملة */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    خلفية "حسم على فواتير الجملة"
                  </p>
                  <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-500">
                    <input
                      type="checkbox"
                      checked={settings.theme.discountAuto}
                      onChange={(e) => patchTheme({ discountAuto: e.target.checked })}
                    />
                    تلقائي (يتبع الترويسة)
                  </label>
                </div>
                {!settings.theme.discountAuto && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ColorField
                      label="اللون الأول"
                      value={settings.theme.discountFrom}
                      onChange={(v) => patchTheme({ discountFrom: v })}
                    />
                    <ColorField
                      label="اللون الأخير"
                      value={settings.theme.discountTo}
                      onChange={(v) => patchTheme({ discountTo: v })}
                    />
                  </div>
                )}
              </div>

            </div>
          </div>
        </Accordion>

        {/* تمييز المنتجات بالألوان */}
        <ProductHighlightSection
          products={products}
          productColors={settings.productColors}
          onChange={(productColors) => patch({ productColors })}
        />

      </div>
    </div>
  );
}

import { forwardRef, useMemo, useState } from 'react';
import {
  distributeIntoColumns,
  applyBrandLayout,
  moveBrand,
  computeColumnCount,
  warrantiesForBrand,
  formatPosterPrice,
  toEnglishDigits,
  resolveGradients,
  categorySortKey,
  categoryLabel,
  hexToRgba,
  moveWithin,
  type PosterBrandGroup,
  type PosterLine,
  type PosterSettings,
} from '@/features/newsletter/lib/poster';
import type { NewsletterFilterOption } from '@/services/newsletter.service';
import { cn } from '@/utils/cn';

interface PosterCanvasProps {
  groups: PosterBrandGroup[];
  settings: PosterSettings;
  allBrands: NewsletterFilterOption[];
  /** اختيارية — بدونها تبقى النشرة غير تفاعلية (كما في سياق التصدير البحت). */
  onProductClick?: (productId: string) => void;
  /** إعادة ترتيب منتجات فئة واحدة داخل براند واحد بالسحب. */
  onReorder?: (
    brandId: string,
    categoryName: string | null,
    orderedIds: string[]
  ) => void;
  /** إعادة توزيع البراندات على الأعمدة بالسحب. */
  onReorderBrands?: (layout: string[][], columnCount: number) => void;
}

const POSTER_WIDTH = 1240;
const PADDING = 24;
const COL_GAP = 12;

/* ===================== الأيقونات (SVG مضمّن) ===================== */

type IconProps = {
  size?: number;
  color?: string;
  className?: string;
};

const PhoneIcon = ({ size = 20, color = 'currentColor', className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ flexShrink: 0 }}
  >
    <path
      d="M6.5 3h3l1.5 4-2 1.5a11 11 0 005 5l1.5-2 4 1.5v3a2 2 0 01-2 2A16 16 0 014.5 5 2 2 0 016.5 3z"
      fill={color}
    />
  </svg>
);

const CreditCardIcon = ({ size = 20, color = 'currentColor', className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ flexShrink: 0 }}
  >
    <rect x="2" y="5" width="20" height="14" rx="2.5" fill={color} opacity="0.9" />
    <rect x="2" y="8.5" width="20" height="3" fill="#0f172a" opacity="0.35" />
    <rect x="5" y="14.5" width="6" height="2" rx="1" fill="#0f172a" opacity="0.35" />
  </svg>
);

const TruckIcon = ({ size = 20, color = 'currentColor', className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ flexShrink: 0 }}
  >
    <path d="M1 6.5A1.5 1.5 0 012.5 5H14a1 1 0 011 1v9H2a1 1 0 01-1-1V6.5z" fill={color} />
    <path d="M15 9h3.2a1 1 0 01.86.5L21 13v2a1 1 0 01-1 1h-5V9z" fill={color} opacity="0.85" />
    <circle cx="6" cy="17.5" r="2.2" fill="#0f172a" />
    <circle cx="17.5" cy="17.5" r="2.2" fill="#0f172a" />
    <circle cx="6" cy="17.5" r="0.9" fill="#fff" />
    <circle cx="17.5" cy="17.5" r="0.9" fill="#fff" />
  </svg>
);

const PinIcon = ({ size = 20, color = 'currentColor', className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ flexShrink: 0 }}
  >
    <path
      d="M12 2c-3.9 0-7 3.1-7 7 0 5 7 13 7 13s7-8 7-13c0-3.9-3.1-7-7-7z"
      fill={color}
    />
    <circle cx="12" cy="9" r="2.6" fill="#fff" />
  </svg>
);

const SparkleIcon = ({ size = 20, color = 'currentColor', className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ flexShrink: 0 }}
  >
    <path
      d="M12 2l2.2 6.4a3 3 0 001.9 1.9L22.5 12l-6.4 1.7a3 3 0 00-1.9 1.9L12 22l-2.2-6.4a3 3 0 00-1.9-1.9L1.5 12l6.4-1.7a3 3 0 001.9-1.9L12 2z"
      fill={color}
    />
  </svg>
);

/** مقبض السحب — ست نقاط صغيرة تتّسع لحشوة السطر بلا إزاحة. */
const GripIcon = () => (
  <svg width="6" height="14" viewBox="0 0 6 14" fill="#94a3b8" aria-hidden="true">
    <circle cx="1.5" cy="3" r="1.1" />
    <circle cx="4.5" cy="3" r="1.1" />
    <circle cx="1.5" cy="7" r="1.1" />
    <circle cx="4.5" cy="7" r="1.1" />
    <circle cx="1.5" cy="11" r="1.1" />
    <circle cx="4.5" cy="11" r="1.1" />
  </svg>
);

/* ===================== المكوّن الرئيسي ===================== */

export const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(
  function PosterCanvas(
    { groups, settings, onProductClick, onReorder, onReorderBrands },
    ref
  ) {
    const { contact, productFonts, theme } = settings;
    const gradients = resolveGradients(theme);

    const innerWidth = POSTER_WIDTH - PADDING * 2;

    const columnCount = useMemo(() => {
      if (!settings.columns.auto) {
        return Math.min(settings.columns.manual, Math.max(1, groups.length));
      }
      return computeColumnCount(groups, productFonts, innerWidth, COL_GAP);
    }, [groups, productFonts, settings.columns, innerWidth]);

    const columns = useMemo(
      () =>
        settings.manualBrandLayout.length
          ? applyBrandLayout(groups, settings.manualBrandLayout, columnCount)
          : distributeIntoColumns(groups, columnCount),
      [groups, columnCount, settings.manualBrandLayout]
    );

    // حالة سحب البراند ترتفع إلى هنا لأنها تعبر حدود البلوكات
    const [dragBrand, setDragBrand] = useState<string | null>(null);
    const [overBrand, setOverBrand] = useState<{
      id: string;
      after: boolean;
    } | null>(null);
    const [overColumnEnd, setOverColumnEnd] = useState<number | null>(null);

    const clearBrandDrag = () => {
      setDragBrand(null);
      setOverBrand(null);
      setOverColumnEnd(null);
    };

    /** التوزيع الحالي كمعرّفات — أساس أي نقل. */
    const currentLayout = () => columns.map((col) => col.map((g) => g.brandId));

    const dropBrandOn = (targetId: string, after: boolean) => {
      if (!onReorderBrands || !dragBrand || dragBrand === targetId) return;
      const layout = currentLayout();
      const toColumn = layout.findIndex((col) => col.includes(targetId));
      if (toColumn < 0) return;
      const without = layout[toColumn].filter((id) => id !== dragBrand);
      const at = without.indexOf(targetId);
      onReorderBrands(
        moveBrand(layout, dragBrand, toColumn, after ? at + 1 : at),
        columns.length
      );
      clearBrandDrag();
    };

    const dropBrandAtColumnEnd = (col: number) => {
      if (!onReorderBrands || !dragBrand) return;
      const layout = currentLayout();
      const without = layout[col].filter((id) => id !== dragBrand);
      onReorderBrands(
        moveBrand(layout, dragBrand, col, without.length),
        columns.length
      );
      clearBrandDrag();
    };

    const today = new Date().toISOString().slice(0, 10);

    const phones = contact.phones.text
      .split(',')
      .map((p) => toEnglishDigits(p.trim()))
      .filter(Boolean);

    return (
      <div
        ref={ref}
        className="poster-canvas mx-auto"
        dir="rtl"
        style={{
          width: POSTER_WIDTH,
          fontFamily: '"Cairo", "Tajawal", system-ui, sans-serif',
          background:
            'radial-gradient(1200px 600px at 80% -10%, #dbeafe 0%, transparent 60%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
          color: '#0f172a',
        }}
      >
        <div className="flex flex-col" style={{ padding: PADDING }}>
          {/* ===== الترويسة ===== */}
          <header
            className="relative overflow-hidden text-white"
            style={{
              background: `linear-gradient(135deg, ${theme.headerFrom} 0%, ${theme.headerVia} 45%, ${theme.headerTo} 100%)`,
              borderRadius: 20,
              boxShadow: '0 18px 40px -12px rgba(29,78,216,0.55)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(600px 200px at 20% 0%, rgba(255,255,255,0.22), transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: -40,
                left: -40,
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'rgba(56,189,248,0.25)',
                filter: 'blur(6px)',
              }}
            />

            {/* ضمان يريح بالك — ربع دائرة ملتصقة بالزاوية العلوية اليمنى للترويسة */}
            <div
              className="absolute top-0 flex items-center justify-center text-center font-black"
              style={{
                right: 0,
                fontSize: contact.slogan.fontSize,
                fontFamily: contact.slogan.fontFamily,
                minWidth: contact.slogan.fontSize * 5.5,
                maxWidth: contact.slogan.fontSize * 8,
                lineHeight: 1.35,
                padding: `${contact.slogan.fontSize * 0.7}px ${contact.slogan.fontSize * 0.9
                  }px`,
                backgroundColor: theme.sloganFrom,
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                borderTopRightRadius: 20,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: contact.slogan.fontSize * 2.6,
                borderBottomRightRadius: 0,
                zIndex: 2,
              }}
            >
              <span className="relative">{contact.slogan.text}</span>
            </div>

            <div className="relative flex items-center justify-between px-6 py-4">
              {/* مساحة فارغة يمين لتعويض الشعار المطلق */}
              <div
                style={{
                  minWidth: contact.slogan.fontSize * 5.5,
                  flexShrink: 0,
                }}
              />

              {/* شعار الشركة (bareq.png) بدل نص BAREQ Tel — في الوسط */}
              <div className="flex flex-col items-center text-center">
                <img
                  src="/bareq.png"
                  alt="BAREQ Tel"
                  className="object-contain"
                  style={{
                    height: settings.logoSize,
                    width: 'auto',
                    maxWidth: settings.logoSize * 4,
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))',
                  }}
                />
                <div
                  className="mt-1 font-bold opacity-90"
                  style={{
                    fontSize: contact.brandNameAr.fontSize,
                    fontFamily: contact.brandNameAr.fontFamily,
                  }}
                >
                  {contact.brandNameAr.text}
                </div>
              </div>

              {/* التاريخ + لوجو الزاوية يسار */}
              <div className="flex items-center gap-3">
                <div
                  className="text-center font-bold"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 12,
                    padding: '6px 12px',
                    backdropFilter: 'blur(4px)',
                    fontFamily: contact.date.fontFamily,
                  }}
                >
                  <div
                    className="opacity-80"
                    style={{ fontSize: contact.date.fontSize * 0.5 }}
                  >
                    التاريخ
                  </div>
                  <div
                    className="tabular-nums"
                    style={{ fontSize: contact.date.fontSize }}
                  >
                    {toEnglishDigits(today)}
                  </div>
                </div>

                <img
                  src="/logo.jpeg"
                  alt="Logo"
                  className="object-contain"
                  style={{
                    height: settings.cornerLogoSize,
                    width: 'auto',
                    maxWidth: settings.cornerLogoSize * 4,
                    borderRadius: settings.cornerLogoSize * 0.22,
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))',
                  }}
                />
              </div>
            </div>

            {/* شريط الكفالات */}
            <div className="relative flex flex-wrap items-center justify-center gap-2.5 px-6 pb-4">
              {settings.warranties
                .filter((w) => w.name.trim())
                .map((w) => (
                  <div
                    key={w.id}
                    className="text-center font-bold"
                    style={{
                      fontSize: w.fontSize,
                      fontFamily: w.fontFamily,
                      backgroundColor: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(250,204,21,0.55)',
                      borderRadius: 12,
                      padding: '8px 18px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                    }}
                  >
                    <span style={{ color: '#fde68a' }}>{w.name}</span>
                    {w.duration ? ` ( ${toEnglishDigits(w.duration)} )` : ''}
                  </div>
                ))}
            </div>
          </header>

          {/* ===== الأعمدة ===== */}
          <main className="mt-5 flex" style={{ gap: COL_GAP }}>
            {columns.map((col, ci) => (
              <div
                key={ci}
                className="flex flex-1 flex-col"
                style={{ gap: COL_GAP }}
              >
                {col.map((group) => (
                  <BrandBlock
                    key={group.brandId}
                    group={group}
                    settings={settings}
                    brandGradient={gradients.brand}
                    onProductClick={onProductClick}
                    onReorder={onReorder}
                    draggableBrand={!!onReorderBrands}
                    isDragging={dragBrand === group.brandId}
                    dropEdge={
                      overBrand?.id === group.brandId && dragBrand
                        ? overBrand.after
                          ? 'after'
                          : 'before'
                        : null
                    }
                    onBrandDragStart={(e) => {
                      setDragBrand(group.brandId);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', group.brandId);
                      const block = e.currentTarget.parentElement;
                      if (block) {
                        const r = block.getBoundingClientRect();
                        e.dataTransfer.setDragImage(
                          block,
                          e.clientX - r.left,
                          e.clientY - r.top
                        );
                      }
                    }}
                    onBrandDragOver={(e) => {
                      if (!dragBrand || dragBrand === group.brandId) return;
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = 'move';
                      // النصف السفلي = إفلات بعد البلوك
                      const r = e.currentTarget.getBoundingClientRect();
                      const after = e.clientY > r.top + r.height / 2;
                      setOverColumnEnd(null);
                      setOverBrand((c) =>
                        c?.id === group.brandId && c.after === after
                          ? c
                          : { id: group.brandId, after }
                      );
                    }}
                    onBrandDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const r = e.currentTarget.getBoundingClientRect();
                      dropBrandOn(
                        group.brandId,
                        e.clientY > r.top + r.height / 2
                      );
                    }}
                    onBrandDragEnd={clearBrandDrag}
                  />
                ))}

                {/* منطقة إفلات في نهاية العمود — تتيح النقل إلى عمود فارغ
                    أو إلى آخر العمود، وهو متعذّر بأهداف البلوكات وحدها */}
                {onReorderBrands && dragBrand && (
                  <div
                    className={cn(
                      'poster-column-drop',
                      overColumnEnd === ci && 'poster-column-drop-active'
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      setOverBrand(null);
                      setOverColumnEnd(ci);
                    }}
                    onDragLeave={() =>
                      setOverColumnEnd((c) => (c === ci ? null : c))
                    }
                    onDrop={(e) => {
                      e.preventDefault();
                      dropBrandAtColumnEnd(ci);
                    }}
                  />
                )}
              </div>
            ))}
          </main>

          {/* ===== حسم الجملة — البوكس كله يتناسب مع حجم الخط ===== */}
          {contact.wholesaleDiscount.text && (
            <div className="mt-6 flex items-center justify-center px-2">
              <div
                className="relative flex items-center justify-center"
                style={{
                  backgroundColor: gradients.discount.from,
                  borderRadius: contact.wholesaleDiscount.fontSize * 0.75,
                  padding: `${contact.wholesaleDiscount.fontSize * 0.75}px ${contact.wholesaleDiscount.fontSize * 1.4
                    }px`,
                  boxShadow: '0 12px 26px -10px rgba(0,0,0,0.45)',
                  border: `${Math.max(
                    2,
                    contact.wholesaleDiscount.fontSize * 0.09
                  )}px solid ${gradients.discount.to}`,
                }}
              >
                <div
                  className="flex items-center"
                  style={{ gap: contact.wholesaleDiscount.fontSize * 0.55 }}
                >
                  {/* شارة % دائرية صلبة */}
                  <div
                    className="flex shrink-0 items-center justify-center font-black"
                    style={{
                      width: contact.wholesaleDiscount.fontSize * 2.4,
                      height: contact.wholesaleDiscount.fontSize * 2.4,
                      borderRadius: '50%',
                      backgroundColor: '#f59e0b',
                      color: '#7c2d12',
                      fontSize: contact.wholesaleDiscount.fontSize * 1.3,
                      border: `${Math.max(
                        2,
                        contact.wholesaleDiscount.fontSize * 0.09
                      )}px solid #fde68a`,
                      lineHeight: 1,
                    }}
                  >
                    %
                  </div>

                  {/* النص */}
                  <span
                    className="whitespace-nowrap font-black"
                    style={{
                      fontSize: contact.wholesaleDiscount.fontSize,
                      fontFamily: contact.wholesaleDiscount.fontFamily,
                      color: '#ffffff',
                      lineHeight: 1.4,
                    }}
                  >
                    {contact.wholesaleDiscount.text}
                  </span>

                  {/* نجمة تسويقية (SVG) */}
                  <SparkleIcon
                    size={contact.wholesaleDiscount.fontSize * 1.2}
                    color="#fde68a"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===== الفوتر ===== */}
          <footer
            className="mt-5 text-white"
            style={{
              background: `linear-gradient(135deg, ${theme.footerFrom} 0%, ${theme.footerTo} 100%)`,
              borderRadius: 18,
              padding: '18px 24px',
              boxShadow: '0 16px 32px -14px rgba(30,58,138,0.55)',
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-5">
              {/* الأرقام يمين */}
              <div className="space-y-1">
                {phones.map((p) => (
                  <div
                    key={p}
                    className="flex items-center gap-2 font-bold tabular-nums"
                    style={{
                      fontSize: contact.phones.fontSize,
                      fontFamily: contact.phones.fontFamily,
                    }}
                  >
                    <PhoneIcon
                      size={contact.phones.fontSize * 1.05}
                      color="#e0f2fe"
                    />
                    <span dir="ltr">{p}</span>
                  </div>
                ))}
              </div>

              {/* الوسط: ملاحظات */}
              <div className="space-y-1.5 text-center font-semibold">
                {contact.paymentNote.text && (
                  <div
                    className="flex items-center justify-center gap-2"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      borderRadius: 10,
                      padding: '4px 12px',
                      fontSize: contact.paymentNote.fontSize,
                      fontFamily: contact.paymentNote.fontFamily,
                    }}
                  >
                    <CreditCardIcon
                      size={contact.paymentNote.fontSize * 1.1}
                      color="#fde68a"
                    />
                    <span>{contact.paymentNote.text}</span>
                  </div>
                )}
                {contact.deliveryNote.text && (
                  <div
                    className="flex items-center justify-center gap-2"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      borderRadius: 10,
                      padding: '4px 12px',
                      fontSize: contact.deliveryNote.fontSize,
                      fontFamily: contact.deliveryNote.fontFamily,
                    }}
                  >
                    <TruckIcon
                      size={contact.deliveryNote.fontSize * 1.1}
                      color="#bbf7d0"
                    />
                    <span>{contact.deliveryNote.text}</span>
                  </div>
                )}
                {contact.address.text && (
                  <div
                    className="flex items-center justify-center gap-2 opacity-90"
                    style={{
                      fontSize: contact.address.fontSize,
                      fontFamily: contact.address.fontFamily,
                    }}
                  >
                    <PinIcon
                      size={contact.address.fontSize * 1.1}
                      color="#fecaca"
                    />
                    <span>{contact.address.text}</span>
                  </div>
                )}
                {contact.complaints.text && (
                  <div
                    style={{
                      fontSize: contact.complaints.fontSize,
                      fontFamily: contact.complaints.fontFamily,
                    }}
                  >
                    للشكاوى: {toEnglishDigits(contact.complaints.text)}
                    {contact.tel.text
                      ? `  ·  Tel: ${toEnglishDigits(contact.tel.text)}`
                      : ''}
                  </div>
                )}
              </div>

              {/* الوكلاء يسار */}
              {settings.agents.filter((a) => a.name.trim() || a.phone.trim())
                .length > 0 && (
                  <div className="space-y-1 text-left">
                    {settings.agents
                      .filter((a) => a.name.trim() || a.phone.trim())
                      .map((a) => (
                        <div
                          key={a.id}
                          className="tabular-nums"
                          style={{
                            fontSize: a.fontSize,
                            fontFamily: a.fontFamily,
                          }}
                        >
                          {a.name}
                          {a.name && a.phone ? ': ' : ''}
                          {toEnglishDigits(a.phone)}
                        </div>
                      ))}
                  </div>
                )}
            </div>
          </footer>
        </div>
      </div>
    );
  }
);

/* ===================== بلوك العلامة التجارية ===================== */

function BrandBlock({
  group,
  settings,
  brandGradient,
  onProductClick,
  onReorder,
  draggableBrand,
  isDragging,
  dropEdge,
  onBrandDragStart,
  onBrandDragOver,
  onBrandDrop,
  onBrandDragEnd,
}: {
  group: PosterBrandGroup;
  settings: PosterSettings;
  brandGradient: { from: string; to: string };
  onProductClick?: (productId: string) => void;
  onReorder?: (
    brandId: string,
    categoryName: string | null,
    orderedIds: string[]
  ) => void;
  draggableBrand?: boolean;
  isDragging?: boolean;
  dropEdge?: 'before' | 'after' | null;
  onBrandDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onBrandDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onBrandDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onBrandDragEnd?: () => void;
}) {
  const { productFonts } = settings;
  // حالة السحب محلية للبلوك: الإفلات مسموح داخل نفس البراند والفئة فقط
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const brandWarranties = warrantiesForBrand(settings.warranties, group.brandId);

  const categoryGroups = new Map<string, PosterLine[]>();
  for (const line of group.lines) {
    const key = line.categoryName ?? 'أخرى';
    const list = categoryGroups.get(key) ?? [];
    list.push(line);
    categoryGroups.set(key, list);
  }

  return (
    <div
      className={cn(
        'overflow-hidden bg-white',
        isDragging && 'poster-brand-dragging',
        dropEdge === 'before' && 'poster-brand-drop-before',
        dropEdge === 'after' && 'poster-brand-drop-after'
      )}
      style={{
        borderRadius: 14,
        border: '1px solid #e0f2fe',
        boxShadow: '0 8px 20px -12px rgba(30,64,175,0.35)',
        fontFamily: productFonts.fontFamily,
      }}
      onDragOver={draggableBrand ? onBrandDragOver : undefined}
      onDrop={draggableBrand ? onBrandDrop : undefined}
    >
      <div
        className={cn(
          'text-center font-black uppercase tracking-wide text-white',
          draggableBrand && 'poster-brand-handle'
        )}
        style={{
          background: `linear-gradient(135deg, ${brandGradient.from} 0%, ${brandGradient.to} 100%)`,
          fontSize: productFonts.brandTitle,
          padding: '7px 8px',
          letterSpacing: '0.6px',
        }}
        draggable={draggableBrand}
        title={draggableBrand ? 'اسحب لنقل البراند' : undefined}
        onDragStart={draggableBrand ? onBrandDragStart : undefined}
        onDragEnd={draggableBrand ? onBrandDragEnd : undefined}
      >
        {group.brandName}
      </div>

      {brandWarranties.length > 0 && (
        <div
          className="text-center"
          style={{
            background: '#f0f9ff',
            padding: '3px 6px',
            borderBottom: '1px solid #e0f2fe',
            lineHeight: 1.4,
          }}
        >
          {brandWarranties.map((w, i) => (
            <span
              key={w.id}
              className="font-semibold"
              style={{
                fontSize: w.brandFontSize,
                fontFamily: w.fontFamily,
                color: '#0369a1',
              }}
            >
              {i > 0 && ' · '}
              {w.name}
              {w.duration ? ` (${toEnglishDigits(w.duration)})` : ''}
            </span>
          ))}
        </div>
      )}

      <div>
        {[...categoryGroups.entries()]
          .sort(
            ([a], [b]) =>
              categorySortKey(a) - categorySortKey(b) ||
              a.localeCompare(b, 'ar')
          )
          .map(([catName, lines], ci) => (
            <div key={catName}>
              {catName !== 'أخرى' && (
                <div
                  className="flex items-center"
                  style={{
                    gap: 6,
                    background: '#f0f9ff',
                    padding: '4px 8px',
                    borderTop: ci > 0 ? '1px solid #e0f2fe' : 'none',
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      height: 1,
                      background:
                        'linear-gradient(to left, #7dd3fc, transparent)',
                    }}
                  />
                  <span
                    dir="ltr"
                    className="font-extrabold uppercase"
                    style={{
                      fontSize: productFonts.categoryLabel,
                      color: '#0284c7',
                      letterSpacing: '0.09em',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.2,
                    }}
                  >
                    {categoryLabel(catName)}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      height: 1,
                      background:
                        'linear-gradient(to right, #7dd3fc, transparent)',
                    }}
                  />
                </div>
              )}
              <div>
                {lines.map((line, li) => {
                  // موضع الإسقاط الفعلي: أسفل الهدف عند السحب لأسفل وأعلاه
                  // عند السحب لأعلى — مطابق لما تفعله moveWithin.
                  const fromIdx = dragId
                    ? lines.findIndex((l) => l.id === dragId)
                    : -1;
                  const isTarget =
                    overId === line.id && fromIdx >= 0 && dragId !== line.id;

                  return (
                  <div
                    key={line.id}
                    className={cn(
                      'flex items-center justify-between gap-2',
                      onProductClick && 'poster-row-clickable',
                      dragId === line.id && 'poster-row-dragging',
                      isTarget &&
                        (fromIdx < li
                          ? 'poster-row-drop-after'
                          : 'poster-row-drop-before'),
                      onReorder && 'poster-row-reorderable'
                    )}
                    role={onProductClick ? 'button' : undefined}
                    tabIndex={onProductClick ? 0 : undefined}
                    title={onProductClick ? 'انقر للتعديل السريع' : undefined}
                    onDragOver={
                      onReorder
                        ? (e) => {
                            // الإفلات مسموح داخل نفس الفئة فقط
                            if (!dragId || !lines.some((l) => l.id === dragId)) {
                              e.dataTransfer.dropEffect = 'none';
                              return;
                            }
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            setOverId(line.id);
                          }
                        : undefined
                    }
                    onDragLeave={
                      onReorder
                        ? () => setOverId((c) => (c === line.id ? null : c))
                        : undefined
                    }
                    onDrop={
                      onReorder
                        ? (e) => {
                            e.preventDefault();
                            const ids = lines.map((l) => l.id);
                            const next = moveWithin(ids, dragId, line.id);
                            setDragId(null);
                            setOverId(null);
                            if (next) onReorder(group.brandId, line.categoryName, next);
                          }
                        : undefined
                    }
                    onClick={
                      onProductClick
                        ? () => onProductClick(line.id)
                        : undefined
                    }
                    onKeyDown={
                      onProductClick
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onProductClick(line.id);
                            }
                          }
                        : undefined
                    }
                    style={{
                      position: 'relative',
                      padding: '3px 8px',
                      background: settings.productColors[line.id]
                        ? hexToRgba(settings.productColors[line.id], 0.18)
                        : li % 2 === 1
                          ? '#f8fafc'
                          : '#ffffff',
                      borderInlineStart: settings.productColors[line.id]
                        ? `4px solid ${settings.productColors[line.id]}`
                        : undefined,
                    }}
                  >
                    {onReorder && (
                      <span
                        className="poster-drag-handle"
                        draggable
                        title="اسحب لتغيير الترتيب"
                        aria-label="مقبض السحب"
                        onClick={(e) => e.stopPropagation()}
                        onDragStart={(e) => {
                          setDragId(line.id);
                          e.dataTransfer.effectAllowed = 'move';
                          // لازم في فَيرفُكس كي يبدأ السحب أصلاً
                          e.dataTransfer.setData('text/plain', line.id);
                          // صورة السحب = السطر كله، مُمسَكاً من نقطة المؤشر
                          // نفسها (وسط السطر) لا من زاويته، فلا يقفز الشبح.
                          const row = e.currentTarget.parentElement;
                          if (row) {
                            const r = row.getBoundingClientRect();
                            e.dataTransfer.setDragImage(
                              row,
                              e.clientX - r.left,
                              e.clientY - r.top
                            );
                          }
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverId(null);
                        }}
                      >
                        <GripIcon />
                      </span>
                    )}
                    <span
                      className="font-black tabular-nums"
                      dir="ltr"
                      style={{
                        fontSize: productFonts.price,
                        color: '#1d4ed8',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatPosterPrice(line.price)}
                    </span>
                    <span
                      className="flex items-baseline gap-2"
                      style={{ minWidth: 0 }}
                    >
                      {line.storage && (
                        <span
                          className="shrink-0 font-medium"
                          style={{
                            fontSize: productFonts.productStorage,
                            color: productFonts.storageColor,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {toEnglishDigits(line.storage)}
                        </span>
                      )}
                      <span
                        className="font-bold"
                        style={{
                          fontSize: productFonts.productName,
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {toEnglishDigits(line.name)}
                      </span>
                    </span>
                  </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

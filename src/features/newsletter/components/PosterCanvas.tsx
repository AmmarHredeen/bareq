import { forwardRef, useMemo } from 'react';
import {
  distributeIntoColumns,
  computeColumnCount,
  warrantiesForBrand,
  formatPosterPrice,
  toEnglishDigits,
  resolveGradients,
  categorySortKey,
  hexToRgba,
  type PosterBrandGroup,
  type PosterLine,
  type PosterSettings,
} from '@/features/newsletter/lib/poster';
import type { NewsletterFilterOption } from '@/services/newsletter.service';

interface PosterCanvasProps {
  groups: PosterBrandGroup[];
  settings: PosterSettings;
  allBrands: NewsletterFilterOption[];
}

const POSTER_WIDTH = 1240;
const PADDING = 24;
const COL_GAP = 12;

export const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(
  function PosterCanvas({ groups, settings }, ref) {
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
      () => distributeIntoColumns(groups, columnCount),
      [groups, columnCount]
    );

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
                  />
                ))}
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

                  {/* نجمة تسويقية */}
                  <div
                    className="flex shrink-0 items-center justify-center font-black"
                    style={{
                      fontSize: contact.wholesaleDiscount.fontSize * 1.1,
                      color: '#fde68a',
                      lineHeight: 1,
                    }}
                  >
                    ✦
                  </div>
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
                    className="font-bold tabular-nums"
                    style={{
                      fontSize: contact.phones.fontSize,
                      fontFamily: contact.phones.fontFamily,
                    }}
                  >
                    📞 {p}
                  </div>
                ))}
              </div>

              {/* الوسط: ملاحظات */}
              <div className="space-y-1.5 text-center font-semibold">
                {contact.paymentNote.text && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      borderRadius: 10,
                      padding: '4px 12px',
                      fontSize: contact.paymentNote.fontSize,
                      fontFamily: contact.paymentNote.fontFamily,
                    }}
                  >
                    💳 {contact.paymentNote.text}
                  </div>
                )}
                {contact.deliveryNote.text && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      borderRadius: 10,
                      padding: '4px 12px',
                      fontSize: contact.deliveryNote.fontSize,
                      fontFamily: contact.deliveryNote.fontFamily,
                    }}
                  >
                    🚚 {contact.deliveryNote.text}
                  </div>
                )}
                {contact.address.text && (
                  <div
                    className="opacity-90"
                    style={{
                      fontSize: contact.address.fontSize,
                      fontFamily: contact.address.fontFamily,
                    }}
                  >
                    📍 {contact.address.text}
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

function BrandBlock({
  group,
  settings,
  brandGradient,
}: {
  group: PosterBrandGroup;
  settings: PosterSettings;
  brandGradient: { from: string; to: string };
}) {
  const { productFonts } = settings;

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
      className="overflow-hidden bg-white"
      style={{
        borderRadius: 14,
        border: '1px solid #e0f2fe',
        boxShadow: '0 8px 20px -12px rgba(30,64,175,0.35)',
        fontFamily: productFonts.fontFamily,
      }}
    >
      <div
        className="text-center font-black uppercase tracking-wide text-white"
        style={{
          background: `linear-gradient(135deg, ${brandGradient.from} 0%, ${brandGradient.to} 100%)`,
          fontSize: productFonts.brandTitle,
          padding: '7px 8px',
          letterSpacing: '0.6px',
        }}
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
          .sort(([a], [b]) => categorySortKey(a) - categorySortKey(b))
          .map(([catName, lines], ci) => (
            <div key={catName}>
              {catName !== 'جوال' && catName !== 'أخرى' && (
                <div
                  className="font-bold uppercase tracking-wide"
                  style={{
                    fontSize: productFonts.categoryLabel,
                    color: '#0284c7',
                    background: '#f0f9ff',
                    padding: '2px 8px',
                    borderTop: ci > 0 ? '1px dashed #bae6fd' : 'none',
                  }}
                >
                  {catName}
                </div>
              )}
              <div>
                {lines.map((line, li) => (
                  <div
                    key={line.id}
                    className="flex items-center justify-between gap-2"
                    style={{
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
                    <span
                      className="font-black tabular-nums"
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
                            color: '#64748b',
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
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

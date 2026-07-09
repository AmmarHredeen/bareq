import { forwardRef } from 'react';
import {
  distributeIntoColumns,
  formatPosterPrice,
  toEnglishDigits,
  categorySortKey,
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

const POSTER_WIDTH = 1240; // عرض ثابت، الارتفاع مرن
const COLUMNS = 6;

const HEADER_GRADIENT =
  'linear-gradient(135deg, #0284c7 0%, #1d4ed8 50%, #1e3a8a 100%)';

export const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(
  function PosterCanvas({ groups, settings, allBrands }, ref) {
    const { fonts } = settings;
    const columns = distributeIntoColumns(groups, COLUMNS);

    const brandName = (id: string) =>
      allBrands.find((b) => b.id === id)?.name ?? '';

    const today = new Date().toISOString().slice(0, 10);

    const phones = settings.contact.phones
      .split(',')
      .map((p) => toEnglishDigits(p.trim()))
      .filter(Boolean);

    const warrantyBrandsText = (brandIds: string[]) => {
      if (!brandIds.length)
        return allBrands.map((b) => b.name).filter(Boolean).join('، ');
      return brandIds.map(brandName).filter(Boolean).join('، ');
    };

    return (
      <div
        ref={ref}
        className="poster-canvas mx-auto bg-slate-50 text-slate-900"
        dir="rtl"
        style={{
          width: POSTER_WIDTH,
          fontFamily: '"Cairo", "Tajawal", system-ui, sans-serif',
        }}
      >
        <div className="flex flex-col p-5">
          {/* ===== الترويسة ===== */}
          <header
            className="relative overflow-hidden px-5 pb-3 pt-3 text-white"
            style={{ background: HEADER_GRADIENT, borderRadius: 14 }}
          >
            <div className="flex items-center justify-between">
              {/* الشعار يمين */}
              <div
                className="rounded-xl bg-white/15 px-4 py-2 text-center font-bold leading-tight backdrop-blur"
                style={{ fontSize: fonts.slogan }}
              >
                {settings.contact.slogan
                  .split(' ')
                  .map((w, i) => (
                    <div key={i}>{w}</div>
                  ))}
              </div>

              {/* الاسم والوسط */}
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div
                    className="font-extrabold tracking-tight"
                    style={{ fontSize: fonts.brandName }}
                  >
                    BAREQ Tel
                  </div>
                  <div
                    className="font-bold"
                    style={{ fontSize: fonts.brandName * 0.5 }}
                  >
                    بريق تيل
                  </div>
                </div>
              </div>

              {/* اللوغو يسار */}
              <img
                src="/logo.jpeg"
                alt="Bareq"
                className="rounded-full object-cover ring-2 ring-white/40 shadow-lg"
                style={{ height: fonts.brandName * 2, width: fonts.brandName * 2 }}
              />
            </div>

            {/* شريط الكفالات الكبير */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {settings.warranties
                .filter((w) => w.name.trim())
                .map((w) => (
                  <div
                    key={w.id}
                    className="rounded-lg bg-white/15 px-4 py-1.5 text-center font-bold backdrop-blur"
                    style={{ fontSize: fonts.warranty }}
                  >
                    {w.name}
                    {w.duration ? ` ( ${toEnglishDigits(w.duration)} )` : ''}
                    {w.brandIds.length > 0 && (
                      <span
                        className="ms-1 font-normal opacity-80"
                        style={{ fontSize: fonts.warranty * 0.7 }}
                      >
                        — {warrantyBrandsText(w.brandIds)}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </header>

          {/* ===== الأعمدة الستة ===== */}
          <main className="mt-4 flex gap-2">
            {columns.map((col, ci) => (
              <div key={ci} className="flex flex-1 flex-col gap-2">
                {col.map((group) => (
                  <BrandBlock key={group.brandId} group={group} fonts={fonts} />
                ))}
              </div>
            ))}
          </main>

          {/* ===== التاريخ + حسم الجملة ===== */}
          <div className="mt-4 flex items-center justify-center gap-6">
            <span
              className="font-extrabold text-orange-500 tabular-nums"
              style={{ fontSize: fonts.warranty + 4 }}
            >
              {toEnglishDigits(today)}
            </span>
            {settings.contact.wholesaleDiscount && (
              <span
                className="rounded-lg px-5 py-2 font-bold text-white"
                style={{ background: '#1e3a8a', fontSize: fonts.warranty }}
              >
                {settings.contact.wholesaleDiscount}
              </span>
            )}
          </div>

          {/* ===== الفوتر ===== */}
          <footer
            className="mt-4 rounded-xl px-5 py-3 text-white"
            style={{ background: '#1e3a8a' }}
          >
            <div
              className="flex flex-wrap items-start justify-between gap-4"
              style={{ fontSize: fonts.footer }}
            >
              {/* الأرقام يمين */}
              <div className="space-y-0.5 font-bold tabular-nums">
                {phones.map((p) => (
                  <div key={p}>{p}</div>
                ))}
              </div>

              {/* الوسط: ملاحظات */}
              <div className="space-y-1 text-center font-semibold">
                {settings.contact.paymentNote && (
                  <div>{settings.contact.paymentNote}</div>
                )}
                {settings.contact.deliveryNote && (
                  <div>{settings.contact.deliveryNote}</div>
                )}
                {settings.contact.address && (
                  <div className="opacity-90" style={{ fontSize: fonts.footer * 0.9 }}>
                    {settings.contact.address}
                  </div>
                )}
                {settings.contact.complaints && (
                  <div style={{ fontSize: fonts.footer * 0.9 }}>
                    للشكاوى والملاحظات: {toEnglishDigits(settings.contact.complaints)}
                    {settings.contact.tel
                      ? `  Tel:${toEnglishDigits(settings.contact.tel)}`
                      : ''}
                  </div>
                )}
              </div>

              {/* الوكلاء يسار */}
              {settings.agents.filter((a) => a.name.trim() || a.phone.trim())
                .length > 0 && (
                <div
                  className="space-y-0.5 text-left"
                  style={{ fontSize: fonts.agents }}
                >
                  {settings.agents
                    .filter((a) => a.name.trim() || a.phone.trim())
                    .map((a) => (
                      <div key={a.id} className="tabular-nums">
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
  fonts,
}: {
  group: PosterBrandGroup;
  fonts: PosterSettings['fonts'];
}) {
  const categoryGroups = new Map<string, PosterLine[]>();
  for (const line of group.lines) {
    const key = line.categoryName ?? 'أخرى';
    const list = categoryGroups.get(key) ?? [];
    list.push(line);
    categoryGroups.set(key, list);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-sky-100 bg-white shadow-md">
      <div
        className="px-2 py-1.5 text-center font-bold uppercase tracking-wide text-white"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          fontSize: fonts.brandTitle,
        }}
      >
        {group.brandName}
      </div>

      <div
        className="px-2 pt-0.5 text-center text-slate-400"
        style={{ fontSize: fonts.categoryLabel }}
      >
        كفالة كسر شاشة
      </div>

      <div>
        {[...categoryGroups.entries()]
          .sort(([a], [b]) => categorySortKey(a) - categorySortKey(b))
          .map(([catName, lines], ci) => (
            <div key={catName}>
              {ci > 0 && (
                <div className="mx-2 border-t border-dashed border-sky-200" />
              )}
              {catName !== 'جوال' && catName !== 'أخرى' && (
                <div
                  className="px-2 pt-0.5 font-bold uppercase tracking-wide text-sky-600"
                  style={{ fontSize: fonts.categoryLabel }}
                >
                  {catName}
                </div>
              )}
              <div>
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-center justify-between gap-1.5 px-2 py-[2px]"
                  >
                    <span
                      className="font-bold tabular-nums text-blue-700"
                      style={{ fontSize: fonts.price }}
                    >
                      {formatPosterPrice(line.price)}
                    </span>
                    <span className="flex items-baseline gap-2">
                      {line.storage && (
                        <span
                          className="shrink-0 font-normal text-slate-500"
                          style={{ fontSize: fonts.productStorage }}
                        >
                          {toEnglishDigits(line.storage)}
                        </span>
                      )}
                      <span
                        className="font-bold text-slate-800"
                        style={{ fontSize: fonts.productName }}
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

import { forwardRef } from 'react';
import {
  distributeIntoColumns,
  formatPosterPrice,
  toEnglishDigits,
  categorySortKey,
  type PosterBrandGroup,
  type PosterLine,
  type PosterSettings,
  type PosterFormat,
} from '@/features/newsletter/lib/poster';
import type { NewsletterFilterOption } from '@/services/newsletter.service';

interface PosterCanvasProps {
  groups: PosterBrandGroup[];
  settings: PosterSettings;
  format: PosterFormat;
  allBrands: NewsletterFilterOption[];
}

const FORMAT_DIMS: Record<PosterFormat, { w: number; cols: number }> = {
  a4: { w: 794, cols: 3 },
  square: { w: 1080, cols: 2 },
  story: { w: 1080, cols: 2 },
};

const HEADER_GRADIENT =
  'linear-gradient(135deg, #0284c7 0%, #1d4ed8 50%, #1e3a8a 100%)';

export const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(
  function PosterCanvas({
    groups,
    settings,
    format,
    allBrands,
  }: PosterCanvasProps, ref) {
  const dims = FORMAT_DIMS[format];
  const columns = distributeIntoColumns(groups, dims.cols);

  const brandName = (id: string) =>
    allBrands.find((b) => b.id === id)?.name ?? '';

  const today = new Date().toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const phones = settings.contact.phones
    .split(',')
    .map((p) => toEnglishDigits(p.trim()))
    .filter(Boolean)
    .join('  |  ');

  const warrantyBrandsText = (brandIds: string[]) => {
    if (!brandIds.length) return allBrands.map((b) => b.name).filter(Boolean).join('، ');
    return brandIds.map(brandName).filter(Boolean).join('، ');
  };

  const formatWithIcon = (icon: string, text: string) =>
    text ? (
      <div className="flex items-center gap-1.5 opacity-90">
        <span className="text-base">{icon}</span>
        <span>{text}</span>
      </div>
    ) : null;

  return (
    <div
      ref={ref}
      className="poster-canvas mx-auto bg-slate-50 text-slate-900"
      dir="rtl"
      style={{
        width: dims.w,
        fontFamily: '"Cairo", "Tajawal", system-ui, sans-serif',
      }}
    >
      <div className="flex flex-col px-6 pt-12 pb-12">
        <header
          className="relative px-4 pb-4 pt-3 text-white"
          style={{ background: HEADER_GRADIENT, borderRadius: 12 }}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold opacity-90">
              {settings.contact.slogan}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-extrabold tracking-tight">
                  BAREQ Tel
                </div>
                <div className="text-lg font-bold">بريق تيل</div>
              </div>
              <img
                src="/logo.jpeg"
                alt="Bareq"
                className="h-14 w-14 rounded-full object-cover ring-2 ring-white/40 shadow-lg"
              />
            </div>

            <div className="rounded-lg bg-white/15 px-3 py-1.5 text-center backdrop-blur">
              <div className="text-[10px] font-medium opacity-80">التاريخ</div>
              <div className="text-sm font-bold">
                {toEnglishDigits(today)}
              </div>
            </div>
          </div>

          <div className="mx-auto mt-2.5 h-0.5 w-3/4 rounded-full bg-white/20" />

          <div className="mt-2.5 flex flex-col items-center gap-1">
            {settings.warranties
              .filter((w) => w.name.trim())
              .map((w) => (
                <div
                  key={w.id}
                  className="flex flex-wrap items-center justify-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur"
                >
                  <span className="font-bold">
                    {w.name}
                    {w.duration ? ` ${toEnglishDigits(w.duration)}` : ''}
                  </span>
                  <span className="opacity-80">
                    — {warrantyBrandsText(w.brandIds)}
                  </span>
                </div>
              ))}
          </div>
        </header>

        <main className="flex gap-3 overflow-hidden">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-1 flex-col gap-2">
              {col.map((group) => (
                <BrandBlock key={group.brandId} group={group} />
              ))}
            </div>
          ))}
        </main>

        <footer
          className="mt-12 rounded-xl px-4 py-3 text-white"
          style={{ background: '#1e3a8a' }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3 text-xs">
            <div className="space-y-1">
              {phones && formatWithIcon('📞', `واتساب: ${phones}`)}
              {formatWithIcon('☎', settings.contact.complaints)}
              {formatWithIcon('📞', settings.contact.tel)}
              {formatWithIcon('📍', settings.contact.address)}

              {settings.agents.filter((a) => a.name.trim() || a.phone.trim())
                .length > 0 && (
                <div className="mt-1.5 border-t border-white/20 pt-1.5">
                  <div className="mb-0.5 text-[10px] font-bold opacity-80">الوكلاء:</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {settings.agents
                      .filter((a) => a.name.trim() || a.phone.trim())
                      .map((a) => (
                        <span key={a.id} className="text-[10px]">
                          {a.name}
                          {a.name && a.phone ? ': ' : ''}
                          {toEnglishDigits(a.phone)}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1 text-left">
              {settings.contact.deliveryNote && (
                <div className="rounded-lg bg-white/15 px-2.5 py-1 font-semibold">
                  {settings.contact.deliveryNote}
                </div>
              )}
              {settings.contact.paymentNote && (
                <div className="rounded-lg bg-white/15 px-2.5 py-1 font-semibold">
                  {settings.contact.paymentNote}
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
});

function BrandBlock({ group }: { group: PosterBrandGroup }) {
  const categoryGroups = new Map<string, PosterLine[]>();
  for (const line of group.lines) {
    const key = line.categoryName ?? 'أخرى';
    const list = categoryGroups.get(key) ?? [];
    list.push(line);
    categoryGroups.set(key, list);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-sky-100 shadow-md bg-white">
      <div
        className="px-2 py-1.5 text-center text-xs font-bold uppercase tracking-wide text-white"
        style={{
          background:
            'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        }}
      >
        {group.brandName}
      </div>

      <div>
        {[...categoryGroups.entries()]
          .sort(([a], [b]) => categorySortKey(a) - categorySortKey(b))
          .map(([catName, lines], ci) => (
          <div key={catName}>
            {ci > 0 && <div className="mx-2 border-t border-dashed border-sky-200" />}
            <div className="px-2 pt-0.5 pb-0 text-[10px] font-bold text-sky-600 uppercase tracking-wide">
              {catName}
            </div>
            <div>
              {lines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center justify-between gap-1.5 px-2 py-[2px] text-[12px]"
                >
                  <span className="font-bold text-blue-700 tabular-nums">
                    {formatPosterPrice(line.price)}
                  </span>
                  <span className="flex items-baseline gap-3">
                    {line.storage && (
                      <span className="shrink-0 font-normal text-slate-500">
                        {toEnglishDigits(line.storage)}
                      </span>
                    )}
                    <span className="font-bold text-slate-800">
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

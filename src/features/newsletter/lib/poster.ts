import type { NewsletterProduct } from '@/services/newsletter.service';

export type PosterMode = 'retail' | 'wholesale';
export type PosterFormat = 'a4' | 'square' | 'story';

/** كفالة قابلة للتحكم: اسم + مدة + الماركات المستفيدة (فارغ = كل الماركات). */
export interface WarrantyItem {
  id: string;
  name: string;
  duration: string;
  brandIds: string[];
}

/** وكيل: اسم + رقم. */
export interface AgentItem {
  id: string;
  name: string;
  phone: string;
}

/** بيانات التواصل والفوتر — كلها قابلة للتحكم. */
export interface ContactInfo {
  slogan: string; // ضمان يريح بالك
  phones: string; // أرقام مفصولة بفاصلة
  complaints: string; // رقم الشكاوى
  tel: string; // Tel
  address: string; // الموقع
  deliveryNote: string; // توصيل مجاني ضمن دمشق
  paymentNote: string; // نقبل الدفع كاش - شام كاش
}

export interface PosterSettings {
  mode: PosterMode;
  onlyBrandIds: string[];
  invoiceDate: string;
  warranties: WarrantyItem[];
  agents: AgentItem[];
  contact: ContactInfo;
}

/** مولّد معرّفات بسيط. */
export function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** تحويل كل الأرقام العربية (٠-٩) إلى إنجليزية (0-9). */
export function toEnglishDigits(
  input: string | number | null | undefined
): string {
  if (input == null) return '';
  const str = String(input);
  const arabicIndic = '٠١٢٣٤٥٦٧٨٩';
  const easternArabic = '۰۱۲۳۴۵۶۷۸۹';
  return str.replace(/[٠-٩۰-۹]/g, (ch) => {
    const i = arabicIndic.indexOf(ch);
    if (i > -1) return String(i);
    const j = easternArabic.indexOf(ch);
    return j > -1 ? String(j) : ch;
  });
}

export const DEFAULT_CONTACT: ContactInfo = {
  slogan: 'ضمان يريح بالك',
  phones: '0965677701, 0965677702, 0965677703',
  complaints: '0965677710',
  tel: '4807',
  address: 'جانب برج دمشق مقابل جسر فكتوريا طابق أول',
  deliveryNote: '🚚 توصيل مجاني ضمن دمشق',
  paymentNote: '💳 نقبل الدفع كاش - شام كاش',
};

export const DEFAULT_POSTER_SETTINGS: PosterSettings = {
  mode: 'retail',
  onlyBrandIds: [],
  invoiceDate: new Date().toISOString().slice(0, 10),
  warranties: [
    { id: genId(), name: 'كفالة كسر شاشة', duration: '120 يوم', brandIds: [] },
    { id: genId(), name: 'كفالة سوء صنع', duration: '30 يوم', brandIds: [] },
    { id: genId(), name: 'كفالة سوفت وير', duration: '5 سنوات', brandIds: [] },
  ],
  agents: [],
  contact: DEFAULT_CONTACT,
};

export interface PosterLine {
  id: string;
  spec: string;
  name: string;
  storage: string | null;
  price: number | null;
  categoryId: string | null;
  categoryName: string | null;
}

export interface PosterBrandGroup {
  brandId: string;
  brandName: string;
  lines: PosterLine[];
}

export const CATEGORY_ORDER: Record<string, number> = {
  'جوال': 0,
  'تابلت': 1,
  'ساعات': 2,
  'اكسسوارات': 3,
};

export function categorySortKey(name: string | null): number {
  if (!name) return 99;
  return CATEGORY_ORDER[name] ?? 99;
}

export function buildSpec(p: NewsletterProduct): string {
  const parts: string[] = [];
  parts.push(p.model?.trim() || p.name.trim());
  if (p.storage_label?.trim()) parts.push(p.storage_label.trim());
  return parts.join(' ');
}

function rawPrice(p: NewsletterProduct, mode: PosterMode): number | null {
  return mode === 'wholesale' ? p.wholesale_price : p.price;
}

/** تنسيق السعر بالدولار فقط، بأرقام إنجليزية. */
export function formatPosterPrice(price: number | null): string {
  if (price == null) return '—';
  const num = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(price);
  return `${num}$`;
}

export function buildPoster(
  products: NewsletterProduct[],
  settings: PosterSettings
): PosterBrandGroup[] {
  const { mode, onlyBrandIds } = settings;
  const groups = new Map<string, PosterBrandGroup>();

  for (const p of products) {
    if (!p.brand_id || !p.brand_name) continue;
    if (onlyBrandIds.length && !onlyBrandIds.includes(p.brand_id)) continue;

    const price = rawPrice(p, mode);

    const group =
      groups.get(p.brand_id) ??
      ({
        brandId: p.brand_id,
        brandName: p.brand_name,
        lines: [],
      } as PosterBrandGroup);

    group.lines.push({
      id: p.id,
      spec: buildSpec(p),
      name: p.model?.trim() || p.name.trim(),
      storage: p.storage_label?.trim() || null,
      price,
      categoryId: p.category_id,
      categoryName: p.category_name,
    });

    groups.set(p.brand_id, group);
  }

  const result = [...groups.values()];
  for (const g of result) {
    g.lines.sort((a, b) => {
      const catDiff = categorySortKey(a.categoryName) - categorySortKey(b.categoryName);
      if (catDiff !== 0) return catDiff;
      return (a.price ?? Infinity) - (b.price ?? Infinity);
    });
  }
  result.sort((a, b) => b.lines.length - a.lines.length);
  return result;
}

const MAX_LINES_PER_PAGE: Record<PosterFormat, number> = {
  a4: 24,
  square: 16,
  story: Infinity,
};

export function paginateGroups(
  groups: PosterBrandGroup[],
  format: PosterFormat
): PosterBrandGroup[][] {
  const maxLines = MAX_LINES_PER_PAGE[format];
  if (!isFinite(maxLines)) return [groups];

  const pages: PosterBrandGroup[][] = [];
  let currentPage: PosterBrandGroup[] = [];
  let currentLines = 0;

  for (const group of groups) {
    const groupLines = group.lines.length + 1;
    if (currentLines + groupLines > maxLines && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentLines = 0;
    }
    currentPage.push(group);
    currentLines += groupLines;
  }
  if (currentPage.length > 0) pages.push(currentPage);
  if (pages.length === 0) pages.push([]);
  return pages;
}

export function distributeIntoColumns(
  groups: PosterBrandGroup[],
  columnCount: number
): PosterBrandGroup[][] {
  const columns: PosterBrandGroup[][] = Array.from(
    { length: columnCount },
    () => []
  );
  const loads = new Array(columnCount).fill(0);

  for (const g of groups) {
    let min = 0;
    for (let i = 1; i < columnCount; i++) {
      if (loads[i] < loads[min]) min = i;
    }
    columns[min].push(g);
    loads[min] += g.lines.length + 1.5;
  }
  return columns;
}

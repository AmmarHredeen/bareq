import type { NewsletterProduct } from '@/services/newsletter.service';

export type PosterMode = 'retail' | 'wholesale';

/** الخطوط المتاحة للاختيار في كل العبارات. */
export const FONT_FAMILIES: { label: string; value: string }[] = [
  { label: 'Cairo (افتراضي)', value: '"Cairo", sans-serif' },
  { label: 'Tajawal', value: '"Tajawal", sans-serif' },
  { label: 'Almarai', value: '"Almarai", sans-serif' },
  { label: 'Changa', value: '"Changa", sans-serif' },
  { label: 'Reem Kufi (كوفي)', value: '"Reem Kufi", sans-serif' },
  { label: 'Lalezar (دعائي)', value: '"Lalezar", cursive' },
  { label: 'Rakkas (دعائي)', value: '"Rakkas", cursive' },
];

export const DEFAULT_FONT_FAMILY = '"Cairo", sans-serif';
export const MARKETING_FONT_FAMILY = '"Lalezar", cursive';

/** كفالة: اسم + مدة + الماركات + أحجام وخطوط. */
export interface WarrantyItem {
  id: string;
  name: string;
  duration: string;
  brandIds: string[];
  fontSize: number;
  brandFontSize: number;
  fontFamily: string;
}

export interface PosterTheme {
  headerFrom: string;
  headerVia: string;
  headerTo: string;
  footerFrom: string;
  footerTo: string;
  sloganFrom: string;
  sloganTo: string;

  // اشتقاق تلقائي من الترويسة؟
  brandAuto: boolean;
  discountAuto: boolean;

  // القيم اليدوية (تُستخدم فقط عند إيقاف التلقائي)
  brandFrom: string;
  brandTo: string;
  discountFrom: string;
  discountTo: string;
}

export const DEFAULT_THEME: PosterTheme = {
  headerFrom: '#0369a1',
  headerVia: '#1d4ed8',
  headerTo: '#1e293b',
  footerFrom: '#1e293b',
  footerTo: '#1e3a8a',
 
    sloganFrom: 'rgba(255,255,255,0.15)', // مثل خلفية التاريخ
  sloganTo: 'rgba(255,255,255,0.25)',

  brandAuto: true,
  discountAuto: true,

  brandFrom: '#1e3a8a',
  brandTo: '#3b82f6',
  discountFrom: '#1e3a8a',
  discountTo: '#2563eb',
};


export function resolveGradients(theme: PosterTheme) {
  const brand = theme.brandAuto
    ? {
        from: shadeColor(theme.headerVia, -0.15),
        to: shadeColor(theme.headerVia, 0.25),
      }
    : { from: theme.brandFrom, to: theme.brandTo };

  const discount = theme.discountAuto
    ? {
        from: shadeColor(theme.headerFrom, -0.1),
        to: shadeColor(theme.headerVia, 0.1),
      }
    : { from: theme.discountFrom, to: theme.discountTo };

  return { brand, discount };
}



/** وكيل: اسم + رقم + حجم وخط. */
export interface AgentItem {
  id: string;
  name: string;
  phone: string;
  fontSize: number;
  fontFamily: string;
}

/** حقل نصي: نص + حجم خط + نوع خط. */
export interface ContactField {
  text: string;
  fontSize: number;
  fontFamily: string;
}

export interface ContactInfo {
  slogan: ContactField;
  brandName: ContactField;
  brandNameAr: ContactField;
  phones: ContactField;
  complaints: ContactField;
  tel: ContactField;
  address: ContactField;
  deliveryNote: ContactField;
  paymentNote: ContactField;
  wholesaleDiscount: ContactField;
  date: ContactField;
}

/** أحجام + خط بطاقات المنتجات (مشتركة). */
export interface ProductFonts {
  fontFamily: string;
  brandTitle: number;
  categoryLabel: number;
  productName: number;
  productStorage: number;
  price: number;
}

export interface ColumnSettings {
  auto: boolean;
  manual: number;
}

export interface PosterSettings {
    theme: PosterTheme;
  mode: PosterMode;
  onlyBrandIds: string[];
  invoiceDate: string;
  warranties: WarrantyItem[];
  agents: AgentItem[];
  contact: ContactInfo;
  productFonts: ProductFonts;
  columns: ColumnSettings;
    logoSize: number;        // حجم شعار bareq.png (الوسط)
  cornerLogoSize: number;  // حجم logo.jpeg (الزاوية اليسرى)
  productColors: Record<string, string>; // productId -> لون التمييز

}


/** يحوّل hex إلى {r,g,b} */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** amount موجب = تفتيح، سالب = تغميق (من -1 إلى 1) */
export function shadeColor(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  if (amount >= 0) {
    return rgbToHex(
      r + (255 - r) * amount,
      g + (255 - g) * amount,
      b + (255 - b) * amount
    );
  }
  const k = 1 + amount;
  return rgbToHex(r * k, g * k, b * k);
}


export function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

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

/** مُنشئ حقل تواصل. */
function field(
  text: string,
  fontSize: number,
  fontFamily: string = DEFAULT_FONT_FAMILY
): ContactField {
  return { text, fontSize, fontFamily };
}

export const DEFAULT_CONTACT: ContactInfo = {
  slogan: field('ضمان يريح بالك', 18, MARKETING_FONT_FAMILY),
  brandName: field('BAREQ Tel', 30),
  brandNameAr: field('بريق تيل', 15),
  phones: field('0965677701, 0965677702, 0965677703', 11),
  complaints: field('0965677710', 9),
  tel: field('4807', 9),
  address: field('جانب برج دمشق مقابل جسر فكتوريا طابق أول', 10),
  deliveryNote: field('توصيل مجاني ضمن دمشق', 11),
  paymentNote: field('نقبل الدفع عن طريق شام كاش', 11),
  wholesaleDiscount: field('حسم على فواتير الجملة', 15, MARKETING_FONT_FAMILY),
  date: field('', 21),
};

export const DEFAULT_PRODUCT_FONTS: ProductFonts = {
  fontFamily: DEFAULT_FONT_FAMILY,
  brandTitle: 13,
  categoryLabel: 9,
  productName: 11,
  productStorage: 10,
  price: 11,
};

export const DEFAULT_COLUMNS: ColumnSettings = {
  auto: true,
  manual: 6,
};

function warranty(name: string, duration: string): WarrantyItem {
  return {
    id: genId(),
    name,
    duration,
    brandIds: [],
    fontSize: 15,
    brandFontSize: 9,
    fontFamily: DEFAULT_FONT_FAMILY,
  };
}

export const DEFAULT_POSTER_SETTINGS: PosterSettings = {
  mode: 'retail',
    logoSize: 70,
  cornerLogoSize: 60,
    theme: DEFAULT_THEME,

  onlyBrandIds: [],
  productColors: {},
  invoiceDate: new Date().toISOString().slice(0, 10),
  warranties: [
    warranty('كفالة كسر شاشة', '120 يوم'),
    warranty('كفالة سوء صنع', '30 يوم'),
    warranty('كفالة سوفت وير', '5 سنوات'),
  ],
  agents: [],
  contact: DEFAULT_CONTACT,
  productFonts: DEFAULT_PRODUCT_FONTS,
  columns: DEFAULT_COLUMNS,
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

export function formatPosterPrice(price: number | null): string {
  if (price == null) return '—';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * كفالات براند معيّن — فارغ = لا أحد.
 */
export function warrantiesForBrand(
  warranties: WarrantyItem[],
  brandId: string
): WarrantyItem[] {
  return warranties.filter(
    (w) => w.name.trim() && w.brandIds.includes(brandId)
  );
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
      const catDiff =
        categorySortKey(a.categoryName) - categorySortKey(b.categoryName);
      if (catDiff !== 0) return catDiff;
      return (a.price ?? Infinity) - (b.price ?? Infinity);
    });
  }
  result.sort((a, b) => b.lines.length - a.lines.length);
  return result;
}

export function estimateColumnWidth(
  groups: PosterBrandGroup[],
  productFonts: ProductFonts
): number {
  let maxNameLen = 0;
  let maxStorageLen = 0;
  let maxBrandLen = 0;

  for (const g of groups) {
    maxBrandLen = Math.max(maxBrandLen, g.brandName.length);
    for (const line of g.lines) {
      maxNameLen = Math.max(maxNameLen, toEnglishDigits(line.name).length);
      maxStorageLen = Math.max(
        maxStorageLen,
        line.storage ? toEnglishDigits(line.storage).length : 0
      );
    }
  }

  const CHAR = 0.58;
  const nameW = maxNameLen * productFonts.productName * CHAR;
  const storageW = maxStorageLen * productFonts.productStorage * CHAR;
  const priceW = 6 * productFonts.price * CHAR;
  const brandW = maxBrandLen * productFonts.brandTitle * CHAR;

  const contentW = Math.max(nameW + storageW + priceW + 34, brandW + 20);
  return Math.ceil(contentW);
}

export function computeColumnCount(
  groups: PosterBrandGroup[],
  productFonts: ProductFonts,
  posterWidth: number,
  gap: number
): number {
  if (groups.length === 0) return 1;

  const colW = estimateColumnWidth(groups, productFonts);
  const maxByWidth = Math.max(
    1,
    Math.floor((posterWidth + gap) / (colW + gap))
  );
  const byBrands = Math.min(maxByWidth, groups.length);
  return Math.min(byBrands, 8);
}

export function distributeIntoColumns(
  groups: PosterBrandGroup[],
  columnCount: number
): PosterBrandGroup[][] {
  const count = Math.max(1, columnCount);
  const columns: PosterBrandGroup[][] = Array.from({ length: count }, () => []);
  const loads = new Array(count).fill(0);

  for (const g of groups) {
    let min = 0;
    for (let i = 1; i < count; i++) {
      if (loads[i] < loads[min]) min = i;
    }
    columns[min].push(g);
    loads[min] += g.lines.length + 2;
  }
  return columns;
}

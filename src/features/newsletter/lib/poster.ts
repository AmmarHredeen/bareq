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
  /** لون نص الذاكرة/الرام. */
  storageColor: string;
}

export interface ColumnSettings {
  auto: boolean;
  manual: number;
}

/** حقل فرز منتجات البراند داخل كل فئة. `manual` = ترتيب يدوي بالسحب. */
export type SortField = 'price' | 'name' | 'manual';
export type SortDirection = 'asc' | 'desc';

export interface SortSettings {
  field: SortField;
  direction: SortDirection;
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
  sort: SortSettings;
  /** الترتيب اليدوي: مفتاح الدلو (براند|فئة) -> ترتيب معرّفات المنتجات. */
  manualOrder: Record<string, string[]>;
  /** توزيع البراندات اليدوي: قائمة معرّفات لكل عمود. فارغة = تلقائي. */
  manualBrandLayout: string[][];
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
  storageColor: '#64748b',
};

export const DEFAULT_COLUMNS: ColumnSettings = {
  auto: true,
  manual: 6,
};

export const DEFAULT_SORT: SortSettings = {
  field: 'price',
  direction: 'asc',
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
  manualOrder: {},
  manualBrandLayout: [],
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
  sort: DEFAULT_SORT,
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

/**
 * ترتيب الفئات وتسمياتها في النشرة.
 * المطابقة تتم على اسم مُطبَّع، وكل فئة لها مرادفات بالعربية والإنجليزية —
 * فلا يتوقف الترتيب على تهجئة بعينها في قاعدة البيانات.
 */
export const CATEGORY_DEFS: {
  order: number;
  label: string;
  aliases: string[];
}[] = [
  {
    order: 0,
    label: 'Smartphone',
    aliases: [
      'smartphone',
      'smart phone',
      'phone',
      'phones',
      'mobile',
      'mobiles',
      'جوال',
      'جوالات',
      'موبايل',
      'هاتف',
      'هواتف',
    ],
  },
  {
    order: 1,
    label: 'Tablet',
    aliases: ['tablet', 'tablets', 'تابلت', 'تابلیت', 'لوحي', 'ايباد'],
  },
  {
    order: 2,
    label: 'Smart Watch',
    aliases: [
      'smart watch',
      'smartwatch',
      'watch',
      'watches',
      'ساعات',
      'ساعه',
      'ساعه ذكيه',
      'ساعات ذكيه',
    ],
  },
  {
    order: 3,
    label: 'Accessories',
    aliases: ['accessories', 'accessory', 'اكسسوارات', 'اكسسوار', 'ملحقات'],
  },
];

/** يوحّد الاسم: مسافات، حالة الأحرف، وصور الألف/الهاء/الياء العربية. */
export function normalizeCategory(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ـ/g, '') // التطويل (ـ)
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '') // علامات التشكيل
    .replace(/\s+/g, ' ');
}

const CATEGORY_INDEX = new Map<string, { order: number; label: string }>();
for (const def of CATEGORY_DEFS) {
  for (const alias of def.aliases) {
    CATEGORY_INDEX.set(normalizeCategory(alias), {
      order: def.order,
      label: def.label,
    });
  }
}

function lookupCategory(name: string | null) {
  if (!name) return undefined;
  return CATEGORY_INDEX.get(normalizeCategory(name));
}

/** الفئات غير المعروفة تأتي بعد المعروفة كلها. */
export function categorySortKey(name: string | null): number {
  return lookupCategory(name)?.order ?? 99;
}

/** أي فئة خارج الجدول تُعرض باسمها كما هو في قاعدة البيانات. */
export function categoryLabel(name: string): string {
  return lookupCategory(name)?.label ?? name.trim();
}

export function buildSpec(p: NewsletterProduct): string {
  const parts: string[] = [];
  parts.push(p.name.trim());
  if (p.storage_label?.trim()) parts.push(p.storage_label.trim());
  return parts.join(' ');
}

function rawPrice(p: NewsletterProduct, mode: PosterMode): number | null {
  return mode === 'wholesale' ? p.wholesale_price : p.price;
}

export const CURRENCY_SYMBOL = '$';

export function formatPosterPrice(price: number | null): string {
  if (price == null) return '—';
  const value = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(price);
  return `${value} ${CURRENCY_SYMBOL}`;
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

/** مفتاح دلو الترتيب اليدوي: براند واحد + فئة واحدة. */
export function manualBucketKey(
  brandId: string,
  categoryName: string | null
): string {
  return `${brandId}|${categoryName ?? ''}`;
}

/** عند الوضع اليدوي، أي منتج غير مذكور في الترتيب المحفوظ يُرتَّب بهذا. */
export const MANUAL_FALLBACK_SORT: SortSettings = {
  field: 'price',
  direction: 'asc',
};

/** السعر تصاعدياً مع إبقاء القيم الفارغة في الآخر. */
function byPriceAsc(a: PosterLine, b: PosterLine): number {
  if (a.price == null && b.price == null) return 0;
  if (a.price == null) return 1;
  if (b.price == null) return -1;
  return a.price - b.price;
}

/** يقسم أسطر البراند إلى دلاء حسب الفئة، بترتيب الفئات الثابت. */
export function splitByCategory(
  lines: PosterLine[]
): { categoryName: string | null; lines: PosterLine[] }[] {
  const map = new Map<string, PosterLine[]>();
  for (const line of lines) {
    const key = line.categoryName ?? '';
    const arr = map.get(key) ?? [];
    arr.push(line);
    map.set(key, arr);
  }
  return [...map.entries()]
    .map(([key, ls]) => ({ categoryName: key || null, lines: ls }))
    .sort(
      (a, b) =>
        categorySortKey(a.categoryName) - categorySortKey(b.categoryName) ||
        (a.categoryName ?? '').localeCompare(b.categoryName ?? '', 'ar')
    );
}

/**
 * ترتيب أسطر فئة واحدة مع **إبقاء المنتجات متشابهة الاسم متلاصقة**.
 *
 * نرتّب مجموعات الأسماء لا الأسطر المفردة: المجموعة تأخذ موقع أرخص عنصر فيها
 * (أو أغلاه في التنازلي)، فلا يتسلل منتج بسعر متوسط بين نسختَي نفس المنتج.
 */
export function sortCategoryLines(
  lines: PosterLine[],
  sort: SortSettings
): PosterLine[] {
  const dir = sort.direction === 'desc' ? -1 : 1;

  const groups = new Map<string, PosterLine[]>();
  for (const line of lines) {
    const key = line.name.trim().toLowerCase();
    const arr = groups.get(key) ?? [];
    arr.push(line);
    groups.set(key, arr);
  }

  const entries = [...groups.values()];

  // داخل المجموعة: بالسعر — يتبع الاتجاه عند الفرز بالسعر، وتصاعدي عند الاسم
  for (const g of entries) {
    g.sort((a, b) => (sort.field === 'price' ? byPriceAsc(a, b) * dir : byPriceAsc(a, b)));
  }

  /** سعر المجموعة الممثِّل: الأدنى تصاعدياً والأعلى تنازلياً. */
  const groupPrice = (g: PosterLine[]): number | null => {
    const prices = g.map((l) => l.price).filter((v): v is number => v != null);
    if (prices.length === 0) return null;
    return dir === 1 ? Math.min(...prices) : Math.max(...prices);
  };

  entries.sort((ga, gb) => {
    if (sort.field === 'name') {
      return ga[0].name.localeCompare(gb[0].name, 'ar', { numeric: true }) * dir;
    }
    const pa = groupPrice(ga);
    const pb = groupPrice(gb);
    // المجموعات بلا سعر في الآخر دائماً، في الاتجاهين
    if (pa == null && pb == null)
      return ga[0].name.localeCompare(gb[0].name, 'ar', { numeric: true });
    if (pa == null) return 1;
    if (pb == null) return -1;
    if (pa !== pb) return (pa - pb) * dir;
    return ga[0].name.localeCompare(gb[0].name, 'ar', { numeric: true });
  });

  return entries.flat();
}

/**
 * الترتيب اليدوي لدلو واحد. المعرّفات غير المذكورة تُلحق في الآخر بالترتيب
 * التلقائي، والمعرّفات الميتة تُتجاهل — فإضافة منتج أو حذفه لا تكسر الترتيب.
 */
export function applyManualOrder(
  lines: PosterLine[],
  order: string[] | undefined
): PosterLine[] {
  const base = sortCategoryLines(lines, MANUAL_FALLBACK_SORT);
  if (!order?.length) return base;

  const rank = new Map(order.map((id, i) => [id, i]));
  const known = base
    .filter((l) => rank.has(l.id))
    .sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
  const rest = base.filter((l) => !rank.has(l.id));
  return [...known, ...rest];
}

/**
 * ينقل عنصراً داخل نفس القائمة إلى موضع الهدف.
 * يرجع null إذا كان النقل بلا أثر (لا مصدر، أو الهدف هو المصدر).
 */
export function moveWithin(
  ids: string[],
  from: string | null,
  to: string
): string[] | null {
  if (!from || from === to) return null;
  const fromIdx = ids.indexOf(from);
  const toIdx = ids.indexOf(to);
  if (fromIdx < 0 || toIdx < 0) return null;

  const out = ids.filter((id) => id !== from);
  const target = out.indexOf(to);
  // السحب لأسفل يضع العنصر بعد الهدف، ولأعلى قبله
  out.splice(fromIdx < toIdx ? target + 1 : target, 0, from);
  return out;
}

export function buildPoster(
  products: NewsletterProduct[],
  settings: PosterSettings
): PosterBrandGroup[] {
  const { mode, onlyBrandIds, sort, manualOrder } = settings;
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
      name: p.name.trim(),
      storage: p.storage_label?.trim() || null,
      price,
      categoryId: p.category_id,
      categoryName: p.category_name,
    });

    groups.set(p.brand_id, group);
  }

  const result = [...groups.values()];
  for (const g of result) {
    g.lines = splitByCategory(g.lines).flatMap((bucket) =>
      sort.field === 'manual'
        ? applyManualOrder(
            bucket.lines,
            manualOrder[manualBucketKey(g.brandId, bucket.categoryName)]
          )
        : sortCategoryLines(bucket.lines, sort)
    );
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
  let maxCategoryLen = 0;

  for (const g of groups) {
    maxBrandLen = Math.max(maxBrandLen, g.brandName.length);
    for (const line of g.lines) {
      maxNameLen = Math.max(maxNameLen, toEnglishDigits(line.name).length);
      maxStorageLen = Math.max(
        maxStorageLen,
        line.storage ? toEnglishDigits(line.storage).length : 0
      );
      if (line.categoryName) {
        maxCategoryLen = Math.max(
          maxCategoryLen,
          categoryLabel(line.categoryName).length
        );
      }
    }
  }

  const CHAR = 0.58;
  const nameW = maxNameLen * productFonts.productName * CHAR;
  const storageW = maxStorageLen * productFonts.productStorage * CHAR;
  // 6 خانات للرقم + مسافة ورمز العملة
  const priceW = (6 + 2) * productFonts.price * CHAR;
  const brandW = maxBrandLen * productFonts.brandTitle * CHAR;
  // عنوان الفئة: حروف كبيرة + تباعد أحرف (~25% زيادة) + مساحة الخطّين الجانبيين
  const categoryW =
    maxCategoryLen * productFonts.categoryLabel * CHAR * 1.25 + 44;

  const contentW = Math.max(
    nameW + storageW + priceW + 34,
    brandW + 20,
    categoryW
  );
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

/**
 * يوزّع البراندات على الأعمدة حسب توزيع يدوي محفوظ.
 *
 * يتسامح مع تغيّر البيانات: البراندات غير المذكورة تُلحق بأقل الأعمدة حِملاً
 * (نفس قاعدة التوزيع التلقائي)، والمعرّفات الميتة تُصفّى، ومحتوى الأعمدة
 * الزائدة يُدمج في الأخير بدل أن يختفي.
 */
export function applyBrandLayout(
  groups: PosterBrandGroup[],
  layout: string[][],
  columnCount: number
): PosterBrandGroup[][] {
  const count = Math.max(1, columnCount);
  const byId = new Map(groups.map((g) => [g.brandId, g]));
  const columns: PosterBrandGroup[][] = Array.from({ length: count }, () => []);
  const placed = new Set<string>();

  layout.forEach((ids, i) => {
    // الأعمدة الزائدة عن العدد الحالي تُدمج في الأخير
    const target = columns[Math.min(i, count - 1)];
    for (const id of ids) {
      const g = byId.get(id);
      if (!g || placed.has(id)) continue;
      target.push(g);
      placed.add(id);
    }
  });

  const load = (col: PosterBrandGroup[]) =>
    col.reduce((sum, g) => sum + g.lines.length + 2, 0);

  for (const g of groups) {
    if (placed.has(g.brandId)) continue;
    let min = 0;
    for (let i = 1; i < count; i++) {
      if (load(columns[i]) < load(columns[min])) min = i;
    }
    columns[min].push(g);
    placed.add(g.brandId);
  }

  return columns;
}

/**
 * ينقل براندًا إلى عمود وموضع محددين، ويرجع التوزيع الجديد كمعرّفات.
 * `toIndex` هو الموضع المطلوب داخل العمود الهدف بعد إزالة المسحوب.
 */
export function moveBrand(
  layout: string[][],
  brandId: string,
  toColumn: number,
  toIndex: number
): string[][] {
  const next = layout.map((col) => col.filter((id) => id !== brandId));
  const col = next[toColumn] ?? (next[toColumn] = []);
  col.splice(Math.max(0, Math.min(toIndex, col.length)), 0, brandId);
  return next;
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

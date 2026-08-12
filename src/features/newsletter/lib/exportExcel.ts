import type { Workbook, Worksheet } from 'exceljs';
import {
  resolveGradients,
  shadeColor,
  toEnglishDigits,
  type PosterBrandGroup,
  type PosterSettings,
} from '@/features/newsletter/lib/poster';

/** exceljs يطلب ألواناً بصيغة ARGB بدون '#'. */
function toArgb(hex: string): string {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  return `FF${full.toUpperCase()}`;
}

const COLUMN_HEADERS = ['المنتج', 'الذاكرة', 'السعر'];
const COLUMN_WIDTHS = [34, 14, 14];
/** رمز العملة جزء من تنسيق العرض، فتبقى الخلية رقماً قابلاً للجمع. */
const PRICE_FORMAT = '#,##0 "$"';

function styleTitleRow(sheet: Worksheet, headerColor: string): void {
  sheet.mergeCells('A1:C1');
  const cell = sheet.getCell('A1');
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: toArgb(headerColor) },
  };
  sheet.getRow(1).height = 30;
}

function styleHeaderRow(sheet: Worksheet): void {
  const row = sheet.getRow(2);
  row.height = 20;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FF1E293B' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0F2FE' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
    };
  });
}

/**
 * يبني مصنّف xlsx من نفس مجموعات النشرة المعروضة.
 * exceljs يُحمّل ديناميكياً كي لا يدخل الحزمة الرئيسية.
 */
export async function buildNewsletterWorkbook(
  groups: PosterBrandGroup[],
  settings: PosterSettings
): Promise<Workbook> {
  const { default: ExcelJS } = await import('exceljs');

  const gradients = resolveGradients(settings.theme);
  const brandColor = toArgb(gradients.brand.from);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BAREQ Tel';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('نشرة الأسعار', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 2 }],
  });

  sheet.columns = COLUMN_WIDTHS.map((width) => ({ width }));

  const modeLabel = settings.mode === 'wholesale' ? 'الجملة' : 'المفرق';
  const today = new Date().toISOString().slice(0, 10);
  sheet.addRow([`BAREQ Tel — نشرة أسعار ${modeLabel} — ${today}`]);
  styleTitleRow(sheet, settings.theme.headerVia);

  sheet.addRow(COLUMN_HEADERS);
  styleHeaderRow(sheet);

  for (const group of groups) {
    const brandRow = sheet.addRow([group.brandName]);
    sheet.mergeCells(`A${brandRow.number}:C${brandRow.number}`);
    brandRow.height = 22;
    const brandCell = sheet.getCell(`A${brandRow.number}`);
    brandCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    brandCell.alignment = { horizontal: 'center', vertical: 'middle' };
    brandCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: brandColor },
    };

    for (const line of group.lines) {
      const row = sheet.addRow([
        toEnglishDigits(line.name),
        line.storage ? toEnglishDigits(line.storage) : '',
        line.price ?? '—',
      ]);

      const priceCell = row.getCell(3);
      priceCell.alignment = { horizontal: 'center' };
      if (line.price == null) {
        priceCell.font = { color: { argb: 'FF94A3B8' } };
      } else {
        priceCell.numFmt = PRICE_FORMAT;
        priceCell.font = { bold: true, color: { argb: 'FF1D4ED8' } };
      }
      row.getCell(2).alignment = { horizontal: 'center' };

      const highlight = settings.productColors[line.id];
      if (highlight) {
        // إكسل يتجاهل الشفافية في التعبئة، فنفتّح اللون نحو الأبيض بدلاً منها
        const tint = toArgb(shadeColor(highlight, 0.75));
        for (let c = 1; c <= COLUMN_HEADERS.length; c++) {
          row.getCell(c).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: tint },
          };
        }
        row.getCell(1).font = { bold: true, color: { argb: toArgb(highlight) } };
      }
    }

    sheet.addRow([]);
  }

  return workbook;
}

/** يبني الملف ثم ينزّله في المتصفح. */
export async function exportPosterAsExcel(
  groups: PosterBrandGroup[],
  settings: PosterSettings,
  fileName: string
): Promise<void> {
  const workbook = await buildNewsletterWorkbook(groups, settings);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

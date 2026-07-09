import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

/**
 * يلتقط عنصر النشرة كـ canvas.
 * scale = 2 كافٍ تماماً للوضوح والطباعة (بدل 3 التي تضخّم الحجم).
 */
async function captureCanvas(
  
  element: HTMLElement,
  scale: number
): Promise<HTMLCanvasElement> {
  
  return html2canvas(element, {
    scale,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    width: element.offsetWidth,
    height: element.offsetHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });
}

/**
 * تصدير PNG.
 * ملاحظة: النشرة مليئة بالتدرجات والصور، لذا JPEG أصغر بكثير من PNG
 * مع فرق بصري شبه معدوم. نستخدم JPEG بجودة 0.92 افتراضياً.
 */
export async function exportPosterAsPng(
  element: HTMLElement,
  fileName: string,
  scale = 2
): Promise<void> {
  const canvas = await captureCanvas(element, scale);

  const link = document.createElement('a');
  // نصدّر كـ JPEG لتقليل الحجم بشكل كبير
  link.download = fileName.replace(/\.png$/i, '.jpg');
  link.href = canvas.toDataURL('image/jpeg', 0.92);
  link.click();
}

/**
 * تصدير PDF مضغوط.
 * التغييرات الحاسمة: JPEG بدل PNG + compress:true + خوارزمية FAST + scale=2.
 * هذا وحده ينزل بالحجم من عشرات الميغابايت إلى أقل من 2MB.
 */
export async function exportPosterAsPdf(
  element: HTMLElement,
  fileName: string,
  scale = 2
): Promise<void> {
  const canvas = await captureCanvas(element, scale);

  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const imgW = element.offsetWidth;
  const imgH = element.offsetHeight;

  const pdf = new jsPDF({
    orientation: imgW > imgH ? 'landscape' : 'portrait',
    unit: 'px',
    format: [imgW, imgH],
    compress: true, // تفعيل ضغط الـ PDF
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH, undefined, 'FAST');
  pdf.save(fileName);
}

export function buildFileName(format: string, ext = 'jpg'): string {
  const date = new Date().toISOString().slice(0, 10);
  return `bareq-poster-${format}-${date}.${ext}`;
}

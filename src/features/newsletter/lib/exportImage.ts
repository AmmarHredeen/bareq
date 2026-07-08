import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export async function exportPosterAsPng(
  element: HTMLElement,
  fileName: string,
  scale = 3
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    width: element.offsetWidth,
    height: element.offsetHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

export async function exportPosterAsPdf(
  element: HTMLElement,
  fileName: string,
  scale = 3
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    width: element.offsetWidth,
    height: element.offsetHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const imgW = element.offsetWidth;
  const imgH = element.offsetHeight;

  const pdf = new jsPDF({
    orientation: imgW > imgH ? 'landscape' : 'portrait',
    unit: 'px',
    format: [imgW, imgH],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
  pdf.save(fileName);
}

export function buildFileName(format: string, ext = 'png'): string {
  const date = new Date().toISOString().slice(0, 10);
  return `bareq-poster-${format}-${date}.${ext}`;
}

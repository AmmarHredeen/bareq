import { useMemo, useRef, useState } from 'react';
import { Megaphone, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNewsletter } from '@/features/newsletter/hooks/useNewsletter';
import { usePersistentSettings } from '@/features/newsletter/hooks/usePersistentSettings';
import { EmptyState } from '@/components/ui';
import { Skeleton } from '@/components/ui/Skeleton';
import { buildPoster } from '@/features/newsletter/lib/poster';
import { PosterCanvas } from '@/features/newsletter/components/PosterCanvas';
import { PosterToolbar } from '@/features/newsletter/components/PosterToolbar';
import {
  exportPosterAsPng,
  exportPosterAsPdf,
  buildFileName,
} from '@/features/newsletter/lib/exportImage';

export default function NewsletterPage() {
  const { data, isLoading } = useNewsletter();
  const products = data?.products ?? [];
  const brands = data?.brands ?? [];

  const { settings, setSettings } = usePersistentSettings();

  const [exporting, setExporting] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);

  const groups = useMemo(
    () => buildPoster(products, settings),
    [products, settings]
  );

  const totalLines = groups.reduce((sum, g) => sum + g.lines.length, 0);

  const handleExportPdf = async () => {
    if (!posterRef.current) return;
    setExporting(true);
    try {
      await exportPosterAsPdf(posterRef.current, buildFileName('poster', 'pdf'));
      toast.success('تم تصدير PDF بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('فشل تصدير PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPng = async () => {
    if (!posterRef.current) return;
    setExporting(true);
    try {
      await exportPosterAsPng(posterRef.current, buildFileName('poster'));
      toast.success('تم تصدير الصورة بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('فشل تصدير الصورة');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="no-print flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-500/25">
          <Megaphone className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            نشرة الأسعار
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            صمّم نشرة BAREQ Tel واطبعها أو صدّرها
            {!isLoading && (
              <span className="ms-1 text-slate-400">· {totalLines} منتج</span>
            )}
          </p>
        </div>
      </div>

      <PosterToolbar
        settings={settings}
        onChange={setSettings}
        brands={brands}
        products={products}
        onPrint={handleExportPdf}
        onExportPng={handleExportPng}
        exporting={exporting}
      />

      {isLoading ? (
        <Skeleton className="mx-auto h-[900px] w-[1240px] max-w-full" />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Package}
          title="لا توجد منتجات متوفرة في النشرة"
          description="فعّل «يظهر في النشرة» على منتجات نشطة"
        />
      ) : (
        <div
          id="poster-print-area"
          className="overflow-auto rounded-2xl bg-slate-100 p-4 dark:bg-slate-950/40"
        >
          <PosterCanvas
            ref={posterRef}
            groups={groups}
            settings={settings}
            allBrands={brands}
          />
        </div>
      )}
    </div>
  );
}

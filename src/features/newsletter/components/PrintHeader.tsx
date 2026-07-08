import { NEWSLETTER_AUDIENCE_META, type NewsletterAudience } from '@/constants/app';

export interface StoreInfo {
  title: string;
  phone: string;
  address: string;
  note: string;
}

interface PrintHeaderProps {
  audience: NewsletterAudience;
  itemCount: number;
  store: StoreInfo;
}

export function PrintHeader({ audience, itemCount, store }: PrintHeaderProps) {
  const today = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="print-only mb-6 border-b-2 border-gray-800 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            {store.title || 'Bareq Mobile'}
          </h1>
          <p className="mt-1 text-sm text-gray-700">
            {NEWSLETTER_AUDIENCE_META[audience].label}
          </p>
          {store.note && (
            <p className="mt-1 text-xs text-gray-600">{store.note}</p>
          )}
        </div>
        <div className="text-left text-sm text-gray-700">
          <p>التاريخ: {today}</p>
          <p>عدد المنتجات: {itemCount}</p>
          {store.phone && <p>هاتف: {store.phone}</p>}
          {store.address && <p>{store.address}</p>}
        </div>
      </div>
    </div>
  );
}

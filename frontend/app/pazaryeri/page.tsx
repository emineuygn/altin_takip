'use client';
import { useState, useEffect } from 'react';
import { fetchMarketplace, type MarketplaceData, type MarketplaceItem } from '@/lib/history';

const SECTIONS: { key: keyof Omit<MarketplaceData, 'timestamp'>; label: string }[] = [
  { key: 'gram', label: '1 Gram Altın' },
  { key: 'ceyrek', label: 'Çeyrek Altın' },
  { key: 'ajda', label: '15 Gram Ajda Bilezik' },
];

const formatPrice = (n: number) =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function ListingRow({ item, rank }: { item: MarketplaceItem; rank: number }) {
  const content = (
    <>
      <span className="w-6 shrink-0 text-gray-300 font-black text-sm">{rank}</span>
      <span className="flex-1 truncate">{item.title}</span>
      <span className="shrink-0 font-black">{formatPrice(item.price)} TL</span>
    </>
  );
  const rowClass = `flex items-center gap-3 px-4 py-3 text-xs sm:text-sm ${rank === 1 ? 'bg-yellow-50' : ''}`;
  return item.url ? (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className={`${rowClass} hover:bg-gray-50`}>
      {content}
    </a>
  ) : (
    <div className={rowClass}>{content}</div>
  );
}

export default function PazarYeriPage() {
  const [data, setData] = useState<MarketplaceData | null>(null);

  useEffect(() => {
    fetchMarketplace().then(setData);
  }, []);

  if (!data) {
    return <div className="min-h-screen bg-white flex items-center justify-center font-sans text-gray-500 uppercase tracking-widest text-xs">Yükleniyor...</div>;
  }

  const updated = data.timestamp
    ? new Date(data.timestamp).toLocaleString('tr-TR', {
        timeZone: 'Europe/Istanbul', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      })
    : '--:--:--';

  return (
    <main className="min-h-screen bg-white text-black font-sans p-4 sm:p-10">
      <div className="max-w-[1400px] mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold tracking-tight text-black">Pazar Yeri (Trendyol)</h1>
          <span className="text-xs font-medium text-gray-400">Güncelleme: {updated}</span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {SECTIONS.map(section => {
            const items = data[section.key];
            return (
              <div key={section.key} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-xs font-bold uppercase tracking-widest">{section.label}</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <div className="px-4 py-6 text-xs text-gray-400 text-center">Şu an listelenecek ürün yok.</div>
                  ) : (
                    items.map((item, i) => <ListingRow key={item.url ?? i} item={item} rank={i + 1} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { fetchMarketplace, type MarketplaceData, type MarketplaceListing } from '@/lib/history';

const formatPrice = (n: number) =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Cell({ item }: { item: MarketplaceListing | null }) {
  if (!item) {
    return <span className="text-gray-300 text-lg font-black">-</span>;
  }
  const content = (
    <span className="text-lg font-black leading-none">{formatPrice(item.price)}</span>
  );
  return item.url ? (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-60" title={item.title}>
      {content}
    </a>
  ) : (
    content
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
      <div className="max-w-[1400px] mx-auto border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <header className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-black">Pazar Yeri</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">Takip ettiğimiz firmaların Pazarama&apos;daki fiyatları</p>
          </div>
          <span className="text-xs font-medium text-gray-400">Güncelleme: {updated}</span>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-200">
                <th className="p-4 text-left font-bold border-r border-gray-200">Firma Adı</th>
                <th className="p-4 text-center border-r border-gray-100">1 GR</th>
                <th className="p-4 text-center border-r border-gray-100">Çeyrek</th>
                <th className="p-4 text-center">10 GR Ajda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.stores.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-xs text-gray-400">Henüz veri yok.</td>
                </tr>
              ) : (
                data.stores.map((store) => (
                  <tr key={store.name} className="bg-white hover:bg-gray-50">
                    <td className="p-4 border-r border-gray-100 font-bold uppercase">{store.name}</td>
                    <td className="p-4 border-r border-gray-100 text-center"><Cell item={store.gram} /></td>
                    <td className="p-4 border-r border-gray-100 text-center"><Cell item={store.ceyrek} /></td>
                    <td className="p-4 text-center"><Cell item={store.ajda} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="p-4 text-[11px] text-gray-400 border-t border-gray-100">
          Bu firmaların hepsi Pazarama&apos;da kendi mağazasıyla satış yapmıyor; bulunamayanlar &quot;-&quot; gösterilir. Fiyata tıklayınca Pazarama&apos;daki ilana gidersiniz.
        </p>
      </div>
    </main>
  );
}

'use client';
import { useState, useEffect, useMemo } from 'react';

interface PriceData {
  n: string | number;
  h: string | number;
}

interface StoreData {
  name: string;
  gram: PriceData;
  ceyrek?: PriceData;
  ajda?: PriceData;
  status: string;
}

const orderList = [
  "Altın Anne", "Ahlatcı", "Gencay Gold", "Genç Altın", "Gramal",
  "Samsun Altın", "Topaloğlu", "Aga Külçe", "Rima Gold", "Anadolum Altın","Altın Dükkanı", "Nadir Gold"
];

const formatPrice = (val: string | number | undefined): string => {
  if (val === undefined || val === null || val === "-") return "-";
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/\./g, '').replace(',', '.'));
  if (isNaN(num) || num === 0) return "-";
  return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseVal = (val: string | number | undefined): number => {
  if (val === undefined || val === null || val === "-") return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export default function GoldTerminal() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("--:--:--");

  const slugs = useMemo(() => [
    'altinanne', 'ahlatci', 'gencay', 'gencaltin', 'gramal',
    'samsun', 'topaloglu', 'aga', 'rima', 'anadolum', 'altindukkani', 'nadir'
  ], []);

  const parseValLocal = parseVal;

  const getLowestMap = (type: 'gram' | 'ceyrek' | 'ajda') => {
    let lowest = Infinity;
    let winners: string[] = [];
    stores.forEach((store) => {
      const data = store[type];
      if (!data) return;
      const n = parseValLocal(data.n);
      const h = parseValLocal(data.h);
      const values = [n, h].filter(v => v > 0);
      if (values.length === 0) return;
      const minVal = Math.min(...values);
      if (minVal < lowest) { lowest = minVal; winners = [store.name]; }
      else if (minVal === lowest) { winners.push(store.name); }
    });
    return winners;
  };

  const lowestGram = getLowestMap('gram');
  const lowestCeyrek = getLowestMap('ceyrek');
  const lowestAjda = getLowestMap('ajda');

  useEffect(() => {
    const fetchAllSites = async () => {
      for (const slug of slugs) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/${slug}`, {
            cache: 'no-store'
          });
          if (!res.ok) continue;
          const data: StoreData = await res.json();
          setStores((prev) => {
            const index = prev.findIndex((s) => s.name === data.name);
            if (index > -1) {
              const updated = [...prev];
              updated[index] = data;
              return updated;
            }
            return [...prev, data];
          });
          setLastUpdate(new Date().toLocaleTimeString('tr-TR'));
        } catch (err) {
          console.error(`${slug} verisi alınamadı:`, err);
        }
      }
    };
    fetchAllSites();
    const interval = setInterval(fetchAllSites, 60000);
    return () => clearInterval(interval);
  }, [slugs]);

  const altinAnne = stores.find(s => s.name === "Altın Anne");
  const sortedStores = useMemo(() => {
    return [...stores].sort((a, b) => {
      const indexA = orderList.indexOf(a.name);
      const indexB = orderList.indexOf(b.name);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [stores]);

  if (stores.length === 0) {
    return <div className="min-h-screen bg-white flex items-center justify-center font-sans text-gray-500 uppercase tracking-widest text-xs">Yükleniyor...</div>;
  }

  return (
    <main className="min-h-screen bg-white text-black font-sans p-4 sm:p-10">
      <style>{`
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 6px 2px #00ff44, inset 0 0 6px rgba(0,255,68,0.15); border-color: #00ff44; }
          50% { box-shadow: 0 0 20px 8px #00ff44, inset 0 0 14px rgba(0,255,68,0.35); border-color: #00cc33; }
        }
        .neon-box {
          animation: neonPulse 1.2s ease-in-out infinite;
          border: 2px solid #00ff44 !important;
          border-radius: 8px;
          background-color: rgba(0,255,68,0.04);
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <header className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h1 className="text-xl font-bold tracking-tight text-black">Analiz Terminali</h1>
          <span className="text-xs font-medium text-gray-400">Güncelleme: {lastUpdate}</span>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-200">
                <th className="p-4 text-left font-bold border-r border-gray-200">Firma Adı</th>
                <th className="p-4 text-center border-r border-gray-100">1 GR Fark (%)</th>
                <th className="p-4 text-center border-r border-gray-100">Çeyrek Fark (%)</th>
                <th className="p-4 text-center">15 GR Ajda Fark (%)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {sortedStores.map((item) => {
                const isAltinAnne = item.name === "Altın Anne";

                return (
                  <tr key={item.name} className={`${isAltinAnne ? 'bg-yellow-400' : 'bg-white hover:bg-gray-50'}`}>
                    <td className="p-4 border-r border-gray-100 font-bold uppercase">
                      {item.name}
                    </td>

                    {[
                      { mine: item.gram, ref: altinAnne?.gram, type: 'gram' },
                      { mine: item.ceyrek, ref: altinAnne?.ceyrek, type: 'ceyrek' },
                      { mine: item.ajda, ref: altinAnne?.ajda, type: 'ajda' }
                    ].map((pair, idx) => {
                      const isLowest =
                        (pair.type === 'gram' && lowestGram.includes(item.name)) ||
                        (pair.type === 'ceyrek' && lowestCeyrek.includes(item.name)) ||
                        (pair.type === 'ajda' && lowestAjda.includes(item.name));

                      const myN = parseVal(pair.mine?.n);
                      const myH = parseVal(pair.mine?.h);
                      const refN = parseVal(pair.ref?.n);
                      const refH = parseVal(pair.ref?.h);

                      const diffN = (myN > 0 && refN > 0) ? (myN - refN) : null;
                      const diffH = (myH > 0 && refH > 0) ? (myH - refH) : null;
                      const percN = (diffN !== null && refN > 0) ? (diffN / refN) * 100 : null;
                      const percH = (diffH !== null && refH > 0) ? (diffH / refH) * 100 : null;

                      return (
                        <td key={idx} className="p-4 border-r border-gray-100">
                          <div className={`flex items-stretch gap-0 text-center ${isLowest && !isAltinAnne ? 'neon-box' : ''}`}>
                            {/* N kolonu */}
                            <div className="flex flex-col flex-1 items-center py-1">
                              <span className={`text-[10px] font-bold mb-1 ${isAltinAnne ? 'text-black/50' : 'text-gray-400'}`}>N</span>
                              <span className={`text-[18px] font-black leading-none ${isAltinAnne ? 'text-black' : ''}`}>
                                {isAltinAnne
                                  ? formatPrice(pair.mine?.n)
                                  : (diffN !== null ? `${diffN > 0 ? '+' : ''}${diffN.toFixed(1)}` : '-')}
                              </span>
                              {!isAltinAnne && (
                                <span className="text-[11px] font-medium opacity-50 mt-0.5">
                                  {percN !== null ? `%${percN.toFixed(2)}` : ''}
                                </span>
                              )}
                            </div>

                            {/* Dikey çizgi */}
                            <div className={`w-px self-stretch mx-1 ${isAltinAnne ? 'bg-black/20' : 'bg-gray-200'}`} />

                            {/* H kolonu */}
                            <div className="flex flex-col flex-1 items-center py-1">
                              <span className={`text-[10px] font-bold mb-1 ${isAltinAnne ? 'text-black/50' : 'text-gray-400'}`}>H</span>
                              <span className={`text-[18px] font-black leading-none ${isAltinAnne ? 'text-black' : ''}`}>
                                {isAltinAnne
                                  ? formatPrice(pair.mine?.h)
                                  : (diffH !== null ? `${diffH > 0 ? '+' : ''}${diffH.toFixed(1)}` : '-')}
                              </span>
                              {!isAltinAnne && (
                                <span className="text-[11px] font-medium opacity-50 mt-0.5">
                                  {percH !== null ? `%${percH.toFixed(2)}` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
'use client';
import { useState, useEffect, useMemo } from 'react';

// --- TIP TANIMLAMALARI ---
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

export default function GoldTerminal() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("--:--:--");

  const slugs = useMemo(() => [
    'altinanne', 'nadir', 'ahlatci', 'gramal', 'rima', 
    'aga', 'altindukkani', 'topaloglu', 'gencaltin', 'gencay', 'samsun'
  ], []);

  const parseVal = (val: string | number | undefined): number => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

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
  
  const minPrices = useMemo(() => {
    const mins = { gram: Infinity, ceyrek: Infinity, ajda: Infinity };
    stores.forEach(s => {
      const g = parseVal(s.gram?.h);
      const c = parseVal(s.ceyrek?.h);
      const a = parseVal(s.ajda?.h);
      if (g > 0 && g < mins.gram) mins.gram = g;
      if (c > 0 && c < mins.ceyrek) mins.ceyrek = c;
      if (a > 0 && a < mins.ajda) mins.ajda = a;
    });
    return mins;
  }, [stores]);

  if (stores.length === 0) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center font-mono text-yellow-500 animate-pulse uppercase tracking-[0.5em]">
        SİNYAL_BEKLENİYOR...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020202] text-white font-mono p-4 sm:p-10">
      <div className="max-w-[1600px] mx-auto border border-zinc-900 bg-[#050505] rounded-xl overflow-hidden shadow-2xl">
        
        <header className="p-6 border-b border-zinc-900 flex flex-col md:flex-row justify-between items-center bg-[#080808] gap-4">
          <div>
            <h1 className="text-2xl font-black text-yellow-500 italic uppercase tracking-tighter">ALTIN_TAKIP</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Sistem Aktif</p>
          </div>
          <div className="bg-zinc-900/50 p-2 px-4 rounded border border-zinc-800 text-center">
            <p className="text-[9px] text-zinc-600 font-black uppercase">Son Veri Girişi</p>
            <p className="text-sm font-bold text-zinc-300">{lastUpdate}</p>
          </div>
        </header>

        <div className="p-2 overflow-x-auto">
          <table className="w-full border-collapse min-w-[1200px]">
            <thead>
              <tr className="text-zinc-600 uppercase font-black tracking-widest border-b border-zinc-900">
                <th className="p-4 text-left text-[14px]">Kurum</th>
                <th className="p-4 text-center text-yellow-500 text-[30px] tracking-tighter">1 GR (24K)</th>
                <th className="p-4 text-center text-orange-500 text-[30px] tracking-tighter">ÇEYREK</th>
                <th className="p-4 text-center text-blue-400 text-[30px] tracking-tighter">15 GR AJDA</th>
                <th className="p-4 text-right text-[14px]">Durum</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-900/50">
              {[...stores].sort((a, b) => a.name.localeCompare(b.name)).map((item) => (
                <tr key={item.name} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4 font-bold text-xs text-zinc-300 uppercase border-r border-zinc-900/50">
                    {item.name}
                  </td>

                  {[item.gram, item.ceyrek, item.ajda].map((product, idx) => {
                    const safeP = product || { n: "-", h: "-" };
                    const currentVal = parseVal(safeP.h);

                    let refVal = 0;
                    if (idx === 0) refVal = parseVal(altinAnne?.gram?.h);
                    if (idx === 1) refVal = parseVal(altinAnne?.ceyrek?.h);
                    if (idx === 2) refVal = parseVal(altinAnne?.ajda?.h);

                    const diff = (item.name !== "Altın Anne" && currentVal > 0 && refVal > 0) ? (currentVal - refVal) : null;

                    const isMin = 
                      (idx === 0 && currentVal === minPrices.gram && currentVal !== Infinity) ||
                      (idx === 1 && currentVal === minPrices.ceyrek && currentVal !== Infinity) ||
                      (idx === 2 && currentVal === minPrices.ajda && currentVal !== Infinity);
                    
                    return (
                      <td key={idx} className={`p-4 border-r border-zinc-900/50 transition-all duration-300 relative ${
                        isMin ? 'border-[4px] border-[#ccff00] z-10 shadow-[0_0_30px_rgba(204,255,0,0.6)] animate-[pulse_1s_infinite]' : ''
                      }`}>
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex flex-col items-center">
                            <span className={`text-[8px] uppercase tracking-widest ${isMin ? 'text-[#ccff00] font-black' : 'text-zinc-600'}`}>Normal</span>
                            <span className={`text-lg font-black tabular-nums ${
                              isMin ? 'text-[#ccff00] scale-110' : 
                              idx === 0 ? 'text-[#00ff00]' : idx === 1 ? 'text-orange-500' : 'text-blue-400'
                            }`}>
                              {safeP.n} {safeP.n !== "-" ? "₺" : ""}
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`text-[8px] uppercase tracking-widest ${isMin ? 'text-[#ccff00] font-black' : 'text-zinc-600'}`}>Havale</span>
                            <span className={`text-[10px] font-black tabular-nums ${isMin ? 'text-[#ccff00] scale-110' : 'text-zinc-400'}`}>
                              {safeP.h} {safeP.h !== "-" ? "₺" : ""}
                            </span>
                            
                            {/* FARK GÖSTERGESİ */}
                            {diff !== null && (
                              <span className={`text-[22px] font-black mt-2 px-3 py-0.5 rounded shadow-[0_0_15px_rgba(0,0,0,0.7)] animate-pulse border-2 transition-all ${
                                diff > 0 
                                  ? 'text-red-500 bg-red-500/20 border-red-500/40' 
                                  : diff < 0 
                                    ? 'text-emerald-400 bg-emerald-400/20 border-emerald-400/40' 
                                    : 'text-zinc-500 border-transparent'
                              }`}>
                                {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)} ₺
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}

                  <td className="p-4 text-right">
                    <span className={`text-[8px] px-2 py-1 rounded font-black border uppercase ${
                      item.status === 'online' ? 'bg-green-950/20 text-green-500 border-green-900' : 'bg-red-950/20 text-red-500 border-red-900'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
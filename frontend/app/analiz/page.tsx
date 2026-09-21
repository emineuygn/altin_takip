'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { fetchHistory, parseVal, type HistoryEntry } from '@/lib/history';

const orderList = [
  "Altın Anne", "Ahlatcı", "Gencay Gold", "Genç Altın", "Gramal",
  "Samsun Altın", "Topaloğlu", "Aga Külçe", "Anadolum Altın", "Altın Dükkanı", "Nadir Gold", "Rima Gold", "Altın Denizi"
];

const METRICS = [
  { key: 'gram', label: '1 GR' },
  { key: 'ceyrek', label: 'Çeyrek' },
  { key: 'ajda', label: '15 GR Ajda' },
] as const;
type MetricKey = typeof METRICS[number]['key'];

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const formatTick = (iso: string) =>
  new Date(iso).toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });

export default function AnalizPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const [metric, setMetric] = useState<MetricKey>('gram');

  useEffect(() => {
    fetchHistory().then(setHistory);
  }, []);

  const weekly = useMemo(() => {
    const cutoff = Date.now() - SEVEN_DAYS_MS;
    return history.filter(e => new Date(e.timestamp).getTime() >= cutoff);
  }, [history]);

  const storeNames = useMemo(() => {
    const names = new Set<string>();
    weekly.forEach(entry => entry.stores.forEach(s => names.add(s.name)));
    return Array.from(names).sort((a, b) => {
      const ia = orderList.indexOf(a);
      const ib = orderList.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [weekly]);

  const seriesFor = (storeName: string) => weekly.map(entry => {
    const store = entry.stores.find(s => s.name === storeName);
    const data = store?.[metric];
    const n = data ? parseVal(data.n) : 0;
    const h = data ? parseVal(data.h) : 0;
    return {
      timestamp: entry.timestamp,
      n: n > 0 ? n : null,
      h: h > 0 ? h : null,
    };
  });

  if (weekly.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans text-gray-500 uppercase tracking-widest text-xs text-center px-4">
        Henüz yeterli veri yok, günlük güncellemeler biriktikçe grafikler burada görünecek.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black font-sans p-4 sm:p-10">
      <div className="max-w-[1400px] mx-auto">
        <header className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-xl font-bold tracking-tight text-black">Haftalık Analiz</h1>
          <div className="flex gap-2">
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded border ${
                  metric === m.key ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {storeNames.map(name => (
            <div key={name} className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3">{name}</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={seriesFor(name)} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTick}
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    minTickGap={30}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    width={55}
                  />
                  <Tooltip
                    labelFormatter={formatTick}
                    formatter={(value: number) => value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  />
                  <Line type="monotone" dataKey="n" name="Kredi Kartı" stroke="#000000" strokeWidth={2} dot={false} connectNulls />
                  <Line type="monotone" dataKey="h" name="Havale" stroke="#00cc33" strokeWidth={2} dot={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export interface PriceData {
  n: string | number;
  h: string | number;
}

export interface StoreSnapshot {
  name: string;
  gram: PriceData;
  ceyrek?: PriceData;
  ajda?: PriceData;
  status: string;
}

export interface HistoryEntry {
  timestamp: string;
  stores: StoreSnapshot[];
}

// Backend artık günde 3 kez (11:00/14:00/17:00) GitHub Actions tarafından tetikleniyor
// ve sonuç bu dosyaya commit'leniyor. Frontend Render'a hiç istek atmadan, doğrudan
// GitHub'daki bu JSON'u okuyor.
//
// raw.githubusercontent.com bir CDN üzerinden servis ediyor ve bu dosyayı beklenenden
// çok daha uzun (gözlemlenen: birkaç dakikadan fazla) cache'leyebiliyor; güncellemeler
// gecikmeli görünebiliyordu. Bunun yerine GitHub'ın Contents API'sini kullanıyoruz —
// aynı veriyi CDN cache'i olmadan, anında güncel döndürüyor.
export const HISTORY_URL =
  "https://api.github.com/repos/emineuygn/altin_takip/contents/data/history.json?ref=main";

export async function fetchHistory(): Promise<HistoryEntry[]> {
  const res = await fetch(HISTORY_URL, {
    cache: "no-store",
    headers: { Accept: "application/vnd.github.raw+json" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export interface MarketplaceListing {
  price: number;
  title: string;
  url: string | null;
}

export interface MarketplaceStore {
  name: string;
  gram: MarketplaceListing | null;
  ceyrek: MarketplaceListing | null;
  ajda: MarketplaceListing | null;
}

export interface MarketplaceData {
  timestamp: string | null;
  stores: MarketplaceStore[];
}

// Pazar Yeri, "en ucuz N ilan" değil — bizim zaten takip ettiğimiz firmaların
// Pazarama'daki (kendi satıcı hesaplarıyla doğrulanmış) fiyatını gösteriyor.
export const MARKETPLACE_URL =
  "https://api.github.com/repos/emineuygn/altin_takip/contents/data/marketplace.json?ref=main";

export async function fetchMarketplace(): Promise<MarketplaceData> {
  const empty: MarketplaceData = { timestamp: null, stores: [] };
  const res = await fetch(MARKETPLACE_URL, {
    cache: "no-store",
    headers: { Accept: "application/vnd.github.raw+json" },
  });
  if (!res.ok) return empty;
  const data = await res.json();
  return {
    timestamp: data.timestamp ?? null,
    stores: Array.isArray(data.stores) ? data.stores : [],
  };
}

export const parseVal = (val: string | number | undefined): number => {
  if (val === undefined || val === null || val === "-") return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatPrice = (val: string | number | undefined): string => {
  if (val === undefined || val === null || val === "-") return "-";
  const num = parseVal(val);
  if (num === 0) return "-";
  return num.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

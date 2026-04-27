import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Axios ve Cheerio gibi backend paketlerinin hata vermesini önler
  serverExternalPackages: ["axios", "cheerio"],

  // Next.js 16+ sürümlerinde Turbopack ayarları bu şekilde veya boş bırakılarak çözülür
  // 'experimental' içinden 'turbopack' anahtarını siliyoruz çünkü hata veriyor
  experimental: {
    // Diğer deneysel ayarlar buraya gelebilir ama turbopack buraya ait değil
  },
};

export default nextConfig;
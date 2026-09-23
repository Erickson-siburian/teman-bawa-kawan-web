import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Share2,
  Star,
  ExternalLink,
} from 'lucide-react';

interface LayananFiturModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlatform?: (platformName: string) => void;
  onOpenRegister?: () => void;
}

export interface PlatformServiceItem {
  id: string;
  name: string;
  category: string;
  badge?: string;
  note?: string;
  colorClass: string;
  iconBg: string;
  svgIcon: React.ReactNode;
  benefits: string[];
  description: string;
}

export const socialPlatformsList: PlatformServiceItem[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'Visual & Reels',
    badge: 'Min. 30 Post & 100 Followers',
    note: 'Komentator aktif dengan feed terverifikasi',
    colorClass: 'from-pink-500 via-purple-500 to-orange-500',
    iconBg: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600',
    svgIcon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    benefits: ['Komentar Positif Tertarget', 'Tingkatkan ER Feed & Reels', 'Sinergi Story Mention'],
    description: 'Bantu menaikkan engagement rate postingan produk/jasa agar muncul di halaman Explore Instagram.',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'Video & Podcast',
    badge: 'AdSense & Jam Tayang',
    note: 'Dukungan view organik & komentar interaktif',
    colorClass: 'from-red-600 to-red-700',
    iconBg: 'bg-red-600',
    svgIcon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    benefits: ['Akselerasi 4.000 Jam Tayang', 'Komentar Diskusi Berkualitas', 'Dukungan Subscriber Real'],
    description: 'Saling tonton tuntas & berdiskusi di kolom komentar untuk menaikkan rasio retensi algoritma YouTube.',
  },
  {
    id: 'googlemap',
    name: 'Google Map',
    category: 'Ulasan Bisnis & Toko',
    badge: 'Review Bintang 5',
    note: 'Local guide Indonesia dengan ulasan asli',
    colorClass: 'from-emerald-600 to-blue-600',
    iconBg: 'bg-white text-emerald-600 border border-slate-200',
    svgIcon: (
      <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
    benefits: ['Review Bintang 5 Berfoto', 'Menaikkan Ranking Toko di Maps', 'Membangun Kepercayaan Calon Pembeli'],
    description: 'Bantu UMKM dan toko online lokal mendapatkan ulasan reputasi terpercaya di Google Business Profile.',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'Fanspage & Komunitas',
    badge: 'Viral Share & Komentar',
    note: 'Jangkauan audiens keluarga & marketplace',
    colorClass: 'from-blue-600 to-blue-800',
    iconBg: 'bg-[#1877F2]',
    svgIcon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    benefits: ['Komentar Ramai di Fanspage', 'Share ke Grup Jual Beli / Komunitas', 'Rekomendasi Halaman Bisnis'],
    description: 'Menggerakkan interaksi postingan produk di Facebook agar menyebar luas ke grup-grup prospek lokal.',
  },
  {
    id: 'googleplaystore',
    name: 'Google Playstore',
    category: 'Aplikasi & Game Android',
    badge: 'Rating & Ulasan Positif',
    note: 'Download aktif & review performa',
    colorClass: 'from-teal-500 to-cyan-600',
    iconBg: 'bg-white border border-slate-200',
    svgIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path d="M3.609 1.814L13.792 12 3.61 22.186A2.21 2.21 0 0 1 3 20.627V3.373c0-.603.228-1.157.609-1.559z" fill="#00D3FF"/>
        <path d="M17.18 8.613L4.85 1.545c-.416-.24-.874-.355-1.24-.269L13.792 12l3.388-3.387z" fill="#00F175"/>
        <path d="M17.18 15.387l-3.388-3.387L3.61 22.186c.366.086.824-.029 1.24-.269l12.33-7.068c.732-.42.732-1.042 0-1.462z" fill="#FF3A44"/>
        <path d="M21.134 11.269l-3.954-2.269L13.792 12l3.388 3.387 3.954-2.269c.732-.42.732-1.042 0-1.462z" fill="#FFC800"/>
      </svg>
    ),
    benefits: ['Rating Bintang 5 Aplikasi', 'Ulasan Review Fitur Positif', 'Meningkatkan Peringkat Download ASO'],
    description: 'Bantu developer aplikasi dan startup lokal mendapatkan trust rating tinggi di Google Play Store.',
  },
  {
    id: 'threads',
    name: 'Threads',
    category: 'Diskusi Teks & Opini',
    badge: 'Trending Conversation',
    note: 'Integrasi akun Instagram terhubung',
    colorClass: 'from-slate-800 to-black',
    iconBg: 'bg-black text-white',
    svgIcon: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 192 192">
        <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.745C77.0635 44.745 61.5879 56.4026 56.0964 74.455C49.9196 94.7577 54.0042 122.955 77.2917 131.954C87.4116 135.865 99.4121 135.791 108.618 131.748C117.026 128.056 124.717 121.229 128.536 113.676C129.549 111.674 128.749 109.221 126.747 108.208C124.744 107.195 122.291 107.995 121.278 109.997C118.156 116.173 111.884 121.734 104.975 124.771C97.4332 128.083 87.4402 128.146 79.1396 124.938C60.7711 117.84 57.5317 94.463 62.4332 78.361C66.8617 63.8055 79.3512 54.4373 97.221 54.4373C116.031 54.4373 127.843 66.867 129.359 89.2891C122.239 88.084 114.61 88.024 106.669 89.1105C87.2758 91.7645 74.2023 103.731 75.3978 120.485C76.0125 129.106 82.5029 136.793 91.5645 139.636C98.4877 141.808 106.273 141.517 113.565 138.813C125.798 134.275 134.613 123.636 138.404 108.835C141.515 109.704 144.385 110.871 146.969 112.317C152.091 115.185 155.083 119.539 155.518 124.767C156.195 132.894 150.312 140.237 141.51 142.274C139.309 142.784 137.94 144.971 138.45 147.172C138.96 149.373 141.147 150.742 143.348 150.232C155.438 147.436 163.666 137.286 162.721 125.961C162.062 118.04 157.481 111.458 149.99 107.266C147.534 105.892 144.698 104.757 141.537 88.9883ZM105.352 129.569C99.8821 131.599 94.0253 131.819 88.826 130.187C82.0298 128.053 77.2917 122.378 76.8406 116.059C76.0125 104.453 85.0508 96.068 105.352 93.2905C108.435 92.8687 111.518 92.6577 114.591 92.6577C121.285 92.6577 127.423 93.7431 132.88 95.7725C129.578 116.486 118.47 127.329 105.352 129.569Z"/>
      </svg>
    ),
    benefits: ['Diskusi Thread Ramai', 'Quote & Repost Interaktif', 'Membangun Personal Branding Teks'],
    description: 'Membantu akun bisnis dan kreator meramaikan percakapan berbasis teks di jejaring Threads.',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'Short Video & Affiliate',
    badge: 'FYP & Keranjang Kuning',
    note: 'Komentator aktif dengan akun real Indonesia',
    colorClass: 'from-slate-900 to-black',
    iconBg: 'bg-black text-white',
    svgIcon: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    benefits: ['Mendorong Masuk Algoritma FYP', 'Komentar Tanya Jawab Keranjang Kuning', 'Duet & Stitch Saling Support'],
    description: 'Meningkatkan durasi tonton dan komentar relevan agar video produk cepat viral dan laris.',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'Profesional & B2B',
    badge: 'B2B & Karir',
    note: 'Profil profesional dengan industri relevan',
    colorClass: 'from-blue-700 to-blue-900',
    iconBg: 'bg-[#0A66C2] text-white',
    svgIcon: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.3a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/>
      </svg>
    ),
    benefits: ['Komentar Insights Industri', 'Rekomendasi & Endorse Keahlian', 'Memperluas Jaringan Klien B2B'],
    description: 'Dukungan sinergi dan personal branding untuk pimpinan perusahaan, profesional, kreator wawasan kerja, dan pegiat B2B.',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Audio & Podcast',
    badge: 'Stream & Listener',
    note: 'Listener podcast & musisi independen',
    colorClass: 'from-emerald-500 to-green-700',
    iconBg: 'bg-[#1ED760] text-black',
    svgIcon: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    ),
    benefits: ['Tambah Jam Dengar Podcast', 'Follow Playlist & Profil Kreator', 'Simpan Lagu & Episode Terfavorit'],
    description: 'Dukungan ekosistem untuk kreator siniar (podcast) dan musisi lokal agar masuk tangga lagu / rekomendasi.',
  },
  {
    id: 'detik',
    name: 'Detik.com',
    category: 'Portal Berita & Media',
    badge: 'Opini Komunitas Netizen',
    note: 'Komentator pembaca berita terverifikasi',
    colorClass: 'from-blue-600 to-indigo-800',
    iconBg: 'bg-linear-to-r from-blue-600 to-indigo-700 text-white font-black',
    svgIcon: (
      <span className="text-sm font-black tracking-tighter">detik</span>
    ),
    benefits: ['Komentar Relevan Berita Positif', 'Membangun Diskusi Konstruktif', 'Meningkatkan Reputasi Publik Brand'],
    description: 'Sinergi pembaca dan pegiat digital untuk memberikan opini konstruktif serta tanggapan solutif pada artikel berita penting.',
  },
  {
    id: 'xtwitter',
    name: 'X (Twitter)',
    category: 'Microblogging & Tren',
    badge: 'Trending Topic Booster',
    note: 'Akun aktif dengan tweet organik',
    colorClass: 'from-black to-slate-900',
    iconBg: 'bg-black text-white',
    svgIcon: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    benefits: ['Akselerasi Tagar Trending Topic', 'Retweet & Quote Tweet Positif', 'Interaksi Cepat Viralitas'],
    description: 'Membantu kampanye promosi dan peluncuran produk menjadi perbincangan hangat di linimasa X Indonesia.',
  },
];

export const LayananFiturModal: React.FC<LayananFiturModalProps> = ({
  isOpen,
  onClose,
  onSelectPlatform,
  onOpenRegister,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Semua Media Sosial (11)' },
    { id: 'video', label: 'Video & Musik' },
    { id: 'social', label: 'Sosmed & Komunitas' },
    { id: 'review', label: 'Ulasan & Rating Bisnis' },
  ];

  const filtered = socialPlatformsList.filter((item) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'video') return ['youtube', 'tiktok', 'spotify'].includes(item.id);
    if (selectedFilter === 'social') return ['instagram', 'facebook', 'threads', 'xtwitter', 'linkedin', 'detik'].includes(item.id);
    if (selectedFilter === 'review') return ['googlemap', 'googleplaystore'].includes(item.id);
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-900 px-6 sm:px-8 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-300 text-xs font-extrabold uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Layanan &amp; Fitur Sinergi Terpadu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ikon &amp; Ekosistem Media Sosial Teman bawa Kawan
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl">
            Solusi peningkatan Engagement Rate (ER), jam tayang, ulasan rating toko, dan monetisasi terverifikasi di seluruh 11 platform utama.
          </p>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === cat.id
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Social Media Platform Cards */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectPlatform && onSelectPlatform(item.name)}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Icon & Name Header */}
                  <div className="flex items-center gap-3.5 mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0`}
                    >
                      {item.svgIcon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Requirements / Notice Badge */}
                  {item.badge && (
                    <div className="inline-block px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold mb-2">
                      {item.badge}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  {/* Benefits Checklist */}
                  <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                    {item.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-700">
                  <span>Tingkatkan Interaksi Sekarang</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-white border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-slate-500">
            Seluruh akun kawan pegiat medsos &amp; reviewer telah terverifikasi untuk menjamin kualitas sinergi organik terbaik.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            {onOpenRegister && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
                className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
              >
                Daftar &amp; Hubungkan Akun Sosmed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

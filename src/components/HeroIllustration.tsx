import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  ShieldCheck,
  TrendingUp,
  HeartHandshake,
  CheckCircle2,
  Flame,
  Star,
  Activity,
} from 'lucide-react';
import { Logo } from './Logo';

interface PlatformNode {
  id: string;
  name: string;
  category: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
  icon: React.ReactNode;
  actionText: string;
  metric: string;
  position: { x: number; y: number }; // percentage coordinates in the circle / orbit
}

export const HeroIllustration: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<string | null>(null);

  // 11 Platforms mapped into an aesthetically balanced orbit around the central TBK Hub
  const platforms: PlatformNode[] = [
    {
      id: 'youtube',
      name: 'YouTube',
      category: 'Video & Podcast',
      color: '#FF0000',
      bgColor: 'bg-red-600',
      textColor: 'text-white',
      borderColor: 'border-red-500/50',
      glowColor: 'rgba(239, 68, 68, 0.4)',
      actionText: 'Tonton Tuntas & Jam Tayang Organik',
      metric: '+4.000 Jam Tayang',
      position: { x: 50, y: 8 }, // Top
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      category: 'Reels & Feed',
      color: '#E1306C',
      bgColor: 'bg-gradient-to-tr from-yellow-400 via-pink-600 to-purple-700',
      textColor: 'text-white',
      borderColor: 'border-pink-500/50',
      glowColor: 'rgba(225, 48, 108, 0.4)',
      actionText: 'Saling Like, Save, & Komentar Positif',
      metric: 'Explore Booster',
      position: { x: 74, y: 15 },
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      category: 'Shorts & FYP',
      color: '#00F2FE',
      bgColor: 'bg-black',
      textColor: 'text-white',
      borderColor: 'border-cyan-400/50',
      glowColor: 'rgba(0, 242, 254, 0.4)',
      actionText: 'Tonton Penuh & Salin Tautan (FYP)',
      metric: 'Algoritma FYP',
      position: { x: 91, y: 34 },
      icon: (
        <svg className="w-5 h-5 fill-current text-cyan-300" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
    {
      id: 'googlemap',
      name: 'Google Map',
      category: 'Review UMKM',
      color: '#34A853',
      bgColor: 'bg-emerald-700',
      textColor: 'text-white',
      borderColor: 'border-emerald-400/50',
      glowColor: 'rgba(52, 168, 83, 0.4)',
      actionText: 'Review Bintang 5 Asli & Foto Lokasi',
      metric: 'Rating 5.0 UMKM',
      position: { x: 92, y: 62 },
      icon: (
        <div className="flex items-center justify-center">
          <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
        </div>
      ),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      category: 'Grup & Halaman',
      color: '#1877F2',
      bgColor: 'bg-[#1877F2]',
      textColor: 'text-white',
      borderColor: 'border-blue-400/50',
      glowColor: 'rgba(24, 119, 242, 0.4)',
      actionText: 'Share ke Komunitas & Diskusi Ramai',
      metric: 'Jangkauan Viral',
      position: { x: 77, y: 84 },
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      id: 'threads',
      name: 'Threads',
      category: 'Diskusi Teks',
      color: '#FFFFFF',
      bgColor: 'bg-black',
      textColor: 'text-white',
      borderColor: 'border-slate-500/50',
      glowColor: 'rgba(255, 255, 255, 0.25)',
      actionText: 'Quote & Repost Topik Pembahasan',
      metric: 'Trending Thread',
      position: { x: 50, y: 92 }, // Bottom
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 192 192">
          <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.745C77.0635 44.745 61.5879 56.4026 56.0964 74.455C49.9196 94.7577 54.0042 122.955 77.2917 131.954C87.4116 135.865 99.4121 135.791 108.618 131.748C117.026 128.056 124.717 121.229 128.536 113.676C129.549 111.674 128.749 109.221 126.747 108.208C124.744 107.195 122.291 107.995 121.278 109.997C118.156 116.173 111.884 121.734 104.975 124.771C97.4332 128.083 87.4402 128.146 79.1396 124.938C60.7711 117.84 57.5317 94.463 62.4332 78.361C66.8617 63.8055 79.3512 54.4373 97.221 54.4373C116.031 54.4373 127.843 66.867 129.359 89.2891C122.239 88.084 114.61 88.024 106.669 89.1105C87.2758 91.7645 74.2023 103.731 75.3978 120.485C76.0125 129.106 82.5029 136.793 91.5645 139.636C98.4877 141.808 106.273 141.517 113.565 138.813C125.798 134.275 134.613 123.636 138.404 108.835C141.515 109.704 144.385 110.871 146.969 112.317C152.091 115.185 155.083 119.539 155.518 124.767C156.195 132.894 150.312 140.237 141.51 142.274C139.309 142.784 137.94 144.971 138.45 147.172C138.96 149.373 141.147 150.742 143.348 150.232C155.438 147.436 163.666 137.286 162.721 125.961C162.062 118.04 157.481 111.458 149.99 107.266C147.534 105.892 144.698 104.757 141.537 88.9883ZM105.352 129.569C99.8821 131.599 94.0253 131.819 88.826 130.187C82.0298 128.053 77.2917 122.378 76.8406 116.059C76.0125 104.453 85.0508 96.068 105.352 93.2905C108.435 92.8687 111.518 92.6577 114.591 92.6577C121.285 92.6577 127.423 93.7431 132.88 95.7725C129.578 116.486 118.47 127.329 105.352 129.569Z" />
        </svg>
      ),
    },
    {
      id: 'googleplaystore',
      name: 'Google Play',
      category: 'Aplikasi Android',
      color: '#00D3FF',
      bgColor: 'bg-slate-900',
      textColor: 'text-white',
      borderColor: 'border-teal-400/50',
      glowColor: 'rgba(0, 211, 255, 0.4)',
      actionText: 'Rating 5 Bintang & Ulasan Positif',
      metric: 'Review Terverifikasi',
      position: { x: 23, y: 84 },
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M3.609 1.814L13.792 12 3.61 22.186A2.21 2.21 0 0 1 3 20.627V3.373c0-.603.228-1.157.609-1.559z" fill="#00D3FF" />
          <path d="M17.18 8.613L4.85 1.545c-.416-.24-.874-.355-1.24-.269L13.792 12l3.388-3.387z" fill="#00F175" />
          <path d="M17.18 15.387l-3.388-3.387L3.61 22.186c.366.086.824-.029 1.24-.269l12.33-7.068c.732-.42.732-1.042 0-1.462z" fill="#FF3A44" />
          <path d="M21.134 11.269l-3.954-2.269L13.792 12l3.388 3.387 3.954-2.269c.732-.42.732-1.042 0-1.462z" fill="#FFC800" />
        </svg>
      ),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      category: 'Koneksi B2B',
      color: '#0A66C2',
      bgColor: 'bg-[#0A66C2]',
      textColor: 'text-white',
      borderColor: 'border-blue-500/50',
      glowColor: 'rgba(10, 102, 194, 0.4)',
      actionText: 'Endorse & Komentar Wawasan Industri',
      metric: 'Jejaring Bisnis',
      position: { x: 8, y: 62 },
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.3a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
        </svg>
      ),
    },
    {
      id: 'spotify',
      name: 'Spotify',
      category: 'Podcast & Audio',
      color: '#1ED760',
      bgColor: 'bg-[#1ED760]',
      textColor: 'text-black',
      borderColor: 'border-emerald-400/50',
      glowColor: 'rgba(30, 215, 96, 0.4)',
      actionText: 'Stream Podcast & Save Episode',
      metric: 'Jam Dengar Organik',
      position: { x: 9, y: 34 },
      icon: (
        <svg className="w-5 h-5 fill-current text-black" viewBox="0 0 24 24">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      ),
    },
    {
      id: 'detik',
      name: 'Detik.com',
      category: 'Portal Berita',
      color: '#3B82F6',
      bgColor: 'bg-linear-to-r from-blue-600 to-indigo-700',
      textColor: 'text-white',
      borderColor: 'border-blue-400/50',
      glowColor: 'rgba(59, 130, 246, 0.4)',
      actionText: 'Komentar Solutif di Liputan Pers',
      metric: 'Opini Publik',
      position: { x: 26, y: 15 },
      icon: <span className="text-[10px] font-black text-white tracking-tighter">detik</span>,
    },
    {
      id: 'xtwitter',
      name: 'X (Twitter)',
      category: 'Trending Topics',
      color: '#FFFFFF',
      bgColor: 'bg-black',
      textColor: 'text-white',
      borderColor: 'border-slate-400/50',
      glowColor: 'rgba(255, 255, 255, 0.3)',
      actionText: 'Retweet, Like, & Angkat Tagar',
      metric: 'Trending Topic',
      position: { x: 50, y: 28 }, // Inner Orbit Top
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative w-full max-w-2xl mx-auto flex items-center justify-center py-4 select-none">
      {/* Background Soft Glow - Perfectly seamlessly blends with background without any sharp borders */}
      <div className="absolute inset-0 bg-radial from-emerald-500/25 via-teal-900/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute w-72 h-72 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

      {/* SVG Connecting Constellation Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Radial Gradient for central core glow */}
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Dynamic Concentric Orbit Rings */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#10b981"
          strokeWidth="0.4"
          strokeDasharray="2 3"
          strokeOpacity="0.45"
        />
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="0.3"
          strokeDasharray="1.5 2.5"
          strokeOpacity="0.35"
        />
        <circle
          cx="50"
          cy="50"
          r="18"
          fill="none"
          stroke="#34d399"
          strokeWidth="0.5"
          strokeOpacity="0.5"
        />

        {/* Lines connecting each of the 11 platforms to the central TBK Synergy Core */}
        {platforms.map((p) => (
          <line
            key={`line-${p.id}`}
            x1="50"
            y1="50"
            x2={p.position.x}
            y2={p.position.y}
            stroke={activePlatform === p.id ? '#fbbf24' : '#10b981'}
            strokeWidth={activePlatform === p.id ? '0.8' : '0.35'}
            strokeOpacity={activePlatform === p.id ? '0.9' : '0.3'}
            strokeDasharray={activePlatform === p.id ? 'none' : '1.5 1.5'}
          />
        ))}
      </svg>

      {/* Main Interactive Stage Container - Aspect Ratio Square */}
      <div className="relative w-full aspect-square max-w-[540px] flex items-center justify-center">
        {/* ========================================================= */}
        {/* CENTRAL CORE: TEMAN BAWA KAWAN (TBK) SYNERGY NEXUS */}
        {/* ========================================================= */}
        <div className="relative z-10 flex flex-col items-center justify-center group cursor-pointer">
          {/* Animated pulse ring around TBK core */}
          <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-md animate-ping opacity-35" style={{ animationDuration: '4s' }} />
          <div className="absolute -inset-2 rounded-full bg-linear-to-tr from-emerald-500/40 via-amber-500/20 to-teal-400/40 blur-sm" />

          {/* Central Sphere / Core */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-linear-to-b from-slate-900 via-emerald-950 to-slate-950 border-2 border-amber-400/60 shadow-2xl shadow-emerald-900/90 flex flex-col items-center justify-center p-3 text-center transition-all duration-300 group-hover:scale-105 group-hover:border-amber-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white p-1.5 shadow-md mb-1 flex items-center justify-center">
              <Logo size="sm" />
            </div>

            <span className="text-[11px] sm:text-xs font-black text-amber-300 tracking-tight leading-none uppercase">
              TBK Sinergi
            </span>
            <span className="text-[9px] text-emerald-200/90 font-medium leading-tight mt-0.5">
              11 Medsos Saling Support
            </span>

            {/* Glowing Core Active Indicator */}
            <div className="mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[8px] font-bold text-emerald-300 uppercase tracking-wider">
                100% Organik
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ORBITING 11 SOCIAL MEDIA PLATFORM NODES */}
        {/* ========================================================= */}
        {platforms.map((platform) => {
          const isSelected = activePlatform === platform.id;
          return (
            <div
              key={platform.id}
              style={{
                left: `${platform.position.x}%`,
                top: `${platform.position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseEnter={() => setActivePlatform(platform.id)}
              onMouseLeave={() => setActivePlatform(null)}
              onClick={() => setActivePlatform(isSelected ? null : platform.id)}
              className="absolute z-20 group cursor-pointer transition-transform duration-300"
            >
              {/* Platform Node Disc */}
              <div
                className={`relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-2xl ${platform.bgColor} border-2 ${platform.borderColor} shadow-lg transition-all duration-300 group-hover:scale-115 group-hover:shadow-xl`}
                style={{
                  boxShadow: isSelected
                    ? `0 0 25px ${platform.glowColor}`
                    : `0 4px 15px ${platform.glowColor}`,
                }}
              >
                {platform.icon}

                {/* Micro Verified Live Badge */}
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </span>
              </div>

              {/* Platform Label underneath */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-center pointer-events-none">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-white drop-shadow-md bg-slate-950/70 px-1.5 py-0.5 rounded-md border border-white/10">
                  {platform.name}
                </span>
              </div>

              {/* Hover / Active Synergy Tooltip Card */}
              {isSelected && (
                <div
                  className="absolute z-30 w-52 sm:w-60 p-3 rounded-2xl bg-slate-950/95 backdrop-blur-md border border-amber-400/60 shadow-2xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    bottom: platform.position.y > 50 ? '110%' : 'auto',
                    top: platform.position.y <= 50 ? '110%' : 'auto',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-black text-amber-300">
                        {platform.name}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                      {platform.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-200 font-medium leading-snug">
                    🤝 <strong>Sinergi Kawan:</strong> {platform.actionText}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Target Dampak:</span>
                    <span className="font-bold text-amber-300">{platform.metric}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Floating Contextual Badges in Corners (Seamlessly blending) */}
        {/* Top-Right Badge: Saling Support & Bebas Buzzer */}
        <div
          className="absolute -top-3 sm:top-2 right-0 sm:right-2 z-25 bg-slate-950/80 backdrop-blur-md border border-amber-400/40 rounded-2xl p-2.5 px-3.5 shadow-xl flex items-center gap-2.5 animate-bounce"
          style={{ animationDuration: '4s' }}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <HeartHandshake className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <p className="text-[11px] font-black text-white leading-tight">100% Saling Support</p>
            <p className="text-[10px] text-amber-300 font-semibold">Bukan Jual-Beli Buzzer</p>
          </div>
        </div>

        {/* Bottom-Left Badge: 11 Platform Terintegrasi */}
        <div className="absolute -bottom-3 sm:bottom-2 left-0 sm:left-2 z-25 bg-slate-950/80 backdrop-blur-md border border-emerald-400/40 rounded-2xl p-2.5 px-3.5 shadow-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <p className="text-[11px] font-black text-white leading-tight">11 Platform Medsos</p>
            <p className="text-[10px] text-emerald-300 font-semibold">Gotong Royong Organik</p>
          </div>
        </div>
      </div>

      {/* Interactive Helper Hint Below */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <span className="text-[11px] text-emerald-300/80 font-medium px-3 py-1 rounded-full bg-slate-950/60 border border-emerald-500/20">
          ✨ Sentuh atau arahkan kursor ke ikon platform medsos untuk melihat bentuk sinergi kawan
        </span>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Flame,
  ShieldCheck,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  HeartHandshake,
} from 'lucide-react';
import { LogoBrand, Logo } from './Logo';
import { TeamMember } from '../types';
import { TentangKamiModal } from './TentangKamiModal';
import { LayananFiturModal } from './LayananFiturModal';
import { HeroIllustration } from './HeroIllustration';

interface LandingHeroViewProps {
  onEnterDashboard: (tab?: 'board' | 'calendar' | 'gamification' | 'analytics') => void;
  currentUser: TeamMember;
  allMembers: TeamMember[];
  isLoggedIn: boolean;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onLogout?: () => void;
  onOpenEncryptionModal?: () => void;
  keyFingerprint?: string;
}

export const LandingHeroView: React.FC<LandingHeroViewProps> = ({
  onEnterDashboard,
  currentUser,
  allMembers,
  isLoggedIn,
  onOpenAuthModal,
  onLogout,
}) => {
  const [isTentangKamiOpen, setIsTentangKamiOpen] = useState(false);
  const [isLayananFiturOpen, setIsLayananFiturOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-400 selection:text-slate-900">
      {/* Modals for Navbar Items */}
      <TentangKamiModal
        isOpen={isTentangKamiOpen}
        onClose={() => setIsTentangKamiOpen(false)}
        onOpenRegister={() => onOpenAuthModal('register')}
      />

      <LayananFiturModal
        isOpen={isLayananFiturOpen}
        onClose={() => setIsLayananFiturOpen(false)}
        onOpenRegister={() => onOpenAuthModal('register')}
      />

      {/* 
        Background: Isometric Grid Matrix with Lush Emerald, Deep Jade, and Forest Glow 
        Directly inspired by the user's reference image with enhanced depth and contrast
      */}
      <div className="absolute inset-0 bg-linear-to-b from-emerald-950 via-[#064e3b] to-[#022c22] pointer-events-none" />

      {/* SVG Isometric Grid Mesh Overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(30deg, rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(150deg, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 84px',
        }}
      />

      {/* Radial Atmospheric Ambient Lighting */}
      <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-amber-400/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[400px] bg-teal-500/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-30 border-b border-emerald-500/20 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo with Brand Name: Clean, NO subtitle below it */}
          <div className="flex items-center gap-3 shrink-0">
            <LogoBrand size="lg" textColor="light" />
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs font-bold tracking-wider uppercase text-emerald-100/90">
            {/* Tentang Kami: Opens Profile Modal */}
            <button
              onClick={() => setIsTentangKamiOpen(true)}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Tentang Kami
            </button>

            {/* Layanan & Fitur: Opens 11 Social Media Platforms Modal */}
            <button
              onClick={() => setIsLayananFiturOpen(true)}
              className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Layanan &amp; Fitur</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-[10px] text-amber-300">
                11 Sosmed
              </span>
            </button>

            {/* Kalender Editorial */}
            <button
              onClick={() => {
                if (isLoggedIn) {
                  onEnterDashboard('calendar');
                } else {
                  onOpenAuthModal('login');
                }
              }}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Kalender Editorial
            </button>

            {/* Member Aktif (Previously Gamifikasi Sinergi) */}
            <button
              onClick={() => {
                if (isLoggedIn) {
                  onEnterDashboard('gamification');
                } else {
                  onOpenAuthModal('login');
                }
              }}
              className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Member Aktif</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-[10px] text-amber-300">
                {allMembers.length}
              </span>
            </button>

            {/* Dashboard Trend (Previously Analitik Cuan) */}
            <button
              onClick={() => {
                if (isLoggedIn) {
                  onEnterDashboard('analytics');
                } else {
                  onOpenAuthModal('login');
                }
              }}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Dashboard Trend
            </button>
          </nav>

          {/* Action CTAs: Conditional on Login State */}
          <div className="flex items-center gap-3">
            {/* Komunitas Terbuka badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-900/60 border border-emerald-500/30 text-emerald-200"
              title="Komunitas Publik Terbuka & Gotong Royong"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              <span>Komunitas Terbuka</span>
            </div>

            {isLoggedIn ? (
              /* If Logged In: Show BUKA PAPAN TUGAS and User Profile */
              <div className="flex items-center gap-3">
                <div
                  onClick={() => onEnterDashboard('board')}
                  className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-emerald-900/40 border border-emerald-500/30 cursor-pointer hover:border-amber-400/50 transition-all"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-400"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-amber-300">Member Aktif</p>
                  </div>
                </div>

                <button
                  id="hero-btn-dashboard"
                  onClick={() => onEnterDashboard('board')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>BUKA PAPAN TUGAS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-xl text-emerald-200/70 hover:text-white hover:bg-emerald-900/50 transition-colors"
                    title="Keluar / Ganti Akun"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              /* If NOT Logged In: NO "BUKA PAPAN TUGAS", Show LOGIN and DAFTAR buttons */
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  id="navbar-btn-login"
                  onClick={() => onOpenAuthModal('login')}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-emerald-100 hover:text-white hover:bg-emerald-900/40 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>LOGIN</span>
                </button>

                <button
                  id="navbar-btn-daftar"
                  onClick={() => onOpenAuthModal('register')}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>DAFTAR</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-20 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Copywriting & Content Description */}
          <div className="lg:col-span-6 space-y-6">
            {/* Badge pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold tracking-wide">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              <span>Bukan Jasa Buzzer • Komunitas Saling Support Pegiat Medsos</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Wadah Saling Support &amp; Kembangkan Akun Media Sosial Bersama
            </h1>

            {/* Italic Accent Subtitle */}
            <p className="text-lg sm:text-xl font-medium italic text-amber-300/90 leading-snug">
              Gotong Royong Organik Sesama Kreator untuk Mengembangkan Akun atau Channel Apapun Jenisnya
            </p>

            {/* Rich Explanatory Paragraphs */}
            <div className="space-y-4 text-emerald-100/80 text-sm sm:text-base leading-relaxed">
              <p>
                Di era digital yang penuh persaingan algoritma, mengembangkan akun media sosial sendirian sering kali terasa berat. <strong className="text-white font-bold">Teman bawa Kawan (TBK)</strong> hadir bukan sebagai penyedia jasa buzzer bayaran atau bot manipulasi, melainkan wadah komunitas gotong royong digital tempat sesama pegiat media sosial saling mendukung secara nyata.
              </p>
              <p>
                Mulai dari YouTube, TikTok, Instagram, Threads, Facebook, Google Maps review UMKM, hingga Spotify podcast — setiap anggota saling menonton secara tuntas, saling berdiskusi lewat komentar positif yang membangun, dan saling merekomendasikan secara organik. Ketika satu kawan melangkah maju, kita semua bertumbuh bersama!
              </p>
            </div>

            {/* Contextual Action CTAs: Clean without unwanted buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => onEnterDashboard('board')}
                    className="flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/30 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>BUKA PAPAN TUGAS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEnterDashboard('gamification')}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-100 font-bold text-sm tracking-wide transition-all cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Lihat Rekap Member Aktif</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    id="hero-btn-daftar-now"
                    onClick={() => onOpenAuthModal('register')}
                    className="flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/30 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>DAFTAR SEKARANG</span>
                  </button>

                  <button
                    id="hero-btn-login-now"
                    onClick={() => onOpenAuthModal('login')}
                    className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-100 font-bold text-sm tracking-wide transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-emerald-400" />
                    <span>LOGIN MEMBER</span>
                  </button>
                </>
              )}
            </div>

            {/* Platform Quick Bar: 11 Social Icons Shortcut */}
            <div className="pt-2">
              <button
                onClick={() => setIsLayananFiturOpen(true)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 hover:border-amber-400/40 transition-all text-left w-full max-w-lg cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    Dukungan 11 Platform Media Sosial
                  </p>
                  <p className="text-[11px] text-emerald-200/70 truncate">
                    Instagram, YouTube, TikTok, Google Maps, Facebook, Playstore &amp; lainnya.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-300 group-hover:translate-x-0.5 transition-transform">
                  Lihat →
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Illustration Seamlessly Blended with 11 Social Platforms */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <HeroIllustration />
          </div>
        </div>

        {/* 
          Bottom Hero Stat Cards: 3 Translucent Isometric Cards 
          Directly replicating the structure from the user's reference image
        */}
        <div className="mt-14 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Stat Card 1: Users / Jam Tayang (Golden Yellow / Amber Glow) */}
          <div
            onClick={() => {
              if (isLoggedIn) onEnterDashboard('gamification');
              else onOpenAuthModal('login');
            }}
            className="group relative rounded-3xl p-6 sm:p-7 border border-amber-400/30 bg-linear-to-b from-amber-500/20 via-emerald-950/60 to-slate-950/80 backdrop-blur-xl shadow-xl hover:shadow-amber-500/10 hover:border-amber-400/60 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
                  279K+
                </p>
                <p className="text-xs font-bold text-white uppercase tracking-wider mt-0.5">
                  Kreator &amp; Jam Tayang
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-emerald-100/70 leading-relaxed">
              Total engagement jam tayang, retensi, dan sinergi saling review konten sesama anggota TBK di seluruh Indonesia.
            </p>
          </div>

          {/* Stat Card 2: Comments / Video Monetized (Vibrant Emerald Glow) */}
          <div
            onClick={() => {
              if (isLoggedIn) onEnterDashboard('board');
              else onOpenAuthModal('login');
            }}
            className="group relative rounded-3xl p-6 sm:p-7 border border-emerald-400/40 bg-linear-to-b from-emerald-500/20 via-emerald-950/60 to-slate-950/80 backdrop-blur-xl shadow-xl hover:shadow-emerald-400/60 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md group-hover:scale-105 transition-transform">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight">
                  2.000+
                </p>
                <p className="text-xs font-bold text-white uppercase tracking-wider mt-0.5">
                  Target Monetisasi Lolos
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-emerald-100/70 leading-relaxed">
              Akun YouTube partner (YPP), komisi affiliate TikTok Shop, dan endorse brand yang berhasil tembus syarat monetisasi.
            </p>
          </div>

          {/* Stat Card 3: Synergies / Tasks Completed (Cyan / Teal Glow) */}
          <div
            onClick={() => {
              if (isLoggedIn) onEnterDashboard('analytics');
              else onOpenAuthModal('login');
            }}
            className="group relative rounded-3xl p-6 sm:p-7 border border-teal-400/30 bg-linear-to-b from-teal-500/20 via-emerald-950/60 to-slate-950/80 backdrop-blur-xl shadow-xl hover:shadow-teal-400/60 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-400/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-md group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-teal-300 tracking-tight">
                  3.000+
                </p>
                <p className="text-xs font-bold text-white uppercase tracking-wider mt-0.5">
                  Tugas Kolaborasi Selesai
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-emerald-100/70 leading-relaxed">
              Tugas duet video, live bareng co-host, review naskah, dan pengamanan kontrak kerja sama diselesaikan tepat waktu.
            </p>
          </div>
        </div>
      </main>

      {/* Footer: Clean with NO subtitle below Logo */}
      <footer className="relative z-20 border-t border-emerald-500/20 bg-slate-950/90 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-emerald-200/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <LogoBrand size="sm" textColor="light" />
          <p>© 2026 TemanbawaKawan.com. Seluruh Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsTentangKamiOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Tentang Kami
            </button>
            <button
              onClick={() => setIsLayananFiturOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Layanan &amp; Fitur
            </button>
            <button
              onClick={() => {
                if (isLoggedIn) onEnterDashboard('gamification');
                else onOpenAuthModal('login');
              }}
              className="hover:text-amber-400 transition-colors"
            >
              Member Aktif
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

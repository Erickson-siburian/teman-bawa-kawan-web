import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Lock,
  Wrench,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LogIn,
  UserPlus,
  Info,
} from 'lucide-react';
import { Logo } from './Logo';
import { MemberSocialAccounts, TeamMember } from '../types';

interface AuthRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onAuthSuccess: (member: TeamMember) => void;
  existingMembers: TeamMember[];
}

export const AuthRegistrationModal: React.FC<AuthRegistrationModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  onAuthSuccess,
  existingMembers,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form State matching the exact screenshots provided by user
  const [nama, setNama] = useState('Adrian & Andrew');
  const [jenisKelamin, setJenisKelamin] = useState<'Laki-Laki' | 'Perempuan'>('Laki-Laki');
  const [nomorHp, setNomorHp] = useState('081298765432');
  const [email, setEmail] = useState('haihaihai9191@gmail.com');
  const [password, setPassword] = useState('password123');
  const [ulangiPassword, setUlangiPassword] = useState('password123');
  const [pekerjaan, setPekerjaan] = useState('Wiraswasta / Pedagang');

  // Social accounts
  const [socials, setSocials] = useState<MemberSocialAccounts>({
    instagram: '@adrian_andrew.id',
    youtube: 'AdrianAndrewOfficial',
    googleMap: 'Adrian Local Guide',
    facebook: 'Adrian Andrew ID',
    googlePlaystore: 'adrian.reviewer',
    threads: '@adrian_andrew.id',
    tiktok: '@adrianandrew_tiktok',
    linkedIn: 'adrian-andrew',
    spotify: 'Adrian Andrew Podcast',
    detik: 'adrian_komentar',
    xTwitter: '@adrian_andrew',
  });

  // Login-specific state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!nama.trim()) {
      setErrorMessage('Silakan isi Nama lengkap Anda.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Silakan isi alamat Email aktif Anda.');
      return;
    }
    if (password && password !== ulangiPassword) {
      setErrorMessage('Password Baru dan Ulangi Password tidak cocok.');
      return;
    }

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: nama.trim(),
      email: email.trim(),
      role: pekerjaan.trim() || 'Kreator & Komentator Terverifikasi',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(nama)}`,
      gender: jenisKelamin,
      phoneNumber: nomorHp.trim(),
      occupation: pekerjaan.trim(),
      socialAccounts: socials,
      creatorNiche: 'Multiplatform Sinergi',
      primaryPlatform: socials.instagram ? 'Instagram' : socials.tiktok ? 'TikTok' : 'YouTube',
      monetizationStatus: 'in_progress',
      xp: 350,
      level: 1,
      levelTitle: 'Anggota Baru TBK Terverifikasi',
      streak: 1,
      referralCode: `TBK-${nama.split(' ')[0].toUpperCase()}-${Math.floor(10 + Math.random() * 89)}`,
      referralPoints: 100,
      referralsCount: 0,
      buddySynergyScore: 85,
      completedTasksCount: 0,
      onTimeRate: 100,
      status: 'online',
      joinedAt: new Date().toISOString(),
    };

    onAuthSuccess(newMember);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const targetEmail = loginEmail.trim().toLowerCase();
    const matched = existingMembers.find(
      (m) => m.email.toLowerCase() === targetEmail || m.name.toLowerCase() === targetEmail
    );

    if (matched) {
      onAuthSuccess(matched);
      onClose();
    } else {
      // Fallback create demo session or notify
      if (existingMembers.length > 0) {
        // Log in as first available or create quick member
        onAuthSuccess(existingMembers[0]);
        onClose();
      } else {
        setErrorMessage('Akun belum terdaftar. Silakan lakukan pendaftaran terlebih dahulu.');
      }
    }
  };

  const handleQuickLoginAs = (member: TeamMember) => {
    onAuthSuccess(member);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top RajaKomen / TBK Style Header Bar */}
        <div className="bg-[#65a30d] bg-linear-to-r from-emerald-800 via-emerald-700 to-[#15803d] px-5 sm:px-8 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                Teman <span className="text-amber-300">bawa</span> Kawan
              </h2>
              <span className="text-[10px] text-emerald-200 tracking-wider uppercase font-semibold">
                Sistem Pendaftaran &amp; Login Member Terverifikasi
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-black/20 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  mode === 'register' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-white hover:bg-white/10'
                }`}
              >
                DAFTAR
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  mode === 'login' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-white hover:bg-white/10'
                }`}
              >
                LOGIN
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer ml-1"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error banner if any */}
        {errorMessage && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-xs font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        {mode === 'register' ? (
          /* =========================================================================
             REGISTRATION VIEW (Directly replicating the uploaded form screenshots)
             ========================================================================= */
          <form onSubmit={handleRegisterSubmit} className="max-h-[80vh] overflow-y-auto">
            <div className="p-5 sm:p-7 space-y-6">
              {/* Section 1: Detail Profil (Header exactly like Screenshot 1) */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 font-bold text-slate-800 text-sm">
                  Detail Profil
                </div>
                <div className="p-4 sm:p-5 space-y-3.5">
                  {/* Nama * */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Nama <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Adrian & Andrew"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Jenis Kelamin * */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Jenis Kelamin <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500 font-bold text-xs">
                        ⚥
                      </div>
                      <select
                        value={jenisKelamin}
                        onChange={(e) => setJenisKelamin(e.target.value as 'Laki-Laki' | 'Perempuan')}
                        className="flex-1 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-hidden"
                      >
                        <option value="Laki-Laki">Laki-Laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>

                  {/* Nomor Hp. * */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Nomor Hp. <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={nomorHp}
                        onChange={(e) => setNomorHp(e.target.value)}
                        placeholder="081298765432"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Email * (Screenshot 2) */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Email <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="haihaihai9191@gmail.com"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Password Baru * (Screenshot 2) */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Password Baru <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Ulangi Password * (Screenshot 2) */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Ulangi Password <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={ulangiPassword}
                        onChange={(e) => setUlangiPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Pekerjaan Anda * (Screenshot 3) */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Pekerjaan Anda <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={pekerjaan}
                        onChange={(e) => setPekerjaan(e.target.value)}
                        placeholder="Wiraswasta / Pedagang"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Nama Akun Sosmed/Marketplace Anda (Header exactly like Screenshot 3) */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2.5">
                  <h3 className="font-bold text-slate-800 text-sm">
                    Nama Akun Sosmed/Marketplace Anda
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nama akun yang Anda gunakan di sosmed/marketplace untuk menulis komentar/follow.{' '}
                    <span className="text-emerald-700 font-semibold cursor-pointer underline">
                      Lihat contoh
                    </span>
                  </p>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  {/* 1. Instagram */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2 sm:gap-4">
                    <div className="sm:col-span-3 sm:text-right pt-2">
                      <label className="text-xs sm:text-sm font-medium text-slate-700">Instagram</label>
                    </div>
                    <div className="sm:col-span-9 space-y-1">
                      <div className="flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                        <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                          <span className="text-pink-600 font-bold text-xs">📷 IG</span>
                        </div>
                        <input
                          type="text"
                          value={socials.instagram || ''}
                          onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                          placeholder="@username"
                          className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Minimum post 30 dan followers 100
                      </p>
                    </div>
                  </div>

                  {/* 2. YouTube */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Youtube
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                        <span className="text-red-600 font-bold text-xs">▶ YT</span>
                      </div>
                      <input
                        type="text"
                        value={socials.youtube || ''}
                        onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                        placeholder="Nama Channel atau @handle"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* 3. Google Map */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Google Map
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-xs">📍 Maps</span>
                      </div>
                      <input
                        type="text"
                        value={socials.googleMap || ''}
                        onChange={(e) => setSocials({ ...socials, googleMap: e.target.value })}
                        placeholder="Nama Profil Google Review / Local Guide"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* 4. Facebook */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Facebook
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                        <span className="text-[#1877F2] font-bold text-xs">f FB</span>
                      </div>
                      <input
                        type="text"
                        value={socials.facebook || ''}
                        onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                        placeholder="Nama Akun Profil Facebook"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* 5. Google Playstore */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Google Playstore
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                        <span className="text-teal-600 font-bold text-xs">▶ Play</span>
                      </div>
                      <input
                        type="text"
                        value={socials.googlePlaystore || ''}
                        onChange={(e) => setSocials({ ...socials, googlePlaystore: e.target.value })}
                        placeholder="Nama Akun Reviewer Playstore"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* 6. Threads */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Threads
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                        <span className="text-black font-bold text-xs">@ Threads</span>
                      </div>
                      <input
                        type="text"
                        value={socials.threads || ''}
                        onChange={(e) => setSocials({ ...socials, threads: e.target.value })}
                        placeholder="@username_threads"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* 7. Tiktok */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Tiktok
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                        <span className="text-black font-bold text-xs">♪ TikTok</span>
                      </div>
                      <input
                        type="text"
                        value={socials.tiktok || ''}
                        onChange={(e) => setSocials({ ...socials, tiktok: e.target.value })}
                        placeholder="@username_tiktok"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* 8. LinkedIn */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      LinkedIn
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                        <span className="text-[#0A66C2] font-bold text-xs">in LinkedIn</span>
                      </div>
                      <input
                        type="text"
                        value={socials.linkedIn || ''}
                        onChange={(e) => setSocials({ ...socials, linkedIn: e.target.value })}
                        placeholder="URL atau Username LinkedIn"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* 9. Spotify */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Spotify
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                        <span className="text-[#1ED760] font-bold text-xs">● Spotify</span>
                      </div>
                      <input
                        type="text"
                        value={socials.spotify || ''}
                        onChange={(e) => setSocials({ ...socials, spotify: e.target.value })}
                        placeholder="Nama Akun Spotify / Link Podcast"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* 10. Detik.com */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      Detik.com
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                        <span className="text-blue-700 font-black text-xs">d Detik</span>
                      </div>
                      <input
                        type="text"
                        value={socials.detik || ''}
                        onChange={(e) => setSocials({ ...socials, detik: e.target.value })}
                        placeholder="Username Komentator DetikConnect"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* 11. X (Twitter) */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                    <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                      X
                    </label>
                    <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                        <span className="text-black font-black text-xs">𝕏 Twitter</span>
                      </div>
                      <input
                        type="text"
                        value={socials.xTwitter || ''}
                        onChange={(e) => setSocials({ ...socials, xTwitter: e.target.value })}
                        placeholder="@username_x"
                        className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Data tersimpan aman &amp; otomatis terdaftar sebagai Member Aktif TBK.</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>DAFTAR SEKARANG</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* =========================================================================
             LOGIN VIEW
             ========================================================================= */
          <div className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-slate-900">Masuk ke Akun TBK</h3>
                <p className="text-xs text-slate-500">
                  Gunakan Email atau Nama yang telah Anda daftarkan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email / Nama Pengguna *
                </label>
                <div className="flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                  <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="contoh: haihaihai9191@gmail.com"
                    className="flex-1 px-3 py-2.5 text-sm text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password *
                </label>
                <div className="flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                  <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="flex-1 px-3 py-2.5 text-sm text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>MASUK SEKARANG</span>
              </button>
            </form>

            {/* Quick Demo Login Switcher */}
            <div className="pt-5 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
                Atau Masuk Cepat Sebagai Member Terdaftar:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {existingMembers.slice(0, 3).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleQuickLoginAs(m)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 transition-all flex items-center gap-3 text-left cursor-pointer group"
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 group-hover:ring-emerald-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                        {m.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{m.role || 'Member Aktif'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">Belum punya akun? </span>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Daftar Akun Baru Sekarang →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Youtube,
  Instagram,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Check,
  ShieldCheck,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { MemberSocialAccounts, Task, TeamMember } from '../types';

interface PostRegisterOrientationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeamMember;
  officialSocials: MemberSocialAccounts;
  mandatoryTask?: Task | null;
  onCompleteOrientation: (data: {
    youtubeWatchedSeconds: number;
    youtubeConfirmed: boolean;
    instagramConfirmed: boolean;
    tiktokConfirmed: boolean;
    facebookConfirmed: boolean;
  }) => Promise<void> | void;
}

export const PostRegisterOrientationModal: React.FC<PostRegisterOrientationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  officialSocials,
  mandatoryTask,
  onCompleteOrientation,
}) => {
  // Timer state for YouTube watch requirement (120 seconds = 2 minutes)
  const REQUIRED_WATCH_SECONDS = 120;
  const [secondsWatched, setSecondsWatched] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasOpenedYoutube, setHasOpenedYoutube] = useState(false);
  const [hasOpenedInstagram, setHasOpenedInstagram] = useState(false);
  const [hasOpenedTiktok, setHasOpenedTiktok] = useState(false);

  // Confirmation checkboxes
  const [youtubeConfirmed, setYoutubeConfirmed] = useState(false);
  const [instagramConfirmed, setInstagramConfirmed] = useState(false);
  const [tiktokConfirmed, setTiktokConfirmed] = useState(false);
  const [facebookConfirmed, setFacebookConfirmed] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsWatched < REQUIRED_WATCH_SECONDS) {
      interval = setInterval(() => {
        setSecondsWatched((prev) => {
          const next = prev + 1;
          if (next >= REQUIRED_WATCH_SECONDS) {
            setIsTimerRunning(false);
            setYoutubeConfirmed(true);
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsWatched]);

  if (!isOpen) return null;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const watchPercentage = Math.min(100, Math.round((secondsWatched / REQUIRED_WATCH_SECONDS) * 100));
  const isYoutubeRequirementMet = secondsWatched >= REQUIRED_WATCH_SECONDS || youtubeConfirmed;

  // Construct official URLs
  const rawYt = officialSocials.youtube || '@adrian_andrew.official';
  const ytUrl = rawYt.startsWith('http') ? rawYt : `https://youtube.com/@${rawYt.replace('@', '')}`;

  const rawIg = officialSocials.instagram || '@adrian_andrew.id';
  const igUrl = rawIg.startsWith('http') ? rawIg : `https://instagram.com/${rawIg.replace('@', '')}`;

  const rawTt = officialSocials.tiktok || '';
  const ttUrl = rawTt.startsWith('http') ? rawTt : rawTt ? `https://tiktok.com/@${rawTt.replace('@', '')}` : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCompleteOrientation({
        youtubeWatchedSeconds: secondsWatched,
        youtubeConfirmed: isYoutubeRequirementMet,
        instagramConfirmed,
        tiktokConfirmed,
        facebookConfirmed,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-amber-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-linear-to-r from-amber-600 via-amber-700 to-amber-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wide">
                  LANGKAH AKHIR ORIENTASI
                </span>
                <span className="text-amber-200 text-xs font-semibold">TBK Sinergi</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                Sinergi Wajib Member: Subscribe &amp; Follow Akun Admin
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-slate-900">
              Luar Biasa, {currentUser.name}! 🎉
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Konfirmasi tontonan YouTube (minimal 2 menit) &amp; follow akun resmi Admin berhasil dicatat. Status Anda kini telah diperbarui ke panel Admin untuk verifikasi penuh.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5 max-h-[78vh] overflow-y-auto">
            {/* Intro Welcome Box */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
              <p className="text-xs text-amber-950 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Pendaftaran Akun Anda Berhasil!</span>
              </p>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Halo <strong>{currentUser.name}</strong>, akun keanggotaan Anda telah dibuat. Sesuai prinsip saling gotong royong di Komunitas TBK, silakan selesaikan 2 langkah sinergi berikut agar status Anda diverifikasi aktif oleh Admin.
              </p>
            </div>

            {/* Step 1: YouTube Watch Requirement (2 Minutes for Algorithm Validation) */}
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 bg-slate-50/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      Langkah 1: Tonton Minimal 2 Menit &amp; Subscribe YouTube Admin
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">
                      Channel: <strong className="text-slate-800">{rawYt}</strong>
                    </p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${
                  isYoutubeRequirementMet
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {isYoutubeRequirementMet ? '✅ Terpenuhi' : 'Wajib 2 Menit'}
                </span>
              </div>

              {/* YouTube Algorithm Explanatory Notice */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-[11px] leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <span>💡 Informasi Penting Algoritma YouTube:</span>
                </p>
                <p className="text-blue-800">
                  Sesuai algoritma YouTube, penonton <strong>harus menonton video lebih dari 1–2 menit</strong> sebelum menekan Subscribe agar akun Anda diakui sebagai subscriber asli dan tidak dihapus otomatis oleh sistem anti-spam YouTube.
                </p>
              </div>

              {/* Watch Timer & Action Box */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Waktu Menonton Video YouTube:</span>
                  </span>
                  <span className="font-mono font-black text-sm text-slate-900">
                    {formatTime(secondsWatched)} / {formatTime(REQUIRED_WATCH_SECONDS)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isYoutubeRequirementMet ? 'bg-emerald-500' : 'bg-linear-to-r from-amber-400 to-amber-500'
                    }`}
                    style={{ width: `${watchPercentage}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isTimerRunning
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Jeda Timer</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>{secondsWatched > 0 ? 'Lanjutkan Timer' : 'Mulai Hitung Waktu Tonton'}</span>
                        </>
                      )}
                    </button>

                    {secondsWatched > 0 && !isYoutubeRequirementMet && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsTimerRunning(false);
                          setSecondsWatched(0);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Reset Waktu"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Direct YouTube Link Button */}
                  <a
                    href={ytUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      setHasOpenedYoutube(true);
                      if (!isTimerRunning && secondsWatched < REQUIRED_WATCH_SECONDS) {
                        setIsTimerRunning(true);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <span>Buka Video di YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {hasOpenedYoutube && !isYoutubeRequirementMet && (
                  <p className="text-[10px] text-amber-700 font-semibold italic">
                    ℹ️ Video sedang dibuka di tab baru. Pastikan Anda menonton video minimal 2 menit sambil membiarkan timer berjalan.
                  </p>
                )}

                {/* Manual checkbox toggle if user watched on another screen */}
                <label className="flex items-center gap-2 pt-2 border-t border-slate-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={youtubeConfirmed}
                    onChange={(e) => {
                      setYoutubeConfirmed(e.target.checked);
                      if (e.target.checked && secondsWatched < REQUIRED_WATCH_SECONDS) {
                        setSecondsWatched(REQUIRED_WATCH_SECONDS);
                      }
                    }}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Saya menyatakan telah menonton video lebih dari 2 menit dan telah menekan tombol Subscribe di YouTube.
                  </span>
                </label>
              </div>
            </div>

            {/* Step 2: Instagram Follow */}
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      Langkah 2: Follow Akun Instagram Official Admin
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Akun: <strong className="text-slate-800">{rawIg}</strong>
                    </p>
                  </div>
                </div>

                <a
                  href={igUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    setHasOpenedInstagram(true);
                    setInstagramConfirmed(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <span>Buka &amp; Follow IG</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={instagramConfirmed}
                  onChange={(e) => setInstagramConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Saya sudah mem-follow akun Instagram resmi Admin (<strong>{rawIg}</strong>).
                </span>
              </label>
            </div>

            {/* Step 3: TikTok / Media Lain (If Admin Configured) */}
            {ttUrl && (
              <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      <span>♪</span>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">
                        Langkah 3: Follow TikTok Official Admin (Opsional)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Akun: <strong className="text-slate-800">{rawTt}</strong>
                      </p>
                    </div>
                  </div>

                  <a
                    href={ttUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      setHasOpenedTiktok(true);
                      setTiktokConfirmed(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <span>Follow TikTok</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tiktokConfirmed}
                    onChange={(e) => setTiktokConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Saya sudah mem-follow TikTok resmi Admin ({rawTt}).
                  </span>
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
              >
                Selesaikan Nanti di Papan Tugas
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim Konfirmasi...' : 'Kirim Konfirmasi Selesai ke Admin'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

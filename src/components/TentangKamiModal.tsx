import React from 'react';
import {
  X,
  ShieldCheck,
  HeartHandshake,
  TrendingUp,
  Sparkles,
  Users,
  CheckCircle2,
  Share2,
  Flame,
  Globe2,
} from 'lucide-react';
import { Logo } from './Logo';

interface TentangKamiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
}

export const TentangKamiModal: React.FC<TentangKamiModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header with Emerald Gradient */}
        <div className="bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-800 px-6 sm:px-8 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <span className="text-xs font-bold tracking-widest text-amber-300 uppercase">
                Visi &amp; Komunitas
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Tentang Kami — Teman bawa Kawan
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-5 text-sm sm:text-base text-slate-700 leading-relaxed max-h-[75vh] overflow-y-auto">
          {/* Highlight Callout: Statement of Purpose */}
          <div className="p-4.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-emerald-950">
                Wadah Gotong Royong &amp; Saling Support Pegiat Media Sosial Indonesia
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-snug">
                Kami <strong>bukan jasa jual-beli buzzer</strong> atau penyedia bot, melainkan komunitas kolaboratif tempat sesama kreator konten dan pegiat digital saling membantu mengembangkan akun serta channel di berbagai platform.
              </p>
            </div>
          </div>

          {/* Section: Manifesto / Latar Belakang */}
          <div className="space-y-3">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Mengapa Teman bawa Kawan (TBK) Hadir?</span>
            </h4>
            <p>
              Di tengah ketatnya algoritma media sosial masa kini (seperti YouTube, TikTok, Instagram, Facebook, hingga Spotify), banyak kreator dan pemilik usaha online yang berkualitas harus berjuang sendirian tanpa adanya audiens awal atau interaksi pembuka.
            </p>
            <p>
              <strong className="text-emerald-900 font-bold">TemanbawaKawan.com</strong> hadir untuk memecahkan persoalan tersebut secara bermartabat. Kami menyatukan para pegiat media sosial dari seluruh penjuru Indonesia dalam sebuah sistem gotong royong terstruktur. Ketika Anda meluangkan waktu mendukung karya seorang kawan, kawan-kawan lain dalam komunitas pun akan bergantian mendukung karya Anda.
            </p>
          </div>

          {/* Core Values Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Bukan Jasa Buzzer / Bot</span>
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                Tidak ada akun robot atau manipulasi spam. Interaksi berasal dari manusia nyata sesama kreator yang saling menghargai jerih payah berkarya.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Dukungan 11 Platform Medsos</span>
              </div>
              <p className="text-xs text-emerald-800/90 leading-relaxed">
                Mencakup YouTube, TikTok, Instagram, Google Maps, Facebook, Threads, Playstore, LinkedIn, Spotify, Detik.com, hingga X (Twitter).
              </p>
            </div>
          </div>

          {/* Section: Cara Saling Support */}
          <div className="space-y-2 pt-2">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-600" />
              <span>Bentuk Saling Support Antar Anggota:</span>
            </h4>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Tonton Tuntas &amp; Jam Tayang Organik:</strong> Saling menonton video panjang dan shorts secara riil guna menaikkan rasio retensi algoritma.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Komentar Positif &amp; Diskusi Konstruktif:</strong> Memberikan tanggapan yang relevan dan mendalam pada postingan kawan agar algoritma mendeteksi diskusi aktif.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Ulasan Bintang 5 &amp; Reputasi UMKM:</strong> Saling membantu bisnis kawan lewat Google Maps review dan rating aplikasi di Google Play Store.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Saling Follow &amp; Subscribe:</strong> Menjalin relasi persahabatan jangka panjang sesama kreator tanpa saling menjatuhkan.
                </span>
              </li>
            </ul>
          </div>

          {/* Quote Banner */}
          <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-900 to-teal-900 text-white text-xs sm:text-sm italic text-center font-medium shadow-sm">
            &ldquo;Filosofi kami sederhana: Ketika satu teman melangkah maju, dia membawa kawan-kawannya untuk sukses bersama. Tidak ada kreator yang harus berjuang sendirian.&rdquo;
          </div>

          {/* Bottom Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="text-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-bold text-slate-900">100% Organik</p>
              <p className="text-[10px] text-slate-500">Bebas Akun Palsu</p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-bold text-slate-900">11 Platform</p>
              <p className="text-[10px] text-slate-500">Medsos Lengkap</p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-bold text-slate-900">Gotong Royong</p>
              <p className="text-[10px] text-slate-500">Saling Membantu</p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-bold text-slate-900">Privasi Aman</p>
              <p className="text-[10px] text-slate-500">Terenkripsi E2EE</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
          {onOpenRegister && (
            <button
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm shadow-md transition-colors cursor-pointer"
            >
              Gabung Bersama Kawan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

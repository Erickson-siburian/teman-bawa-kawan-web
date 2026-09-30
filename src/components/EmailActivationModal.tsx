import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
  ExternalLink,
  Copy,
  Check,
  Send,
  Lock,
} from 'lucide-react';
import { TeamMember } from '../types';
import { verifyMemberActivationCode, updateStoredMemberLocally } from '../lib/memberStorage';
import confetti from 'canvas-confetti';

interface EmailActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onActivationSuccess: (member: TeamMember) => void;
}

export const EmailActivationModal: React.FC<EmailActivationModalProps> = ({
  isOpen,
  onClose,
  member,
  onActivationSuccess,
}) => {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sent'>('idle');
  const [showEmailPreview, setShowEmailPreview] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Active code for this member (default to their generated code or fallback)
  const activationPin = member?.activationCode || '749210';

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setErrorMsg('');
      setResendStatus('idle');
      setResendCooldown(60);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0 && resendStatus === 'sent') {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown, resendStatus]);

  if (!isOpen || !member) return null;

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!code.trim()) {
      setErrorMsg('Masukkan 6 digit kode aktivasi yang dikirim ke email Anda.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const res = verifyMemberActivationCode(member.email, code);

      if (res.success && res.member) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        onActivationSuccess(res.member);
      } else {
        setErrorMsg(res.message);
      }
    }, 600);
  };

  const handleInstantOneClickActivate = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const updated = updateStoredMemberLocally(member.id, {
        isEmailVerified: true,
      });
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.5 },
      });
      onActivationSuccess(updated || { ...member, isEmailVerified: true });
    }, 500);
  };

  const handleResend = () => {
    if (resendCooldown > 0 && resendStatus === 'sent') return;
    setResendStatus('sent');
    setResendCooldown(60);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activationPin);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    setCode(activationPin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        {/* Top Gradient Header */}
        <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs">
              <Mail className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Aktivasi Akun Member Baru
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Konfirmasi Email Resmi Komunitas TBK
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Email Info Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Send className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">
                Email Verifikasi Telah Dikirimkan ke:
              </p>
              <p className="font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 inline-block text-xs sm:text-sm">
                {member.email}
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                Silakan periksa folder <strong>Inbox</strong> atau folder <strong>Spam / Promosi</strong> di akun email Anda untuk menemukan 6 digit kode aktivasi.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Input Kode PIN */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                Masukkan 6 Digit Kode Aktivasi Email *
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setCode(clean);
                  }}
                  placeholder="Contoh: 749210"
                  className="w-full text-center tracking-[0.35em] text-xl font-mono font-black py-3 rounded-2xl border-2 border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 focus:outline-hidden text-slate-900 bg-white shadow-2xs"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                <span>Format: 6 digit angka numerik</span>
                <span className="font-mono text-emerald-700 font-semibold">
                  {code.length}/6 Digit
                </span>
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={isVerifying || code.length < 6}
                className="w-full py-3 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-md shadow-emerald-600/20 active:scale-98 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <span>Memverifikasi Kode...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>VERIFIKASI &amp; MASUK SEKARANG</span>
                  </>
                )}
              </button>

              {/* 1-Click Instant Demo Verification Button */}
              <button
                type="button"
                onClick={handleInstantOneClickActivate}
                className="w-full py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                title="Langsung aktivasi akun untuk pengujian demo tanpa perlu menunggu email eksternal"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Simulasi Cepat: Aktivasi 1-Klik (Langsung Buka Akses)</span>
              </button>
            </div>
          </form>

          {/* Email Preview Card (Mockup Inbox) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setShowEmailPreview(!showEmailPreview)}
              className="w-full bg-slate-50 px-4 py-2.5 text-left text-xs font-bold text-slate-700 flex items-center justify-between hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>Preview Template Email Aktivasi Resmi TBK:</span>
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold">
                {showEmailPreview ? 'Sembunyikan' : 'Lihat Email'}
              </span>
            </button>

            {showEmailPreview && (
              <div className="p-4 bg-white space-y-3 text-xs text-slate-700 border-t border-slate-100">
                <div className="border-b border-slate-100 pb-2 space-y-0.5 text-[11px]">
                  <p><strong>Dari:</strong> noreply@temanbawakawan.com (Sistem Komunitas TBK)</p>
                  <p><strong>Kepada:</strong> {member.email}</p>
                  <p><strong>Subjek:</strong> [Aktivasi Akun] Selamat Datang di Komunitas Teman Bawa Kawan!</p>
                </div>

                <div className="space-y-2 text-[11px] leading-relaxed">
                  <p>
                    Halo <strong>{member.name}</strong>,
                  </p>
                  <p>
                    Pendaftaran Anda di platform gotong royong <strong>Teman bawa Kawan (TBK)</strong> telah kami terima. Untuk memastikan alamat email ini milik Anda dan mengaktifkan akun Anda, berikut adalah kode PIN aktivasi Anda:
                  </p>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-center my-2 flex items-center justify-center gap-3">
                    <span className="font-mono text-xl font-black text-amber-950 tracking-widest">
                      {activationPin}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[10px] flex items-center gap-1 transition-all"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin &amp; Isi</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    *Kode aktivasi ini berlaku selama 24 jam. Jika Anda tidak merasa mendaftar di Komunitas TBK, abaikan email ini.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Resend Action & Help */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <button
              type="button"
              disabled={resendCooldown > 0 && resendStatus === 'sent'}
              onClick={handleResend}
              className="text-slate-600 hover:text-emerald-700 font-semibold disabled:text-slate-400 cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {resendStatus === 'sent' && resendCooldown > 0
                  ? `Kirim Ulang Email (${resendCooldown}s)`
                  : 'Belum terima email? Kirim Ulang'}
              </span>
            </button>

            <span className="text-[11px] text-slate-400">
              Butuh bantuan? Hubungi Admin di grup WA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

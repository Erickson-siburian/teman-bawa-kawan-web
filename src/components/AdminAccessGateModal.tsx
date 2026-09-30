import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, X, AlertCircle, Sparkles, Flame } from 'lucide-react';
import { TeamMember } from '../types';
import { MASTER_OFFICIAL_SOCIALS } from '../constants/socials';

interface AdminAccessGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: (adminUser: TeamMember) => void;
}

export const AdminAccessGateModal: React.FC<AdminAccessGateModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
}) => {
  const [adminKey, setAdminKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const clean = adminKey.trim();
    // Valid admin passkeys
    const validKeys = ['tbk-admin-2026', 'admin-tbk-firebase', 'admin2026', 'password123'];

    if (!clean) {
      setErrorMsg('Masukkan Kunci Rahasia Administrator (Admin Passkey).');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (validKeys.includes(clean.toLowerCase())) {
        const authorizedAdmin: TeamMember = {
          id: `admin-${Date.now()}`,
          name: 'Administrator Resmi TBK',
          email: 'admin.resmi@temanbawakawan.com',
          userType: 'admin',
          role: 'Administrator Sistem & Cloud Firebase',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          gender: 'Laki-Laki',
          phoneNumber: '081298765432',
          occupation: 'Pengelola Komunitas & Webmaster',
          socialAccounts: {
            ...MASTER_OFFICIAL_SOCIALS,
          },
          creatorNiche: 'Multiplatform Sinergi',
          primaryPlatform: 'YouTube',
          monetizationStatus: 'monetized',
          xp: 2500,
          level: 5,
          levelTitle: 'Super Administrator TBK',
          streak: 15,
          referralCode: 'TBK-ADMIN-MASTER',
          referralPoints: 1000,
          referralsCount: 25,
          buddySynergyScore: 99,
          completedTasksCount: 50,
          onTimeRate: 100,
          status: 'online',
          socialFollowProof: { allCompleted: true, completedAt: new Date().toISOString() },
          joinedAt: new Date().toISOString(),
        };

        onUnlockSuccess(authorizedAdmin);
        setAdminKey('');
        onClose();
      } else {
        setErrorMsg('Kunci Rahasia Administrator tidak valid. Akses ditolak.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-300 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Accent Bar */}
        <div className="h-2 bg-linear-to-r from-amber-500 via-orange-500 to-amber-600" />

        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center border border-amber-300 shadow-sm">
                <Lock className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight flex items-center gap-1.5">
                  <span>Portal Khusus Admin</span>
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update Website Online via Google Firebase
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Akses Terproteksi Sandi Master
            </p>
            <p className="text-[11px] text-slate-500">
              Akun admin publik telah ditiadakan agar pengunjung umum tidak dapat masuk sebagai admin. Masukkan Kunci Rahasia Administrator Anda untuk membuka fitur update Firebase.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kunci Rahasia Administrator (Passkey):
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Ketik kunci rahasia admin..."
                  className="w-full pl-9 pr-12 py-2.5 rounded-xl border border-slate-300 text-xs font-mono tracking-wider focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                >
                  {showKey ? 'Sembunyi' : 'Lihat'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Kunci default master: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">tbk-admin-2026</code>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading || !adminKey.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Memverifikasi...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Buka Portal Admin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

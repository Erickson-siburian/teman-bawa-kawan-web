import React, { useState, useEffect } from 'react';
import { X, Youtube, Instagram, ShieldCheck, CheckCircle2, Save, Trash2, ExternalLink, Sparkles } from 'lucide-react';
import { MemberSocialAccounts, Task } from '../types';

interface AdminOfficialSocialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSocials?: MemberSocialAccounts;
  mandatoryTask?: Task | null;
  onSave: (socials: MemberSocialAccounts, enableMandatoryTask: boolean) => Promise<void> | void;
  onDeleteMandatoryTask?: () => void;
}

export const AdminOfficialSocialsModal: React.FC<AdminOfficialSocialsModalProps> = ({
  isOpen,
  onClose,
  currentSocials,
  mandatoryTask,
  onSave,
  onDeleteMandatoryTask,
}) => {
  const [youtube, setYoutube] = useState(currentSocials?.youtube || '');
  const [instagram, setInstagram] = useState(currentSocials?.instagram || '');
  const [tiktok, setTiktok] = useState(currentSocials?.tiktok || '');
  const [facebook, setFacebook] = useState(currentSocials?.facebook || '');
  const [enableMandatory, setEnableMandatory] = useState(!!mandatoryTask);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setYoutube(currentSocials?.youtube || '');
      setInstagram(currentSocials?.instagram || '');
      setTiktok(currentSocials?.tiktok || '');
      setFacebook(currentSocials?.facebook || '');
      setEnableMandatory(!!mandatoryTask);
      setSuccessMessage('');
    }
  }, [isOpen, currentSocials, mandatoryTask]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    const updatedSocials: MemberSocialAccounts = {
      ...currentSocials,
      youtube: youtube.trim(),
      instagram: instagram.trim(),
      tiktok: tiktok.trim(),
      facebook: facebook.trim(),
    };

    try {
      await onSave(updatedSocials, enableMandatory);
      setSuccessMessage('Pengaturan akun medsos resmi & tugas wajib member berhasil disimpan!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch {
      setSuccessMessage('Gagal menyimpan ke server, silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-linear-to-r from-amber-600 via-amber-700 to-amber-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base font-black text-white leading-tight">
                Pengaturan Media Sosial Resmi Admin TBK
              </h3>
              <p className="text-[11px] text-amber-100 font-medium">
                Atur akun media sosial yang wajib di-subscribe &amp; di-follow oleh seluruh calon member baru
              </p>
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

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Status Box */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Status Tugas Orientasi Member:
              </span>
              <p className="text-[11px] text-amber-800">
                {enableMandatory
                  ? 'Aktif: Member baru akan otomatis menerima tugas wajib subscribe & follow akun di bawah ini.'
                  : 'Nonaktif: Member baru bebas bergabung tanpa kewajiban follow akun admin.'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={enableMandatory}
                onChange={(e) => setEnableMandatory(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              <span className="ml-2 text-xs font-bold text-slate-800">
                {enableMandatory ? 'Wajibkan' : 'Opsional'}
              </span>
            </label>
          </div>

          {/* Social Fields */}
          <div className="space-y-4">
            {/* YouTube */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-red-600" />
                  <span>Link Channel YouTube Official Admin (Wajib Subscribe)</span>
                </span>
                {youtube && (
                  <a
                    href={youtube.startsWith('http') ? youtube : `https://youtube.com/@${youtube.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Uji Buka Link</span>
                  </a>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="Contoh: https://youtube.com/@namaChannelAnda atau @namaChannel"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/60"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Link ini akan dibuka saat member menekan tombol "Buka Link YouTube" untuk menonton &amp; subscribe.
              </p>
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span>Akun / Link Instagram Official Admin (Wajib Follow)</span>
                </span>
                {instagram && (
                  <a
                    href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-pink-600 hover:text-pink-700 font-bold flex items-center gap-1 underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Uji Buka Link</span>
                  </a>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Contoh: @akun_resmi_admin atau https://instagram.com/akun_resmi_admin"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/60"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Username / tautan IG resmi Admin untuk di-follow oleh calon anggota baru.
              </p>
            </div>

            {/* TikTok */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">♪</span>
                  <span>Username / Link TikTok Official Admin (Wajib Follow)</span>
                </span>
                {tiktok && (
                  <a
                    href={tiktok.startsWith('http') ? tiktok : `https://tiktok.com/@${tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-slate-900 hover:text-indigo-600 font-bold flex items-center gap-1 underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Uji Buka Link</span>
                  </a>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="Contoh: @akun_tiktok_admin atau https://tiktok.com/@akun_tiktok_admin"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/60"
                />
              </div>
            </div>

            {/* Facebook / Media Lain */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-blue-600">f</span>
                  <span>Fanspage Facebook / Media Lain Admin</span>
                </span>
                {facebook && facebook.startsWith('http') && (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Uji Buka Link</span>
                  </a>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="Contoh: https://facebook.com/namaFanspage atau Nama Fanspage"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/60"
                />
              </div>
            </div>
          </div>

          {/* Preview Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
              Pratinjau Tampilan Tugas Bagi Anggota Baru
            </span>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-red-600">
                <span>📌 [Wajib] Subscribe &amp; Follow Media Sosial Official Admin TBK</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Sinergi saling support wajib bagi seluruh calon member baru: silakan tonton, subscribe YouTube Official Admin TBK dan follow akun media sosial resmi kami.
              </p>
              {youtube && (
                <div className="flex items-center gap-1 text-[11px] text-red-600 font-semibold">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{youtube}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan & Terapkan ke Seluruh Member'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>

            {mandatoryTask && onDeleteMandatoryTask && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin menonaktifkan tugas wajib follow sosmed admin?')) {
                    onDeleteMandatoryTask();
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Tugas Wajib Ini</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

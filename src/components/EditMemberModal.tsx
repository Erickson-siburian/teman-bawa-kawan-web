import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Wrench,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Youtube,
  Instagram,
} from 'lucide-react';
import { TeamMember, MemberSocialAccounts } from '../types';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onSave: (updatedMember: TeamMember) => Promise<void> | void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<'Laki-Laki' | 'Perempuan'>('Laki-Laki');
  const [occupation, setOccupation] = useState('');
  const [role, setRole] = useState('');
  const [userType, setUserType] = useState<'admin' | 'user'>('user');
  const [status, setStatus] = useState<'online' | 'busy' | 'offline'>('online');
  const [avatar, setAvatar] = useState('');

  // Social accounts
  const [socials, setSocials] = useState<MemberSocialAccounts>({});

  // Orientation / Verification status
  const [youtubeWatchedSeconds, setYoutubeWatchedSeconds] = useState(0);
  const [youtubeSubscribed, setYoutubeSubscribed] = useState(false);
  const [instagramFollowed, setInstagramFollowed] = useState(false);
  const [whatsappJoined, setWhatsappJoined] = useState(false);
  const [tiktokFollowed, setTiktokFollowed] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (member && isOpen) {
      setName(member.name || '');
      setEmail(member.email || '');
      setPassword(member.password || 'password123');
      setPhoneNumber(member.phoneNumber || '');
      setGender(member.gender || 'Laki-Laki');
      setOccupation(member.occupation || '');
      setRole(member.role || 'Member Aktif TBK');
      setUserType(member.userType || 'user');
      setStatus(member.status || 'online');
      setAvatar(member.avatar || '');
      setSocials(member.socialAccounts || {});

      const proof = member.socialFollowProof || {};
      setYoutubeWatchedSeconds(proof.youtubeWatchedSeconds || 0);
      setYoutubeSubscribed(!!proof.youtubeSubscribed);
      setInstagramFollowed(!!proof.instagramFollowed);
      setWhatsappJoined(!!proof.whatsappJoined);
      setTiktokFollowed(!!proof.tiktokFollowed);
      setAllCompleted(!!proof.allCompleted);
      setMessage(null);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setMessage({ type: 'error', text: 'Nama dan Email wajib diisi!' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const isDone = allCompleted || (youtubeSubscribed && instagramFollowed && whatsappJoined);

    const updated: TeamMember = {
      ...member,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim() || member.password || 'password123',
      phoneNumber: phoneNumber.trim(),
      gender,
      occupation: occupation.trim() || 'Member Aktif',
      role: role.trim() || (userType === 'admin' ? 'Administrator TBK' : 'Member Aktif TBK'),
      userType,
      status,
      avatar: avatar.trim() || member.avatar,
      socialAccounts: {
        ...member.socialAccounts,
        ...socials,
      },
      socialFollowProof: {
        ...member.socialFollowProof,
        youtubeWatchedSeconds: Number(youtubeWatchedSeconds) || 0,
        youtubeSubscribed,
        youtubeWatchProof:
          youtubeWatchedSeconds >= 120
            ? `Tuntas ${Math.floor(youtubeWatchedSeconds / 60)}m ${youtubeWatchedSeconds % 60}s (> 2 Menit, Valid Algoritma)`
            : `${Math.floor(youtubeWatchedSeconds / 60)}m ${youtubeWatchedSeconds % 60}s`,
        youtubeVerifiedAt: youtubeSubscribed ? new Date().toISOString() : undefined,
        instagramFollowed,
        whatsappJoined,
        tiktokFollowed,
        allCompleted: isDone,
        completedAt: isDone ? member.socialFollowProof?.completedAt || new Date().toISOString() : undefined,
      },
    };

    try {
      await onSave(updated);
      setMessage({ type: 'success', text: `Data member ${updated.name} berhasil diperbarui!` });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1000);
    } catch {
      setMessage({ type: 'error', text: 'Gagal menyimpan perubahan member ke server.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <User className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wide">
                  EDIT DATA MEMBER
                </span>
                <span className="text-emerald-200 text-xs font-mono">ID: {member.id}</span>
              </div>
              <h3 className="text-base font-black text-white leading-tight mt-0.5">
                Perbarui Informasi Akun {member.name}
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

        {/* Message Alert */}
        {message && (
          <div
            className={`px-6 py-3 text-xs font-bold flex items-center gap-2 border-b ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Section 1: Profil Utama */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Detail Profil &amp; Akun</span>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs">
              {/* Nama & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-lg border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white shadow-2xs">
                    <span className="px-3 bg-slate-50 border-r border-slate-300 flex items-center text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Alamat Email <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-lg border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white shadow-2xs">
                    <span className="px-3 bg-slate-50 border-r border-slate-300 flex items-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Nomor HP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Password Akun <span className="text-slate-400 font-normal">(bisa diubah)</span>
                  </label>
                  <div className="flex rounded-lg border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white shadow-2xs">
                    <span className="px-3 bg-slate-50 border-r border-slate-300 flex items-center text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                  <div className="flex rounded-lg border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white shadow-2xs">
                    <span className="px-3 bg-slate-50 border-r border-slate-300 flex items-center text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="081234567890"
                      className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Jenis Kelamin, Tipe Akun & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Laki-Laki' | 'Perempuan')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Akun (Hak Akses)</label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as 'admin' | 'user')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="user">👤 User / Member</option>
                    <option value="admin">👑 Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kehadiran</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'online' | 'busy' | 'offline')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="online">🟢 Online</option>
                    <option value="busy">🟡 Sibuk</option>
                    <option value="offline">⚪ Offline</option>
                  </select>
                </div>
              </div>

              {/* Pekerjaan & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pekerjaan</label>
                  <div className="flex rounded-lg border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white shadow-2xs">
                    <span className="px-3 bg-slate-50 border-r border-slate-300 flex items-center text-slate-400">
                      <Wrench className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="Contoh: Kreator Konten, Wiraswasta"
                      className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Jabatan Komunitas</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Contoh: Ambassador TBK, Member Aktif"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Akun Media Sosial Member */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Akun Media Sosial Member</span>
              <span className="text-[10px] text-slate-400 font-normal">Untuk kolaborasi saling follow</span>
            </div>

            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Instagram (@username)</label>
                <input
                  type="text"
                  value={socials.instagram || ''}
                  onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                  placeholder="@username_ig"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">YouTube (Channel / Handle)</label>
                <input
                  type="text"
                  value={socials.youtube || ''}
                  onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                  placeholder="Nama Channel atau @handle"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">TikTok (@username)</label>
                <input
                  type="text"
                  value={socials.tiktok || ''}
                  onChange={(e) => setSocials({ ...socials, tiktok: e.target.value })}
                  placeholder="@username_tiktok"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Facebook</label>
                <input
                  type="text"
                  value={socials.facebook || ''}
                  onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                  placeholder="Nama Akun Facebook"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Status Validasi Orientasi Medsos (YouTube 2 Menit & Follow) */}
          <div className="border border-amber-200 rounded-xl overflow-hidden bg-amber-50/40 shadow-2xs">
            <div className="bg-amber-100/70 border-b border-amber-200 px-4 py-2.5 font-bold text-xs text-amber-950 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-600" />
                <span>Status Orientasi Medsos Admin &amp; YouTube 2 Menit</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                allCompleted || (youtubeSubscribed && instagramFollowed && whatsappJoined)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-200 text-amber-900'
              }`}>
                {allCompleted || (youtubeSubscribed && instagramFollowed && whatsappJoined)
                  ? '✅ Tuntas'
                  : '⏳ Belum Tuntas'}
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Durasi Menonton YouTube (Detik)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={youtubeWatchedSeconds}
                      onChange={(e) => setYoutubeWatchedSeconds(Number(e.target.value))}
                      className="w-32 px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <span className="text-[11px] text-slate-500 font-semibold">
                      = {Math.floor(youtubeWatchedSeconds / 60)}m {youtubeWatchedSeconds % 60}s{' '}
                      {youtubeWatchedSeconds >= 120 ? '(Valid > 2 Menit)' : '(Kurang)'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={youtubeSubscribed}
                      onChange={(e) => setYoutubeSubscribed(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span>Channel YouTube Admin Sudah di-Subscribe</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={instagramFollowed}
                      onChange={(e) => setInstagramFollowed(e.target.checked)}
                      className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <span>Akun Instagram Admin Sudah di-Follow</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={whatsappJoined}
                      onChange={(e) => setWhatsappJoined(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span>Grup WhatsApp Resmi Sudah di-Join</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-800 pt-1 border-t border-amber-200">
                    <input
                      type="checkbox"
                      checked={allCompleted}
                      onChange={(e) => {
                        setAllCompleted(e.target.checked);
                        if (e.target.checked) {
                          setYoutubeSubscribed(true);
                          setInstagramFollowed(true);
                          setWhatsappJoined(true);
                          if (youtubeWatchedSeconds < 120) setYoutubeWatchedSeconds(125);
                        }
                      }}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span>Tandai Seluruh Misi Orientasi Selesai (Buka Penuh)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

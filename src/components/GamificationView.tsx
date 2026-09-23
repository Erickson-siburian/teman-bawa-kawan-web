import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  Check,
  Copy,
  UserPlus,
  ShieldCheck,
  LayoutGrid,
  Table as TableIcon,
  X,
} from 'lucide-react';
import { ReferralRecord, TeamMember } from '../types';

interface GamificationViewProps {
  currentUser: TeamMember;
  allMembers: TeamMember[];
  referrals?: ReferralRecord[];
  onRedeemReward?: (rewardName: string, cost: number) => void;
  onOpenRegisterModal?: () => void;
}

interface PlatformDef {
  key: keyof NonNullable<TeamMember['socialAccounts']>;
  label: string;
  icon: string;
}

const PLATFORMS: PlatformDef[] = [
  { key: 'instagram', label: 'Instagram', icon: '📷' },
  { key: 'youtube', label: 'YouTube', icon: '▶' },
  { key: 'tiktok', label: 'TikTok', icon: '♪' },
  { key: 'googleMap', label: 'Google Map', icon: '📍' },
  { key: 'facebook', label: 'Facebook', icon: 'f' },
  { key: 'threads', label: 'Threads', icon: '@' },
  { key: 'googlePlaystore', label: 'Playstore', icon: '▶' },
  { key: 'linkedIn', label: 'LinkedIn', icon: 'in' },
  { key: 'spotify', label: 'Spotify', icon: '●' },
  { key: 'detik', label: 'Detik.com', icon: 'd' },
  { key: 'xTwitter', label: 'X (Twitter)', icon: '𝕏' },
];

export const GamificationView: React.FC<GamificationViewProps> = ({
  currentUser,
  allMembers,
  onOpenRegisterModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'total' | 'admin'>('total');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [activePlatformFilter, setActivePlatformFilter] = useState<string | null>(null);

  // Admin count
  const adminMembers = useMemo(
    () => allMembers.filter((m) => m.userType === 'admin' || m.role?.toLowerCase().includes('admin')),
    [allMembers]
  );

  // Count members who registered each platform
  const platformCounts = useMemo(() => {
    const map: Record<string, number> = {};
    PLATFORMS.forEach((p) => {
      map[p.key] = allMembers.filter((m) => {
        const val = m.socialAccounts?.[p.key];
        return typeof val === 'string' && val.trim().length > 0;
      }).length;
    });
    return map;
  }, [allMembers]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return allMembers.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.phoneNumber && m.phoneNumber.includes(searchQuery)) ||
        (m.occupation && m.occupation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.role && m.role.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesCategory = true;
      if (selectedCategory === 'admin') {
        matchesCategory = m.userType === 'admin' || m.role?.toLowerCase().includes('admin');
      }

      let matchesPlatform = true;
      if (activePlatformFilter) {
        const val = m.socialAccounts?.[activePlatformFilter as keyof NonNullable<TeamMember['socialAccounts']>];
        matchesPlatform = typeof val === 'string' && val.trim().length > 0;
      }

      return matchesSearch && matchesCategory && matchesPlatform;
    });
  }, [allMembers, searchQuery, selectedCategory, activePlatformFilter]);

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  const selectedPlatformObj = PLATFORMS.find((p) => p.key === activePlatformFilter);

  return (
    <div className="space-y-6">
      {/* Top Banner: Member Aktif Header & Current User Profile */}
      <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-600/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-emerald-400/40 shadow-lg"
                referrerPolicy="no-referrer"
              />
              <span
                className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                  currentUser.userType === 'admin' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-400 text-slate-950'
                }`}
              >
                {currentUser.userType === 'admin' ? 'Admin' : 'Member'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-bold border border-emerald-400/30">
                  {currentUser.status === 'online' ? '● Aktif' : 'Offline'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200 font-medium mt-0.5">
                {currentUser.occupation || currentUser.role || 'Member Terdaftar'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-emerald-100/80 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-300" />
                  <strong className="text-white">{currentUser.email}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-300" />
                  <strong className="text-white">{currentUser.phoneNumber || '-'}</strong>
                </span>
                <span>•</span>
                <span>
                  Jenis Kelamin: <strong className="text-white">{currentUser.gender || 'Laki-Laki'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Category Summary Cards */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-center min-w-[110px]">
              <p className="text-xs text-emerald-200 font-medium">Total Member</p>
              <p className="text-xl sm:text-2xl font-black text-amber-300">{allMembers.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-center min-w-[110px]">
              <p className="text-xs text-emerald-200 font-medium">Administrator</p>
              <p className="text-xl sm:text-2xl font-black text-amber-400">{adminMembers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Tabs, View Toggle (Grid vs Table), and Register Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab Total Member */}
          <button
            onClick={() => {
              setSelectedCategory('total');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategory === 'total'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Total Member ({allMembers.length})</span>
          </button>

          {/* Tab Pengelola / Admin */}
          <button
            onClick={() => {
              setSelectedCategory('admin');
              setActivePlatformFilter(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategory === 'admin'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pengelola / Admin ({adminMembers.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Layout Switcher: Grid vs Daftar/Tabel */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewLayout === 'grid'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Kartu / Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewLayout === 'table'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Daftar / Tabel"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Daftar / Tabel</span>
            </button>
          </div>

          {onOpenRegisterModal && (
            <button
              onClick={onOpenRegisterModal}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Daftarkan Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Inside Total Member Tab: Interactive Social Media Platform Icons and Counts */}
      {selectedCategory === 'total' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pilih Platform Media Sosial:
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Klik ikon platform untuk membuka daftar dan jumlah member yang mendaftar dengan medsos tersebut.
              </p>
            </div>
            {activePlatformFilter && (
              <button
                type="button"
                onClick={() => setActivePlatformFilter(null)}
                className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filter Medsos</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-1">
            {PLATFORMS.map((platform) => {
              const count = platformCounts[platform.key] || 0;
              const isSelected = activePlatformFilter === platform.key;

              return (
                <button
                  key={platform.key}
                  type="button"
                  onClick={() => {
                    setActivePlatformFilter(isSelected ? null : (platform.key as string));
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 bg-emerald-50/90 border-emerald-500 shadow-xs'
                      : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{platform.icon}</span>
                    <span className="text-xs font-bold text-slate-800 truncate">{platform.label}</span>
                  </div>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {activePlatformFilter && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
              <span>
                Menampilkan <strong>{filteredMembers.length} member</strong> yang mendaftarkan akun <strong>{selectedPlatformObj?.label}</strong>.
              </span>
              <button
                type="button"
                onClick={() => setActivePlatformFilter(null)}
                className="font-bold underline cursor-pointer hover:text-emerald-950"
              >
                Tampilkan Semua Platform
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search & Results Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari member berdasarkan Nama, Email, No. HP, Akun Medsos, atau Pekerjaan..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Menampilkan <strong>{filteredMembers.length}</strong> anggota
          </span>
        </div>

        {/* View Layout: TABEL (Daftar/Tabel) */}
        {viewLayout === 'table' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Member</th>
                    <th className="py-3.5 px-4">Kontak (Email &amp; No. HP)</th>
                    <th className="py-3.5 px-4">Pekerjaan</th>
                    <th className="py-3.5 px-4">Akun Media Sosial</th>
                    <th className="py-3.5 px-4">Hak Akses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        Tidak ada member yang cocok dengan filter atau pencarian Anda.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
                      const soc = member.socialAccounts || {};
                      const isAdmin = member.userType === 'admin' || member.role?.toLowerCase().includes('admin');
                      return (
                        <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="font-bold text-slate-900 text-xs sm:text-sm">{member.name}</p>
                                <span className="text-[10px] text-slate-400">Gender: {member.gender || 'Laki-Laki'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <p className="font-mono text-slate-700">{member.email}</p>
                              {member.phoneNumber && (
                                <p className="text-slate-500 flex items-center gap-1 font-mono">
                                  <span>{member.phoneNumber}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPhone(member.id, member.phoneNumber || '')}
                                    className="p-1 hover:bg-slate-200 rounded cursor-pointer"
                                    title="Salin No HP"
                                  >
                                    {copiedPhoneId === member.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-700">
                              {member.occupation || member.role || 'Member Aktif'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {soc.instagram && (
                                <span className="px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 text-[10px] font-semibold border border-pink-200">
                                  IG: {soc.instagram}
                                </span>
                              )}
                              {soc.youtube && (
                                <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-semibold border border-red-200">
                                  YT: {soc.youtube}
                                </span>
                              )}
                              {soc.tiktok && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold border border-slate-300">
                                  TikTok: {soc.tiktok}
                                </span>
                              )}
                              {soc.googleMap && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                                  Map
                                </span>
                              )}
                              {soc.facebook && (
                                <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold border border-sky-200">
                                  FB
                                </span>
                              )}
                              {soc.threads && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 text-[10px] font-semibold border border-zinc-300">
                                  Threads
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isAdmin ? 'Admin' : 'Member'}
                              </span>
                              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Aktif" />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* View Layout: GRID (Kartu) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredMembers.map((member) => {
              const soc = member.socialAccounts || {};
              const connectedCount = Object.values(soc).filter(Boolean).length;
              const isAdmin = member.userType === 'admin' || member.role?.toLowerCase().includes('admin');

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Avatar, Name, Email, Status */}
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30"
                          referrerPolicy="no-referrer"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {member.name}
                          </h3>
                          {isAdmin && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-emerald-700 font-medium truncate mt-0.5">
                          {member.occupation || member.role || 'Member Aktif'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5 font-mono">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </p>
                      </div>
                    </div>

                    {/* WhatsApp / Phone Row */}
                    {member.phoneNumber && (
                      <div className="mb-3 flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{member.phoneNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(member.id, member.phoneNumber || '')}
                          className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                          title="Salin Nomor HP"
                        >
                          {copiedPhoneId === member.id ? (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Tersalin
                            </span>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Social Accounts Connected */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Akun Media Sosial:</span>
                        <span className="font-bold text-emerald-700">{connectedCount} Platform</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {soc.instagram && (
                          <span
                            title={`Instagram: ${soc.instagram}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-200 text-[10px] font-bold"
                          >
                            <span>📷</span> {soc.instagram}
                          </span>
                        )}
                        {soc.youtube && (
                          <span
                            title={`YouTube: ${soc.youtube}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold"
                          >
                            <span>▶</span> {soc.youtube}
                          </span>
                        )}
                        {soc.tiktok && (
                          <span
                            title={`TikTok: ${soc.tiktok}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-900 border border-slate-300 text-[10px] font-bold"
                          >
                            <span>♪</span> {soc.tiktok}
                          </span>
                        )}
                        {soc.googleMap && (
                          <span
                            title={`Google Map Review: ${soc.googleMap}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold"
                          >
                            <span>📍</span> Maps
                          </span>
                        )}
                        {soc.facebook && (
                          <span
                            title={`Facebook: ${soc.facebook}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold"
                          >
                            <span>f</span> FB
                          </span>
                        )}
                        {soc.threads && (
                          <span
                            title={`Threads: ${soc.threads}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-300 text-[10px] font-bold"
                          >
                            <span>@</span> Threads
                          </span>
                        )}
                        {soc.googlePlaystore && (
                          <span
                            title={`Playstore: ${soc.googlePlaystore}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold"
                          >
                            <span>▶</span> Playstore
                          </span>
                        )}
                        {soc.xTwitter && (
                          <span
                            title={`X: ${soc.xTwitter}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-bold"
                          >
                            <span>𝕏</span> X
                          </span>
                        )}
                        {connectedCount === 0 && (
                          <span className="text-[11px] text-slate-400 italic">
                            Belum melengkapi akun media sosial
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Gender: <strong>{member.gender || 'Laki-Laki'}</strong></span>
                    <span className="text-[11px] text-emerald-600 font-semibold">Terdaftar &amp; Terverifikasi</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

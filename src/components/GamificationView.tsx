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
  Globe,
} from 'lucide-react';
import { ReferralRecord, TeamMember } from '../types';

interface GamificationViewProps {
  currentUser: TeamMember;
  allMembers: TeamMember[];
  referrals?: ReferralRecord[];
  onRedeemReward?: (rewardName: string, cost: number) => void;
  onOpenRegisterModal?: () => void;
}

export const GamificationView: React.FC<GamificationViewProps> = ({
  currentUser,
  allMembers,
  onOpenRegisterModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'with_socials' | 'admin'>('all');
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Group stats
  const membersWithSocials = useMemo(
    () => allMembers.filter((m) => m.socialAccounts && Object.values(m.socialAccounts).some(Boolean)),
    [allMembers]
  );
  const adminMembers = useMemo(
    () => allMembers.filter((m) => m.userType === 'admin' || m.role?.toLowerCase().includes('admin')),
    [allMembers]
  );

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
      if (selectedCategory === 'with_socials') {
        matchesCategory = Boolean(m.socialAccounts && Object.values(m.socialAccounts).some(Boolean));
      } else if (selectedCategory === 'admin') {
        matchesCategory = m.userType === 'admin' || m.role?.toLowerCase().includes('admin');
      }

      return matchesSearch && matchesCategory;
    });
  }, [allMembers, searchQuery, selectedCategory]);

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

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
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-center min-w-[100px]">
              <p className="text-xs text-emerald-200 font-medium">Total Terdaftar</p>
              <p className="text-xl sm:text-2xl font-black text-amber-300">{allMembers.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-center min-w-[100px]">
              <p className="text-xs text-emerald-200 font-medium">Lengkap Sosmed</p>
              <p className="text-xl sm:text-2xl font-black text-white">{membersWithSocials.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-center min-w-[100px]">
              <p className="text-xs text-emerald-200 font-medium">Administrator</p>
              <p className="text-xl sm:text-2xl font-black text-amber-400">{adminMembers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filter by Category, Search, and Add Member Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Semua Member ({allMembers.length})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('with_socials')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategory === 'with_socials'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Member dg Akun Sosmed ({membersWithSocials.length})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('admin')}
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

        {onOpenRegisterModal && (
          <button
            onClick={onOpenRegisterModal}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Daftarkan Member Baru</span>
          </button>
        )}
      </div>

      {/* Direktori & Rekap Member Aktif */}
      <div className="space-y-5">
        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari member berdasarkan Nama, Email, No. HP, Sosmed, atau Pekerjaan..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Members Cards Grid */}
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

                  {/* Phone Contact */}
                  {member.phoneNumber && (
                    <div className="mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{member.phoneNumber}</span>
                      </div>
                      <button
                        onClick={() => handleCopyPhone(member.id, member.phoneNumber!)}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1"
                      >
                        {copiedPhoneId === member.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Connected Social Media Accounts */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span>Media Sosial Terdaftar</span>
                      <span className="text-emerald-600 font-bold">{connectedCount} Akun</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
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
      </div>
    </div>
  );
};

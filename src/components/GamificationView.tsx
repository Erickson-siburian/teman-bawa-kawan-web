import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Award,
  Zap,
  Flame,
  Phone,
  Mail,
  Briefcase,
  Copy,
  Check,
  Sparkles,
  Gift,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  Filter,
  UserPlus,
  MessageCircle,
} from 'lucide-react';
import { ReferralRecord, TeamMember } from '../types';
import confetti from 'canvas-confetti';
import { playLevelUpFanfare } from '../lib/audio';

interface GamificationViewProps {
  currentUser: TeamMember;
  allMembers: TeamMember[];
  referrals: ReferralRecord[];
  onRedeemReward: (rewardName: string, cost: number) => void;
  onOpenRegisterModal?: () => void;
}

const shopItems = [
  {
    id: 'item-1',
    name: 'Booster Jam Tayang 2x Sinergi (24 Jam)',
    cost: 100,
    icon: '🚀',
    desc: 'Melipatgandakan perolehan XP sinergi kolaborasi konten selama 1 hari.',
  },
  {
    id: 'item-2',
    name: 'Gelar Eksklusif: "Top Monetizer TBK"',
    cost: 200,
    icon: '👑',
    desc: 'Sematkan titel kehormatan di profil dan leaderboard member circle.',
  },
  {
    id: 'item-3',
    name: 'Traktir Kopi Kawan Kreator',
    cost: 50,
    icon: '☕',
    desc: 'Kirimkan apresiasi kopi virtual ke kawan partner duet & live streaming.',
  },
  {
    id: 'item-4',
    name: 'Spotlight Kolaborasi Kreator',
    cost: 150,
    icon: '⚡',
    desc: 'Profil media sosial Anda diprioritaskan untuk ajakan kolaborasi konten.',
  },
];

export const GamificationView: React.FC<GamificationViewProps> = ({
  currentUser,
  allMembers,
  referrals,
  onRedeemReward,
  onOpenRegisterModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'leaderboard' | 'rewards'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccupation, setSelectedOccupation] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState<string | null>(null);

  // Gamification level progress
  const nextLevelXp = currentUser.level * 350;
  const currentLevelBaseXp = (currentUser.level - 1) * 350;
  const progressPercent = Math.min(
    100,
    Math.round(((currentUser.xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100)
  );

  // Unique occupations for filter dropdown
  const occupationsList = useMemo(() => {
    const set = new Set<string>();
    allMembers.forEach((m) => {
      if (m.occupation) set.add(m.occupation);
    });
    return Array.from(set);
  }, [allMembers]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return allMembers.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.occupation && m.occupation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.phoneNumber && m.phoneNumber.includes(searchQuery)) ||
        (m.role && m.role.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesOcc =
        selectedOccupation === 'all' || m.occupation === selectedOccupation;

      return matchesSearch && matchesOcc;
    });
  }, [allMembers, searchQuery, selectedOccupation]);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  const handleBuy = (item: (typeof shopItems)[0]) => {
    if (currentUser.referralPoints < item.cost) {
      alert(`Poin referal belum mencukupi. Butuh ${item.cost} poin.`);
      return;
    }
    onRedeemReward(item.name, item.cost);
    playLevelUpFanfare();
    confetti({ particleCount: 50, spread: 60 });
    setRedeemSuccessMsg(`Berhasil menukarkan "${item.name}"!`);
    setTimeout(() => setRedeemSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Member Aktif Header & User Profile Summary */}
      <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-600/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-amber-400/40 shadow-lg"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px]">
                Lv.{currentUser.level}
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
                {currentUser.occupation || currentUser.role || 'Member Komentator & Kreator Terverifikasi'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-emerald-100/80">
                <span>
                  Jenis Kelamin:{' '}
                  <strong className="text-white">{currentUser.gender || 'Laki-Laki'}</strong>
                </span>
                <span>•</span>
                <span>
                  No. HP:{' '}
                  <strong className="text-white">{currentUser.phoneNumber || '0812-xxxx-xxxx'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-center min-w-[90px]">
              <p className="text-xs text-emerald-200 font-medium">Total Member</p>
              <p className="text-xl sm:text-2xl font-black text-amber-300">{allMembers.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-center min-w-[90px]">
              <p className="text-xs text-emerald-200 font-medium">XP Sinergi</p>
              <p className="text-xl sm:text-2xl font-black text-white">{currentUser.xp}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-center min-w-[90px]">
              <p className="text-xs text-emerald-200 font-medium">Poin Referal</p>
              <p className="text-xl sm:text-2xl font-black text-amber-400">
                {currentUser.referralPoints}
              </p>
            </div>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-200 font-medium">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>
              Streak Konsistensi: <strong className="text-white">{currentUser.streak} Hari</strong>
            </span>
            <span>•</span>
            <span>
              Kode Referal: <strong className="text-amber-300 font-mono">{currentUser.referralCode}</strong>
            </span>
            <button
              onClick={handleCopyReferral}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title="Salin Kode Referal"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="w-full sm:w-64">
            <div className="flex justify-between text-[11px] mb-1 text-emerald-200">
              <span>Progres Level {currentUser.level + 1}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sub navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'directory'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Rekap Direktori Member ({allMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'leaderboard'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Peringkat Sinergi</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rewards')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'rewards'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Kupon &amp; Hadiah</span>
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

      {/* =========================================================================
          SUB-TAB 1: DIREKTORI & REKAP MEMBER AKTIF
          ========================================================================= */}
      {activeSubTab === 'directory' && (
        <div className="space-y-5">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari member, pekerjaan, no. HP, atau sosmed..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Occupation Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedOccupation}
                onChange={(e) => setSelectedOccupation(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="all">Semua Pekerjaan ({allMembers.length})</option>
                {occupationsList.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Members Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredMembers.map((member) => {
              const soc = member.socialAccounts || {};
              const connectedCount = Object.values(soc).filter(Boolean).length;

              return (
                <div
                  key={member.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Avatar, Name, Status, Level */}
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30"
                          referrerPolicy="no-referrer"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                            member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {member.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                            Lv.{member.level}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium truncate mt-0.5">
                          {member.occupation || member.role || 'Member Aktif'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {member.gender || 'Laki-Laki'} • {member.email}
                        </p>
                      </div>
                    </div>

                    {/* Phone & Contact action */}
                    {member.phoneNumber && (
                      <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300">
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

                    {/* Connected Social Media Accounts (From Registration Form) */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>Akun Sosmed Terhubung</span>
                        <span className="text-emerald-600 font-bold">{connectedCount}/11 Platform</span>
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
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Sinergi: <strong className="text-emerald-600">{member.buddySynergyScore}%</strong>
                    </span>
                    <span>
                      XP: <strong className="text-slate-800 dark:text-white">{member.xp}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: LEADERBOARD / PERINGKAT SINERGI
          ========================================================================= */}
      {activeSubTab === 'leaderboard' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Peringkat Sinergi &amp; Kontribusi Member TBK</span>
            </h2>
            <span className="text-xs text-slate-500">Diperbarui secara real-time</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {allMembers
              .sort((a, b) => b.xp - a.xp)
              .map((m, idx) => (
                <div
                  key={m.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-3 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {m.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {m.occupation || m.role || 'Member Aktif'} • Level {m.level}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {m.xp} XP
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {m.completedTasksCount} tugas selesai
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: KUPON & REWARD
          ========================================================================= */}
      {activeSubTab === 'rewards' && (
        <div className="space-y-4">
          {redeemSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold animate-in fade-in">
              {redeemSuccessMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs">
                      {item.cost} Poin
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Sisa Poin Anda: <strong>{currentUser.referralPoints}</strong>
                  </span>
                  <button
                    onClick={() => handleBuy(item)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    Tukarkan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

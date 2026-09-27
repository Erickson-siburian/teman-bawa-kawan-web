import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Download,
  ExternalLink,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  Search,
  MessageCircle,
  Share2,
  UserCheck,
  Youtube,
  Instagram,
  Video,
  MapPin,
  Copy,
  Check,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { Task, TeamMember } from '../types';
import { createGoogleCalendarUrl, downloadIcsCalendar } from '../lib/calendarExport';

interface CalendarViewProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  onSelectTask: (task: Task) => void;
  selectedMemberId?: string | null;
  onOpenBroadcastTaskModal?: (member?: TeamMember) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  teamMembers,
  currentUser,
  onSelectTask,
  selectedMemberId,
  onOpenBroadcastTaskModal,
}) => {
  const [currentDate, setCurrentDate] = useState(() => {
    // If selectedMemberId is provided, jump to that member's join date
    if (selectedMemberId) {
      const target = teamMembers.find((m) => m.id === selectedMemberId);
      if (target?.joinedAt) {
        return new Date(target.joinedAt);
      }
    }
    return new Date();
  });

  const [activeSubTab, setActiveSubTab] = useState<'members' | 'tasks'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateString, setSelectedDateString] = useState<string | null>(() => {
    if (selectedMemberId) {
      const target = teamMembers.find((m) => m.id === selectedMemberId);
      if (target?.joinedAt) {
        return new Date(target.joinedAt).toISOString().slice(0, 10);
      }
    }
    return new Date().toISOString().slice(0, 10);
  });
  const [copiedMemberId, setCopiedMemberId] = useState<string | null>(null);

  // If selectedMemberId changes externally (e.g. from notification click), update view
  useEffect(() => {
    if (selectedMemberId) {
      const target = teamMembers.find((m) => m.id === selectedMemberId);
      if (target?.joinedAt) {
        const d = new Date(target.joinedAt);
        setCurrentDate(d);
        setSelectedDateString(d.toISOString().slice(0, 10));
        setActiveSubTab('members');
      }
    }
  }, [selectedMemberId, teamMembers]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateString(now.toISOString().slice(0, 10));
  };

  // Month calculation
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  // Group members by joined date (YYYY-MM-DD)
  const membersByDate = teamMembers.reduce<Record<string, TeamMember[]>>((acc, m) => {
    const rawDate = m.joinedAt ? new Date(m.joinedAt) : new Date();
    const dStr = rawDate.toISOString().slice(0, 10);
    if (!acc[dStr]) acc[dStr] = [];
    acc[dStr].push(m);
    return acc;
  }, {});

  // Group tasks by dueDate (YYYY-MM-DD)
  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    const dStr = new Date(t.dueDate).toISOString().slice(0, 10);
    if (!acc[dStr]) acc[dStr] = [];
    acc[dStr].push(t);
    return acc;
  }, {});

  // Filter members by search
  const matchesSearchMember = (m: TeamMember) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.role && m.role.toLowerCase().includes(q)) ||
      (m.occupation && m.occupation.toLowerCase().includes(q)) ||
      (m.creatorNiche && m.creatorNiche.toLowerCase().includes(q)) ||
      (m.phoneNumber && m.phoneNumber.includes(q)) ||
      (m.socialAccounts?.instagram && m.socialAccounts.instagram.toLowerCase().includes(q)) ||
      (m.socialAccounts?.youtube && m.socialAccounts.youtube.toLowerCase().includes(q))
    );
  };

  // Build calendar matrix
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateString = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      day,
      isCurrentMonth: false,
      dateString,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      day,
      isCurrentMonth: true,
      dateString,
      isToday: new Date().toISOString().slice(0, 10) === dateString,
    });
  }

  // Next month leading days to complete 35 or 42 cells
  const remainingCells = 42 - calendarCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateString = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      day,
      isCurrentMonth: false,
      dateString,
    });
  }

  // Monthly stats
  const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const membersJoinedThisMonth = teamMembers.filter((m) => {
    const dStr = m.joinedAt ? new Date(m.joinedAt).toISOString().slice(0, 7) : '';
    return dStr === currentMonthStr;
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const membersJoinedToday = teamMembers.filter((m) => {
    const dStr = m.joinedAt ? new Date(m.joinedAt).toISOString().slice(0, 10) : '';
    return dStr === todayStr;
  });

  const broadcastTasks = tasks.filter((t) => t.assignedToAll);

  // Selected date members and tasks
  const selectedMembers = selectedDateString
    ? (membersByDate[selectedDateString] || []).filter(matchesSearchMember)
    : [];

  const selectedTasks = selectedDateString ? tasksByDate[selectedDateString] || [] : [];

  const handleCopyResume = (m: TeamMember) => {
    const text = `=== RESUME MEMBER TBK ===
Nama: ${m.name}
Role / Profesi: ${m.role} (${m.occupation || '-'})
Niche Konten: ${m.creatorNiche || '-'}
Bergabung: ${new Date(m.joinedAt || Date.now()).toLocaleDateString('id-ID', { dateStyle: 'full' })}
Kontak / WA: ${m.phoneNumber || '-'}
Instagram: ${m.socialAccounts?.instagram || '-'}
YouTube: ${m.socialAccounts?.youtube || '-'}
TikTok: ${m.socialAccounts?.tiktok || '-'}
Status Orientasi: ${m.socialFollowProof?.allCompleted ? 'Tuntas Terverifikasi' : 'Dalam Proses'}
Level & XP: Level ${m.level} (${m.xp} XP)`;

    navigator.clipboard.writeText(text);
    setCopiedMemberId(m.id);
    setTimeout(() => setCopiedMemberId(null), 2500);
  };

  const handleExportMembersCsv = () => {
    const header = 'Nama,Email,No HP,Role,Profesi,Niche,Platform,Tanggal Bergabung,Status Orientasi,XP\n';
    const rows = teamMembers
      .map((m) =>
        [
          `"${m.name}"`,
          `"${m.email}"`,
          `"${m.phoneNumber || ''}"`,
          `"${m.role}"`,
          `"${m.occupation || ''}"`,
          `"${m.creatorNiche || ''}"`,
          `"${m.primaryPlatform || ''}"`,
          `"${m.joinedAt || ''}"`,
          `"${m.socialFollowProof?.allCompleted ? 'Terverifikasi' : 'Dalam Proses'}"`,
          m.xp,
        ].join(',')
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap-member-tbk-${monthNames[month]}-${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20">
              <CalendarIcon className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase tracking-wide">
                  Resume Member Baru Sesuai Tanggal
                </span>
                <span className="text-xs text-slate-400">Kalender Editorial TBK</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {monthNames[month]} {year}
              </h2>
              <p className="text-xs text-slate-500">
                Riwayat &amp; resume anggota baru yang join atau bergabung ke Komunitas TBK sesuai tanggal pendaftaran
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Member</p>
              <p className="text-base sm:text-lg font-black text-slate-800">{teamMembers.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <p className="text-[10px] font-bold text-amber-700 uppercase">Bulan Ini</p>
              <p className="text-base sm:text-lg font-black text-amber-900">{membersJoinedThisMonth.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <p className="text-[10px] font-bold text-emerald-700 uppercase">Hari Ini</p>
              <p className="text-base sm:text-lg font-black text-emerald-900">{membersJoinedToday.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
              <p className="text-[10px] font-bold text-indigo-700 uppercase">Tugas Komunitas</p>
              <p className="text-base sm:text-lg font-black text-indigo-900">{broadcastTasks.length}</p>
            </div>
          </div>
        </div>

        {/* Action Controls & Sub-Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Sub-Tab Switch */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('members')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'members'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-500" />
              <span>Resume Member Baru ({teamMembers.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('tasks')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'tasks'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Jadwal Tugas Konten ({tasks.length})</span>
            </button>
          </div>

          {/* Search Member / Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[190px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari member / sosmed..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            {onOpenBroadcastTaskModal && (
              <button
                onClick={() => onOpenBroadcastTaskModal(currentUser)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs transition-all hover:scale-[1.02]"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>+ Beri Tugas ke Semua Member</span>
              </button>
            )}

            <button
              onClick={handleExportMembersCsv}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              title="Unduh rekap data member (.csv)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Unduh Rekap</span>
            </button>

            {/* Month Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={prevMonth}
                className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-amber-700"
              >
                Hari Ini
              </button>
              <button
                onClick={nextMonth}
                className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
                title="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/90 text-center text-xs font-black text-slate-600 py-3">
          <span className="text-rose-600">Minggu</span>
          <span>Senin</span>
          <span>Selasa</span>
          <span>Rabu</span>
          <span>Kamis</span>
          <span>Jumat</span>
          <span>Sabtu</span>
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {calendarCells.map((cell, idx) => {
            const dayMembers = (membersByDate[cell.dateString] || []).filter(matchesSearchMember);
            const dayTasks = tasksByDate[cell.dateString] || [];
            const isSelected = selectedDateString === cell.dateString;
            const hasJoinedMembers = dayMembers.length > 0;
            const hasTasks = dayTasks.length > 0;

            return (
              <div
                key={idx}
                onClick={() => setSelectedDateString(cell.dateString)}
                className={`min-h-[120px] p-2 flex flex-col justify-between transition-all cursor-pointer relative ${
                  cell.isCurrentMonth
                    ? isSelected
                      ? 'bg-amber-50/60 ring-2 ring-inset ring-amber-500/80 z-10'
                      : hasJoinedMembers && activeSubTab === 'members'
                      ? 'bg-emerald-50/30 hover:bg-amber-50/30'
                      : 'bg-white hover:bg-slate-50/80'
                    : 'bg-slate-50/50 text-slate-300'
                } ${cell.isToday ? 'border-2 border-indigo-400/80 font-bold' : ''}`}
              >
                {/* Date Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
                      cell.isToday
                        ? 'bg-indigo-600 text-white'
                        : isSelected
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : cell.isCurrentMonth
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {/* Badges for New Members Joined on This Date */}
                  {activeSubTab === 'members' ? (
                    hasJoinedMembers && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-0.5">
                        <UserCheck className="w-2.5 h-2.5 text-emerald-700" />
                        {dayMembers.length} Join
                      </span>
                    )
                  ) : (
                    hasTasks && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {dayTasks.length} tugas
                      </span>
                    )
                  )}
                </div>

                {/* Day Cell Content: Members Resume Chips OR Tasks */}
                <div className="space-y-1.5 mt-1.5 flex-1">
                  {activeSubTab === 'members' ? (
                    hasJoinedMembers ? (
                      dayMembers.slice(0, 2).map((m) => {
                        const hasBroadcastTask = tasks.some(
                          (t) => t.creatorId === m.id && t.assignedToAll
                        );
                        return (
                          <div
                            key={m.id}
                            className={`p-1.5 rounded-xl text-[10px] font-semibold border flex items-center gap-1.5 transition-all shadow-2xs ${
                              isSelected
                                ? 'bg-amber-100 border-amber-300 text-amber-950'
                                : 'bg-white hover:bg-amber-50 border-slate-200 text-slate-800'
                            }`}
                            title={`Member Baru: ${m.name} (${m.role})`}
                          >
                            <img
                              src={m.avatar}
                              alt={m.name}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-400 shrink-0"
                            />
                            <div className="min-w-0 flex-1 truncate">
                              <p className="truncate font-bold leading-tight">{m.name.split(' ')[0]}</p>
                              <p className="truncate text-[9px] text-slate-500">{m.creatorNiche || m.role}</p>
                            </div>
                            {hasBroadcastTask && (
                              <span title="Member membagikan tugas ke semua peserta">
                                <Share2 className="w-3 h-3 text-amber-600 shrink-0" />
                              </span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      cell.isCurrentMonth && (
                        <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-slate-400">Pilih tanggal</span>
                        </div>
                      )
                    )
                  ) : (
                    // Classic Task View
                    dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(t);
                        }}
                        className={`px-1.5 py-1 rounded-lg text-[10px] font-medium truncate flex items-center gap-1 shadow-2xs border ${
                          t.status === 'done'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : t.assignedToAll
                            ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        }`}
                        title={t.title}
                      >
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))
                  )}

                  {activeSubTab === 'members' && dayMembers.length > 2 && (
                    <span className="text-[9px] font-bold text-emerald-700 block text-right">
                      +{dayMembers.length - 2} member lainnya
                    </span>
                  )}

                  {activeSubTab === 'tasks' && dayTasks.length > 2 && (
                    <span className="text-[9px] text-slate-400 block text-right font-medium">
                      +{dayTasks.length - 2} tugas lainnya
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Resume & Detail Panel */}
      {selectedDateString && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-amber-200/80 shadow-lg space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950">
                <Users className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  Resume Member Baru Bergabung: {new Date(selectedDateString).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedMembers.length} member baru terdaftar pada tanggal ini
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenBroadcastTaskModal && selectedMembers.length > 0 && (
                <button
                  onClick={() => onOpenBroadcastTaskModal(selectedMembers[0])}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Beri Tugas ke Semua Peserta
                </button>
              )}
            </div>
          </div>

          {/* Members Joined on This Date */}
          {selectedMembers.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <p className="text-sm font-bold text-slate-600">
                Tidak ada member baru yang bergabung pada tanggal {new Date(selectedDateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.
              </p>
              <p className="text-xs text-slate-400">
                Klik tanggal lain yang memiliki penanda hijau atau pilih member dari daftar terkini di bawah ini.
              </p>

              {/* Quick links to dates with members */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
                <span className="text-xs text-slate-500 font-medium">Lihat tanggal dengan member baru:</span>
                {Object.keys(membersByDate)
                  .sort()
                  .reverse()
                  .slice(0, 5)
                  .map((dStr) => (
                    <button
                      key={dStr}
                      onClick={() => {
                        setSelectedDateString(dStr);
                        setCurrentDate(new Date(dStr));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
                    >
                      {new Date(dStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} ({membersByDate[dStr]?.length} member)
                    </button>
                  ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {selectedMembers.map((member) => {
                const memberBroadcastTasks = tasks.filter(
                  (t) => t.creatorId === member.id && t.assignedToAll
                );

                const rawWa = member.phoneNumber ? member.phoneNumber.replace(/[^0-9]/g, '') : '';
                const waNumber = rawWa.startsWith('0') ? '62' + rawWa.slice(1) : rawWa;
                const waLink = waNumber ? `https://wa.me/${waNumber}?text=Halo%20${encodeURIComponent(member.name)}%2C%20salam%20sinergi%20dari%20Komunitas%20TBK!` : null;

                return (
                  <div
                    key={member.id}
                    className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all space-y-4"
                  >
                    {/* Member Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-400 shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 text-base">{member.name}</h4>
                            {member.userType === 'admin' ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase">
                                Administrator
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[9px] uppercase">
                                Member Baru
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-amber-800 mt-0.5">{member.role}</p>
                          <p className="text-[11px] text-slate-500">
                            Bergabung: {new Date(member.joinedAt || Date.now()).toLocaleDateString('id-ID', { dateStyle: 'full' })}, Pukul {new Date(member.joinedAt || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyResume(member)}
                        className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        title="Salin ringkasan resume member"
                      >
                        {copiedMemberId === member.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Meta Highlights */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Profesi / Pekerjaan</span>
                        <span className="font-bold text-slate-800 truncate block">{member.occupation || member.role}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Niche Konten Medsos</span>
                        <span className="font-bold text-amber-900 truncate block">{member.creatorNiche || 'Saling Support Multiplatform'}</span>
                      </div>
                    </div>

                    {/* Social Media Accounts */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-600 block">Akun Media Sosial Member:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                        {member.socialAccounts?.instagram && (
                          <a
                            href={
                              member.socialAccounts.instagram.startsWith('http')
                                ? member.socialAccounts.instagram
                                : `https://instagram.com/${member.socialAccounts.instagram.replace('@', '')}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-pink-50 border border-pink-200 hover:bg-pink-100 text-pink-900 flex items-center justify-between gap-1 transition-colors"
                          >
                            <span className="flex items-center gap-1 truncate font-semibold text-[11px]">
                              <Instagram className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                              <span className="truncate">{member.socialAccounts.instagram}</span>
                            </span>
                            <ExternalLink className="w-3 h-3 text-pink-400 shrink-0" />
                          </a>
                        )}

                        {member.socialAccounts?.youtube && (
                          <a
                            href={
                              member.socialAccounts.youtube.startsWith('http')
                                ? member.socialAccounts.youtube
                                : `https://youtube.com/@${member.socialAccounts.youtube.replace('@', '')}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-900 flex items-center justify-between gap-1 transition-colors"
                          >
                            <span className="flex items-center gap-1 truncate font-semibold text-[11px]">
                              <Youtube className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              <span className="truncate">{member.socialAccounts.youtube}</span>
                            </span>
                            <ExternalLink className="w-3 h-3 text-red-400 shrink-0" />
                          </a>
                        )}

                        {member.socialAccounts?.tiktok && (
                          <a
                            href={
                              member.socialAccounts.tiktok.startsWith('http')
                                ? member.socialAccounts.tiktok
                                : `https://tiktok.com/@${member.socialAccounts.tiktok.replace('@', '')}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white flex items-center justify-between gap-1 transition-colors"
                          >
                            <span className="flex items-center gap-1 truncate font-semibold text-[11px]">
                              <Video className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate">{member.socialAccounts.tiktok}</span>
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                          </a>
                        )}

                        {member.socialAccounts?.googleMap && (
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-1 font-semibold text-[11px] truncate">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{member.socialAccounts.googleMap}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Orientation Verification Status */}
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck
                          className={`w-4 h-4 ${
                            member.socialFollowProof?.allCompleted ? 'text-emerald-600' : 'text-amber-500'
                          }`}
                        />
                        <span className="font-semibold text-slate-800">
                          {member.socialFollowProof?.allCompleted
                            ? 'Misi Orientasi: Terverifikasi Tuntas (> 2 Menit YouTube)'
                            : 'Misi Orientasi: Dalam Proses Sinergi'}
                        </span>
                      </div>
                      <span className="font-bold text-amber-700">{member.xp} XP</span>
                    </div>

                    {/* Community Tasks Broadcasted by this Member */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <Share2 className="w-3.5 h-3.5 text-amber-600" />
                          Tugas Saling Support yang Diberikan Member Ini:
                        </span>
                        {onOpenBroadcastTaskModal && (
                          <button
                            onClick={() => onOpenBroadcastTaskModal(member)}
                            className="text-[10px] font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-0.5"
                          >
                            + Beri Tugas Baru
                          </button>
                        )}
                      </div>

                      {memberBroadcastTasks.length === 0 ? (
                        <div className="p-3 rounded-xl bg-amber-50/50 border border-dashed border-amber-200 text-center">
                          <p className="text-[11px] text-amber-900 font-medium">
                            Member ini belum membagikan tugas ke seluruh peserta.
                          </p>
                          {onOpenBroadcastTaskModal && (
                            <button
                              onClick={() => onOpenBroadcastTaskModal(member)}
                              className="mt-1 text-xs font-bold text-amber-800 hover:underline inline-flex items-center gap-1"
                            >
                              Buat Tugas Saling Support Atas Nama {member.name.split(' ')[0]} Sekarang
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {memberBroadcastTasks.map((task) => (
                            <div
                              key={task.id}
                              onClick={() => onSelectTask(task)}
                              className="p-2.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 cursor-pointer shadow-2xs flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-900 truncate">{task.title}</p>
                                <p className="text-[10px] text-slate-500">
                                  {task.completedByMemberIds?.length || 0} / {teamMembers.length} peserta telah menyelesaikan
                                </p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold shrink-0">
                                Seluruh Peserta
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Chat WhatsApp
                        </a>
                      )}
                      {onOpenBroadcastTaskModal && (
                        <button
                          onClick={() => onOpenBroadcastTaskModal(member)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Beri Tugas ke Seluruh Peserta
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

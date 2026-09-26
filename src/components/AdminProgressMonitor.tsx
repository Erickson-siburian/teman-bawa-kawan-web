import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Search,
  Check,
  X,
  ExternalLink,
  Filter,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  Settings,
  Trash2,
  Save,
  Radio,
  Youtube,
  Instagram,
  HelpCircle,
  Share2,
  Copy,
  Info,
} from 'lucide-react';
import { Task, TeamMember, TaskStatus, MemberSocialAccounts } from '../types';

interface AdminProgressMonitorProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  onSelectTask?: (task: Task) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: TaskStatus) => void;
  onOpenNewTaskModal?: () => void;
  onUpdateAdminOfficialSosmed?: (socials: MemberSocialAccounts, createMandatoryTask: boolean) => Promise<void> | void;
  onOpenAdminSocialsModal?: () => void;
  onVerifyMember?: (memberId: string) => Promise<void> | void;
  onDeleteTask?: (taskId: string) => void;
}

export const AdminProgressMonitor: React.FC<AdminProgressMonitorProps> = ({
  tasks,
  teamMembers,
  currentUser,
  onSelectTask,
  onUpdateTaskStatus,
  onOpenNewTaskModal,
  onUpdateAdminOfficialSosmed,
  onOpenAdminSocialsModal,
  onVerifyMember,
  onDeleteTask,
}) => {
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'new_members' | 'social_verified' | 'social_pending' | 'completed' | 'in_progress' | 'unassigned'
  >('all');
  const [searchMember, setSearchMember] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [verifyingMemberId, setVerifyingMemberId] = useState<string | null>(null);
  const [showAdminGuideModal, setShowAdminGuideModal] = useState(false);
  const [showShareDistinctionModal, setShowShareDistinctionModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');

  // Official Admin Sosmed settings state
  const [showSosmedSettings, setShowSosmedSettings] = useState(false);
  const [officialYoutube, setOfficialYoutube] = useState(currentUser.socialAccounts?.youtube || '');
  const [officialInstagram, setOfficialInstagram] = useState(currentUser.socialAccounts?.instagram || '');
  const [officialTiktok, setOfficialTiktok] = useState(currentUser.socialAccounts?.tiktok || '');
  const [officialFacebook, setOfficialFacebook] = useState(currentUser.socialAccounts?.facebook || '');
  const [sosmedSavedMessage, setSosmedSavedMessage] = useState('');

  // Keep state in sync with currentUser.socialAccounts
  useEffect(() => {
    if (currentUser.socialAccounts) {
      setOfficialYoutube(currentUser.socialAccounts.youtube || '');
      setOfficialInstagram(currentUser.socialAccounts.instagram || '');
      setOfficialTiktok(currentUser.socialAccounts.tiktok || '');
      setOfficialFacebook(currentUser.socialAccounts.facebook || '');
    }
  }, [currentUser.socialAccounts]);

  // Check if mandatory onboarding task exists
  const mandatoryTask = useMemo(() => {
    return tasks.find((t) => t.isOfficialMandatory || t.tags?.includes('WajibAdmin'));
  }, [tasks]);

  // Helper: check if a member is newly registered
  const isMemberNew = (member: TeamMember) => {
    if (member.userType === 'admin') return false;
    if (member.id.startsWith('member-')) return true;
    if (!member.joinedAt) return true;
    const diffDays = (Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7 || (member.level === 1 && member.completedTasksCount === 0);
  };

  const newMembersCount = teamMembers.filter(isMemberNew).length;

  // Overall Task Aggregates
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const reviewTasks = tasks.filter((t) => t.status === 'review').length;
  const overallCompletionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Member Task Stats: Map every active member to their tasks and completion state
  const memberProgressList = useMemo(() => {
    return teamMembers.map((member) => {
      // Tasks assigned to this member or where this member is a buddy
      const assignedTasks = tasks.filter(
        (t) => t.assigneeId === member.id || t.buddyId === member.id
      );

      const doneTasks = assignedTasks.filter((t) => t.status === 'done');
      const ongoingTasks = assignedTasks.filter(
        (t) => t.status === 'in_progress' || t.status === 'todo' || t.status === 'review'
      );

      const total = assignedTasks.length;
      const done = doneTasks.length;
      const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;

      // Status classification
      let stateLabel: 'completed_all' | 'in_progress' | 'no_tasks' = 'no_tasks';
      if (total > 0) {
        if (done === total) {
          stateLabel = 'completed_all';
        } else {
          stateLabel = 'in_progress';
        }
      }

      const isNew = isMemberNew(member);

      const mandatoryOrientationTask = assignedTasks.find(
        (t) => t.isOfficialMandatory || t.tags?.includes('WajibAdmin')
      );
      const ytSubtask = mandatoryOrientationTask?.subtasks.find((s) => s.title.toLowerCase().includes('youtube'));
      const igSubtask = mandatoryOrientationTask?.subtasks.find((s) => s.title.toLowerCase().includes('instagram'));
      const ttSubtask = mandatoryOrientationTask?.subtasks.find((s) => s.title.toLowerCase().includes('tiktok'));
      const verifComment = mandatoryOrientationTask?.comments.find((c) => c.text.includes('[Konfirmasi Orientasi Member]'));

      const ytDone = ytSubtask?.completed || false;
      const igDone = igSubtask?.completed || false;
      const ttDone = ttSubtask?.completed || false;

      return {
        member,
        total,
        done,
        ongoing: ongoingTasks.length,
        progressPercent,
        stateLabel,
        isNew,
        mandatoryOrientationTask,
        ytDone,
        igDone,
        ttDone,
        verifComment,
        assignedTasks,
        doneTasks,
        ongoingTasks,
      };
    });
  }, [teamMembers, tasks]);

  // Summary Counters of Members
  const membersWithCompletedTasks = memberProgressList.filter(
    (m) => m.stateLabel === 'completed_all'
  ).length;

  const membersInProgress = memberProgressList.filter(
    (m) => m.stateLabel === 'in_progress'
  ).length;

  const membersWithoutTasks = memberProgressList.filter(
    (m) => m.stateLabel === 'no_tasks'
  ).length;

  const socialVerifiedCount = memberProgressList.filter(
    (m) =>
      (m.member.socialFollowProof?.youtubeWatchedSeconds || 0) >= 120 ||
      m.member.socialFollowProof?.allCompleted === true ||
      m.stateLabel === 'completed_all'
  ).length;

  const socialPendingCount = memberProgressList.filter(
    (m) =>
      m.member.userType !== 'admin' &&
      (m.member.socialFollowProof?.youtubeWatchedSeconds || 0) < 120 &&
      m.stateLabel !== 'completed_all'
  ).length;

  // Filtered members by search query and category
  const filteredMemberStats = useMemo(() => {
    return memberProgressList.filter((item) => {
      const matchesSearch =
        item.member.name.toLowerCase().includes(searchMember.toLowerCase()) ||
        item.member.email.toLowerCase().includes(searchMember.toLowerCase()) ||
        (item.member.phoneNumber && item.member.phoneNumber.includes(searchMember)) ||
        (item.member.occupation && item.member.occupation.toLowerCase().includes(searchMember.toLowerCase()));

      let matchesCategory = true;
      if (filterStatus === 'new_members') {
        matchesCategory = item.isNew;
      } else if (filterStatus === 'social_verified') {
        matchesCategory =
          (item.member.socialFollowProof?.youtubeWatchedSeconds || 0) >= 120 ||
          item.member.socialFollowProof?.allCompleted === true ||
          item.stateLabel === 'completed_all';
      } else if (filterStatus === 'social_pending') {
        matchesCategory =
          item.member.userType !== 'admin' &&
          (item.member.socialFollowProof?.youtubeWatchedSeconds || 0) < 120 &&
          item.stateLabel !== 'completed_all';
      } else if (filterStatus === 'completed') {
        matchesCategory = item.stateLabel === 'completed_all';
      } else if (filterStatus === 'in_progress') {
        matchesCategory = item.stateLabel === 'in_progress';
      } else if (filterStatus === 'unassigned') {
        matchesCategory = item.stateLabel === 'no_tasks';
      }

      return matchesSearch && matchesCategory;
    });
  }, [memberProgressList, searchMember, filterStatus]);

  // Currently focused member details (for drawer or modal)
  const activeSelectedMemberStat = memberProgressList.find(
    (m) => m.member.id === selectedMemberId
  );

  return (
    <div className="space-y-6">
      {/* Admin Monitoring Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wide">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>PANEL KHUSUS ADMINISTRATOR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Monitoring Progres &amp; Tugas Member Aktif
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              Pantau seluruh progres gotong royong anggota secara terpusat: siapa saja member yang sudah tuntas menyelesaikan tugas, siapa yang sedang berjalan, dan siapa yang belum mengambil tugas.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenAdminSocialsModal && (
              <button
                type="button"
                onClick={onOpenAdminSocialsModal}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                title="Buka dialog pengaturan link YouTube, IG, TikTok resmi yang wajib difollow member baru"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Atur Link Medsos Wajib Member</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAdminGuideModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-bold text-xs sm:text-sm border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5"
              title="Lihat petunjuk cara admin menambahkan akun medsos ke website ini"
            >
              <HelpCircle className="w-4 h-4 text-emerald-300" />
              <span>Petunjuk Medsos Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setShowShareDistinctionModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 font-bold text-xs sm:text-sm border border-indigo-400/40 transition-all cursor-pointer flex items-center gap-1.5"
              title="Pelajari cara membedakan website admin dan website yang dishare ke orang lain"
            >
              <Share2 className="w-4 h-4 text-indigo-300" />
              <span>Bedakan Web Admin vs Share Link</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSosmedSettings(!showSosmedSettings)}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Settings className="w-4 h-4 text-amber-300" />
              <span>{showSosmedSettings ? 'Tutup Panel Medsos' : 'Form Medsos Admin'}</span>
            </button>

            {onOpenNewTaskModal && (
              <button
                type="button"
                onClick={onOpenNewTaskModal}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>+ Buat &amp; Tugaskan Konten</span>
              </button>
            )}
          </div>
        </div>

        {/* Aggregate Progress Bar & Member Counters */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Total Members */}
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15">
            <p className="text-xs text-amber-200 font-bold flex items-center justify-between">
              <span>Total Member</span>
              {newMembersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black animate-pulse">
                  +{newMembersCount} Baru
                </span>
              )}
            </p>
            <p className="text-2xl font-black text-white mt-0.5">{teamMembers.length} Anggota</p>
            <p className="text-[10px] text-amber-100/80 mt-1">
              {newMembersCount} member baru dalam antrean
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-xs text-emerald-200 font-medium">Member Tuntas (100%)</p>
            <p className="text-2xl font-black text-emerald-300 mt-0.5">{membersWithCompletedTasks} Member</p>
            <p className="text-[10px] text-emerald-200/70 mt-1">
              Seluruh tugas orientasi &amp; konten selesai
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-xs text-amber-200 font-medium">Sedang Berproses</p>
            <p className="text-2xl font-black text-amber-300 mt-0.5">{membersInProgress} Member</p>
            <p className="text-[10px] text-amber-200/70 mt-1">
              Orientasi sosmed atau tugas aktif
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-xs text-slate-300 font-medium">Belum Ada Tugas</p>
            <p className="text-2xl font-black text-slate-200 mt-0.5">{membersWithoutTasks} Member</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Siap untuk didelegasikan
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-xs text-indigo-200 font-medium">Tugas Komunitas</p>
            <p className="text-2xl font-black text-white mt-0.5">{totalTasks} Tugas</p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallCompletionPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-emerald-300 font-semibold mt-1">
              {overallCompletionPercentage}% tugas terselesaikan
            </p>
          </div>
        </div>
      </div>

      {/* Official Admin Social Media & Mandatory Task Settings Card */}
      {showSosmedSettings && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-md animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] uppercase tracking-wide">
                  Official Admin TBK
                </span>
                <h2 className="text-lg font-black text-slate-900">
                  Pengaturan Media Sosial Resmi Admin &amp; Tugas Orientasi Member
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tentukan akun media sosial resmi Admin (YouTube, Instagram, TikTok) yang wajib di-subscribe/follow oleh member baru.
              </p>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              {mandatoryTask ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Tugas Wajib: AKTIF
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Tugas Wajib: NONAKTIF (Member Bebas)
                </span>
              )}
            </div>
          </div>

          {sosmedSavedMessage && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{sosmedSavedMessage}</span>
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* YouTube */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="text-red-600 font-bold">▶ YouTube Official Admin</span>
              </label>
              <input
                type="text"
                value={officialYoutube}
                onChange={(e) => setOfficialYoutube(e.target.value)}
                placeholder="Contoh: https://youtube.com/@namaChannelAnda"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 bg-slate-50/50"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Tautan channel resmi yang akan dibuka oleh anggota baru saat menekan tombol tonton/subscribe.
              </p>
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="text-pink-600 font-bold">📷 Instagram Official Admin</span>
              </label>
              <input
                type="text"
                value={officialInstagram}
                onChange={(e) => setOfficialInstagram(e.target.value)}
                placeholder="Contoh: @akun_resmi_admin"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 bg-slate-50/50"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Username IG resmi admin untuk disinergikan &amp; di-follow oleh anggota komunitas.
              </p>
            </div>

            {/* TikTok */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="text-slate-900 font-bold">♪ TikTok Official Admin</span>
              </label>
              <input
                type="text"
                value={officialTiktok}
                onChange={(e) => setOfficialTiktok(e.target.value)}
                placeholder="Contoh: @akun_tiktok_admin"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 bg-slate-50/50"
              />
            </div>

            {/* Facebook / Media Lain */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="text-blue-600 font-bold">f Facebook / Media Lain</span>
              </label>
              <input
                type="text"
                value={officialFacebook}
                onChange={(e) => setOfficialFacebook(e.target.value)}
                placeholder="Contoh: Nama Fanspage / Akun FB"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const newSocials: MemberSocialAccounts = {
                    ...currentUser.socialAccounts,
                    youtube: officialYoutube.trim(),
                    instagram: officialInstagram.trim(),
                    tiktok: officialTiktok.trim(),
                    facebook: officialFacebook.trim(),
                  };
                  if (onUpdateAdminOfficialSosmed) {
                    onUpdateAdminOfficialSosmed(newSocials, true);
                    setSosmedSavedMessage('Akun resmi disimpan & Tugas Orientasi Wajib Member Baru berhasil diaktifkan!');
                    setTimeout(() => setSosmedSavedMessage(''), 4000);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan &amp; Aktifkan Tugas Wajib Member</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newSocials: MemberSocialAccounts = {
                    ...currentUser.socialAccounts,
                    youtube: officialYoutube.trim(),
                    instagram: officialInstagram.trim(),
                    tiktok: officialTiktok.trim(),
                    facebook: officialFacebook.trim(),
                  };
                  if (onUpdateAdminOfficialSosmed) {
                    onUpdateAdminOfficialSosmed(newSocials, false);
                    setSosmedSavedMessage('Akun resmi Admin berhasil disimpan (tanpa membuat tugas wajib).');
                    setTimeout(() => setSosmedSavedMessage(''), 4000);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                <span>Simpan Akun Saja</span>
              </button>
            </div>

            {mandatoryTask && onDeleteTask && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin menonaktifkan dan menghapus tugas follow sosmed admin bagi member baru?')) {
                    onDeleteTask(mandatoryTask.id);
                    setSosmedSavedMessage('Tugas wajib follow sosmed admin telah dinonaktifkan.');
                    setTimeout(() => setSosmedSavedMessage(''), 4000);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Nonaktifkan / Hapus Tugas Wajib Ini</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Semua Member ({memberProgressList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('new_members')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'new_members'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Member Baru ({newMembersCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('completed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sudah Selesai ({membersWithCompletedTasks})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('in_progress')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'in_progress'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Sedang Berjalan ({membersInProgress})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('social_verified')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'social_verified'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Youtube className="w-3.5 h-3.5 text-red-600" />
              <span>YT &amp; Medsos Valid ({socialVerifiedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('social_pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'social_pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Medsos Belum Lengkap ({socialPendingCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('unassigned')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'unassigned'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Belum Ada Tugas ({membersWithoutTasks})</span>
            </button>
          </div>

          {/* Search Member */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              placeholder="Cari nama member, email, no hp..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Members Monitoring Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Member Aktif</th>
                <th className="py-3.5 px-4">Validasi Medsos &amp; YT (&gt; 2 Menit)</th>
                <th className="py-3.5 px-4">Status Progres Tugas</th>
                <th className="py-3.5 px-4 text-center">Tuntas / Total</th>
                <th className="py-3.5 px-4">Persentase</th>
                <th className="py-3.5 px-4">Tugas Terbaru</th>
                <th className="py-3.5 px-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMemberStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada member yang cocok dengan filter atau kata kunci pencarian.
                  </td>
                </tr>
              ) : (
                filteredMemberStats.map((item) => {
                  const m = item.member;
                  const isFinished = item.stateLabel === 'completed_all';
                  const isProcessing = item.stateLabel === 'in_progress';
                  const isUnassigned = item.stateLabel === 'no_tasks';
                  const ytSecs = m.socialFollowProof?.youtubeWatchedSeconds ?? 0;
                  const isYtValid = ytSecs >= 120 || isFinished;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-slate-900 truncate">{m.name}</p>
                              {m.userType === 'admin' ? (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black border border-amber-300">
                                  ADMIN
                                </span>
                              ) : item.isNew ? (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black border border-emerald-300 flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>MEMBER BARU</span>
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono truncate">{m.email}</p>
                            {m.phoneNumber && (
                              <p className="text-[10px] text-emerald-700 font-mono truncate">
                                📞 {m.phoneNumber}
                              </p>
                            )}

                            {/* Registered Social Media Handles */}
                            {m.socialAccounts && (
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                {m.socialAccounts.instagram && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 font-medium border border-pink-200">
                                    IG: {m.socialAccounts.instagram}
                                  </span>
                                )}
                                {m.socialAccounts.youtube && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-medium border border-red-200">
                                    YT: {m.socialAccounts.youtube}
                                  </span>
                                )}
                                {m.socialAccounts.tiktok && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-medium border border-slate-200">
                                    TT: {m.socialAccounts.tiktok}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Validasi Medsos & Watch Time YouTube (> 2 Menit) */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5 min-w-[170px]">
                          {/* YouTube Algorithm & Watch Time Badge */}
                          {m.userType === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-bold border border-amber-200">
                              <span>👑 Akun Admin</span>
                            </span>
                          ) : isYtValid ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-300">
                              <Youtube className="w-3 h-3 text-red-600 shrink-0" />
                              <span>
                                {ytSecs > 0
                                  ? `Tuntas ${Math.floor(ytSecs / 60)}m ${ytSecs % 60}s (>2m Valid)`
                                  : 'Tuntas Terverifikasi (>2m)'}
                              </span>
                            </span>
                          ) : ytSecs > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Nonton {Math.floor(ytSecs / 60)}m {ytSecs % 60}s (Kurang dari 2m)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                              <Youtube className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Belum Menonton 2 Menit</span>
                            </span>
                          )}

                          {/* Instagram & TikTok Follow Status */}
                          <div className="flex items-center gap-1.5 text-[9px]">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold border ${
                                m.socialFollowProof?.instagramFollowed || isFinished || m.userType === 'admin'
                                  ? 'bg-pink-100 text-pink-800 border-pink-300'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {m.socialFollowProof?.instagramFollowed || isFinished || m.userType === 'admin'
                                ? '✓ IG Follow'
                                : '✕ IG Belum'}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold border ${
                                m.socialFollowProof?.tiktokFollowed || isFinished || m.userType === 'admin'
                                  ? 'bg-slate-900 text-white border-slate-800'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {m.socialFollowProof?.tiktokFollowed || isFinished || m.userType === 'admin'
                                ? '✓ TikTok'
                                : '✕ TikTok'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isFinished && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Sudah Selesai Semua</span>
                          </span>
                        )}
                        {isProcessing && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                              <span>Sedang Berjalan ({item.ongoing})</span>
                            </span>
                            {item.assignedTasks.some((t) => t.isOfficialMandatory) && (
                              <span className="text-[10px] text-amber-800 font-bold block flex items-center gap-1">
                                <span>📌 Wajib Sosmed Admin</span>
                              </span>
                            )}
                          </div>
                        )}
                        {isUnassigned && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                            <span>Belum Ada Tugas</span>
                          </span>
                        )}
                      </td>

                      {/* Completed / Total Count */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span className="text-emerald-600">{item.done}</span>
                        <span className="text-slate-400"> / </span>
                        <span className="text-slate-800">{item.total}</span>
                      </td>

                      {/* Percentage Bar */}
                      <td className="py-3.5 px-4 min-w-[130px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-600">{item.progressPercent}%</span>
                            <span className="text-slate-400 font-normal">
                              {item.total > 0 ? `${item.done} dari ${item.total}` : 'N/A'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isFinished
                                  ? 'bg-emerald-500'
                                  : isProcessing
                                  ? 'bg-amber-400'
                                  : 'bg-slate-300'
                              }`}
                              style={{ width: `${Math.max(item.total > 0 ? 8 : 0, item.progressPercent)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Latest Task Overview */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {item.assignedTasks.length > 0 ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-800 truncate" title={item.assignedTasks[0].title}>
                              {item.assignedTasks[0].title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                                item.assignedTasks[0].status === 'done'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}>
                                {item.assignedTasks[0].status === 'done' ? 'Tuntas' : 'Berjalan'}
                              </span>
                              {item.assignedTasks[0].mediaLink && (
                                <a
                                  href={item.assignedTasks[0].mediaLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:underline flex items-center gap-0.5"
                                >
                                  <span>Link Medsos</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum menerima penugasan</span>
                        )}
                      </td>

                      {/* Admin Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {onVerifyMember && item.ongoing > 0 && (
                            <button
                              type="button"
                              disabled={verifyingMemberId === m.id}
                              onClick={async () => {
                                setVerifyingMemberId(m.id);
                                try {
                                  await onVerifyMember(m.id);
                                } finally {
                                  setVerifyingMemberId(null);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                              title="Verifikasi bahwa member ini sudah follow/subscribe akun sosmed Admin"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{verifyingMemberId === m.id ? 'Memproses...' : 'Verifikasi Tuntas'}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedMemberId(m.id)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Lihat Detail →
                          </button>
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

      {/* Member Tasks Detail Modal */}
      {activeSelectedMemberStat && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={activeSelectedMemberStat.member.avatar}
                  alt={activeSelectedMemberStat.member.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-slate-900">
                      {activeSelectedMemberStat.member.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      {activeSelectedMemberStat.member.userType === 'admin' ? 'Admin' : 'Member'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {activeSelectedMemberStat.member.email} • {activeSelectedMemberStat.member.phoneNumber || 'No HP belum diisi'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMemberId(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Stats */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500">Total Tugas</span>
                <p className="text-lg font-black text-slate-900">{activeSelectedMemberStat.total}</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-[11px] text-emerald-700 font-semibold">Tuntas (Selesai)</span>
                <p className="text-lg font-black text-emerald-700">{activeSelectedMemberStat.done}</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-[11px] text-amber-700 font-semibold">Sedang Berjalan</span>
                <p className="text-lg font-black text-amber-700">{activeSelectedMemberStat.ongoing}</p>
              </div>
            </div>

            {/* Bukti Verifikasi Orientasi Medsos (YouTube Watch Time & Follow) */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white mb-4 space-y-3 shadow-md border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500" />
                  <span className="text-xs sm:text-sm font-black text-white">
                    Bukti Validasi Tontonan YouTube &amp; Sinergi Medsos:
                  </span>
                </div>
                {activeSelectedMemberStat.member.socialFollowProof?.youtubeWatchedSeconds &&
                activeSelectedMemberStat.member.socialFollowProof.youtubeWatchedSeconds >= 120 ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                    ✅ Memenuhi Syarat Algoritma YT (&gt; 2 Menit)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
                    ⏳ Dalam Pemantauan
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* Watch Duration Card */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Waktu Menonton Video YT</span>
                  <p className="text-sm font-mono font-black text-white">
                    {activeSelectedMemberStat.member.socialFollowProof?.youtubeWatchedSeconds
                      ? `${Math.floor(activeSelectedMemberStat.member.socialFollowProof.youtubeWatchedSeconds / 60)}m ${activeSelectedMemberStat.member.socialFollowProof.youtubeWatchedSeconds % 60}s`
                      : activeSelectedMemberStat.stateLabel === 'completed_all'
                      ? 'Tuntas Terverifikasi'
                      : '0 Menit (Belum Ditonton)'}
                  </p>
                  <p className="text-[9px] text-slate-400">
                    Syarat subscriber YouTube valid: &gt; 120 detik (2 menit).
                  </p>
                </div>

                {/* Status Follow Instagram */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Follow Akun Instagram</span>
                  <p className="text-sm font-black text-pink-400">
                    {activeSelectedMemberStat.member.socialFollowProof?.instagramFollowed ||
                    activeSelectedMemberStat.stateLabel === 'completed_all'
                      ? '✅ Sudah Follow'
                      : '❌ Belum Konfirmasi'}
                  </p>
                  <p className="text-[9px] text-slate-400">
                    Akun: {activeSelectedMemberStat.member.socialAccounts?.instagram || 'Belum diisi'}
                  </p>
                </div>

                {/* Status Follow TikTok */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Follow Akun TikTok</span>
                  <p className="text-sm font-black text-indigo-300">
                    {activeSelectedMemberStat.member.socialFollowProof?.tiktokFollowed ||
                    activeSelectedMemberStat.stateLabel === 'completed_all'
                      ? '✅ Sudah Follow'
                      : '❌ Belum Konfirmasi'}
                  </p>
                  <p className="text-[9px] text-slate-400">
                    Akun: {activeSelectedMemberStat.member.socialAccounts?.tiktok || 'Belum diisi'}
                  </p>
                </div>
              </div>

              {onVerifyMember && activeSelectedMemberStat.ongoing > 0 && (
                <div className="pt-1 flex items-center justify-between gap-3 border-t border-white/10">
                  <span className="text-[11px] text-slate-300">
                    Ingin langsung mengonfirmasi &amp; memberi lencana verifikasi ke member ini?
                  </span>
                  <button
                    type="button"
                    disabled={verifyingMemberId === activeSelectedMemberStat.member.id}
                    onClick={async () => {
                      setVerifyingMemberId(activeSelectedMemberStat.member.id);
                      try {
                        await onVerifyMember(activeSelectedMemberStat.member.id);
                      } finally {
                        setVerifyingMemberId(null);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {verifyingMemberId === activeSelectedMemberStat.member.id ? 'Menyimpan...' : 'Verifikasi Cepat Sekarang'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Member's Registered Social Accounts Box */}
            {activeSelectedMemberStat.member.socialAccounts && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 mb-4 space-y-2">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Akun Media Sosial Member yang Didaftarkan:</span>
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {activeSelectedMemberStat.member.socialAccounts.instagram && (
                    <a
                      href={activeSelectedMemberStat.member.socialAccounts.instagram.startsWith('http')
                        ? activeSelectedMemberStat.member.socialAccounts.instagram
                        : `https://instagram.com/${activeSelectedMemberStat.member.socialAccounts.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-pink-100 text-pink-800 font-medium hover:bg-pink-200 flex items-center gap-1 cursor-pointer"
                    >
                      <span>📷 IG: {activeSelectedMemberStat.member.socialAccounts.instagram}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {activeSelectedMemberStat.member.socialAccounts.youtube && (
                    <a
                      href={activeSelectedMemberStat.member.socialAccounts.youtube.startsWith('http')
                        ? activeSelectedMemberStat.member.socialAccounts.youtube
                        : `https://youtube.com/@${activeSelectedMemberStat.member.socialAccounts.youtube}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-medium hover:bg-red-200 flex items-center gap-1 cursor-pointer"
                    >
                      <span>▶ YT: {activeSelectedMemberStat.member.socialAccounts.youtube}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {activeSelectedMemberStat.member.socialAccounts.tiktok && (
                    <a
                      href={activeSelectedMemberStat.member.socialAccounts.tiktok.startsWith('http')
                        ? activeSelectedMemberStat.member.socialAccounts.tiktok
                        : `https://tiktok.com/@${activeSelectedMemberStat.member.socialAccounts.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-medium hover:bg-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>♪ TT: {activeSelectedMemberStat.member.socialAccounts.tiktok}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {activeSelectedMemberStat.member.phoneNumber && (
                    <a
                      href={`https://wa.me/${activeSelectedMemberStat.member.phoneNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-medium hover:bg-emerald-200 flex items-center gap-1 cursor-pointer"
                    >
                      <span>💬 WhatsApp: {activeSelectedMemberStat.member.phoneNumber}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* List of Tasks */}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Daftar Tugas yang Ditugaskan:
              </h4>

              {activeSelectedMemberStat.assignedTasks.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Member ini belum menerima penugasan.
                </div>
              ) : (
                activeSelectedMemberStat.assignedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          task.status === 'done'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {task.status === 'done' ? 'Selesai' : 'Sedang Berjalan'}
                        </span>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {task.title}
                        </h5>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>

                      {task.mediaLink && (
                        <div className="pt-1 flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                          <span>Tautan:</span>
                          <a
                            href={task.mediaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline flex items-center gap-0.5 truncate max-w-sm"
                          >
                            <span>{task.mediaLink}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Quick Status Toggle for Admin */}
                    {onUpdateTaskStatus && (
                      <div className="flex items-center gap-2 shrink-0">
                        {task.status !== 'done' ? (
                          <button
                            type="button"
                            onClick={() => onUpdateTaskStatus(task.id, 'done')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Tandai Selesai</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onUpdateTaskStatus(task.id, 'in_progress')}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Ubah ke Proses
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMemberId(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Petunjuk Admin Menambahkan Akun Medsos */}
      {showAdminGuideModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    PANDUAN LENGKAP ADMIN
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Cara Menambahkan Akun Media Sosial Resmi Admin
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminGuideModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-black text-slate-900">Buka Menu Pengaturan Medsos</p>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Klik tombol <strong>&quot;Atur Link Medsos Wajib Member&quot;</strong> warna kuning di bagian atas halaman monitor ini, atau klik tombol <strong>&quot;Form Medsos Admin&quot;</strong>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-black text-slate-900">Masukkan Link atau Username Akun Anda</p>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Isi tautan resmi Anda:
                    <br />• <strong>YouTube:</strong> Masukkan link video atau channel Anda (contoh: <code>https://youtube.com/@adrian_andrew.id</code> atau <code>@adrian_andrew.id</code>).
                    <br />• <strong>Instagram:</strong> Masukkan handle akun Anda (contoh: <code>@adrian_andrew.id</code>).
                    <br />• <strong>TikTok:</strong> Masukkan username TikTok resmi (contoh: <code>@adrianandrew_tiktok</code>).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-black text-slate-900">Uji Tautan Sebelum Menyimpan</p>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Klik tombol <strong>&quot;Uji Buka Channel / Profil&quot;</strong> di sebelah kanan input untuk memastikan bahwa tautan langsung membuka halaman channel atau video Anda dengan benar.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <p className="font-black text-slate-900">Aktifkan Misi Orientasi Otomatis &amp; Simpan</p>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Pastikan opsi <strong>&quot;Aktifkan Tugas Orientasi Wajib untuk Semua Member Baru&quot;</strong> dalam keadaan centang hijau, lalu klik <strong>&quot;Simpan &amp; Terapkan Sinergi&quot;</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Otomatisasi Sistem:</span>
              </p>
              <p className="text-emerald-800 leading-relaxed">
                Setelah Anda menyimpan, setiap member baru yang melakukan pendaftaran akan otomatis disajikan layar misi menonton video YouTube Anda minimal 2 menit dan follow akun Instagram/TikTok Anda.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdminGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Tutup Panduan
              </button>
              {onOpenAdminSocialsModal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminGuideModal(false);
                    onOpenAdminSocialsModal();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Buka Form Pengaturan Medsos Sekarang →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Cara Membedakan Website Admin vs Website yang Dishare ke Orang Lain */}
      {showShareDistinctionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-indigo-200 animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase">
                    PEMISAHAN AKSES &amp; KEAMANAN
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Membedakan Website Milik Admin vs Website yang Di-Share ke Orang Lain
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareDistinctionModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Admin Website Card */}
              <div className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                    👑 Website Milik Admin
                  </span>
                  <span className="text-[10px] text-amber-800 font-semibold font-mono">userType: &apos;admin&apos;</span>
                </div>
                <h4 className="font-black text-sm text-slate-900">
                  Panel Khusus Pengelola (Dashboard Admin)
                </h4>
                <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                  <li>
                    Hanya muncul ketika Anda <strong>login sebagai Admin</strong> ({currentUser.email}).
                  </li>
                  <li>
                    Memiliki menu khusus <strong>&quot;👑 Monitor Tugas Member&quot;</strong> untuk melihat status seluruh member.
                  </li>
                  <li>
                    Dapat melihat <strong>detik &amp; menit tonton YouTube</strong> masing-masing member (apakah sudah &gt; 2 menit).
                  </li>
                  <li>
                    Dapat mengubah link media sosial resmi dan melakukan tombol <strong>&quot;Verifikasi Cepat&quot;</strong>.
                  </li>
                  <li>
                    <strong>Jangan berikan password admin</strong> Anda kepada orang lain!
                  </li>
                </ul>
              </div>

              {/* Shared Website Card */}
              <div className="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-black text-[10px] uppercase">
                    🌐 Website untuk Di-Share (Member/Tamu)
                  </span>
                  <span className="text-[10px] text-emerald-800 font-semibold font-mono">Public / Member View</span>
                </div>
                <h4 className="font-black text-sm text-slate-900">
                  Halaman Depan &amp; Form Pendaftaran Publik
                </h4>
                <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                  <li>
                    Link yang Anda bagikan ke orang lain (WhatsApp, bio sosmed, dll).
                  </li>
                  <li>
                    Orang lain akan melihat <strong>Halaman Depan (Landing Page)</strong> yang ramah dan tombol <strong>&quot;Daftar Sekarang&quot;</strong>.
                  </li>
                  <li>
                    Calon member <strong>TIDAK BISA</strong> melihat panel monitor admin ataupun data rahasia orang lain.
                  </li>
                  <li>
                    <strong>Setelah mendaftar</strong>, sistem mengarahkan mereka ke misi tonton YouTube 2 menit &amp; subscribe sebelum masuk ke dasbor member reguler.
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Share Link Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Copy className="w-4 h-4 text-emerald-400" />
                  <span>Link Website yang Siap Dibagikan ke Calon Member:</span>
                </span>
                {copyFeedback && (
                  <span className="text-xs text-emerald-400 font-bold animate-in fade-in">
                    {copyFeedback}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/?tab=landing&ref=${currentUser.referralCode}`}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/?tab=landing&ref=${currentUser.referralCode}`;
                    navigator.clipboard.writeText(shareUrl);
                    setCopyFeedback('✅ Link Berhasil Disalin!');
                    setTimeout(() => setCopyFeedback(''), 2500);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Link Share</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Setiap orang yang mendaftar melalui link ini akan otomatis terhubung dengan kode referral Anda dan masuk dalam daftar pantauan di monitor ini.
              </p>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowShareDistinctionModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Saya Mengerti, Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

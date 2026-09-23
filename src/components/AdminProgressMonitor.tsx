import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Task, TeamMember, TaskStatus } from '../types';

interface AdminProgressMonitorProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  onSelectTask?: (task: Task) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: TaskStatus) => void;
  onOpenNewTaskModal?: () => void;
}

export const AdminProgressMonitor: React.FC<AdminProgressMonitorProps> = ({
  tasks,
  teamMembers,
  currentUser,
  onSelectTask,
  onUpdateTaskStatus,
  onOpenNewTaskModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'unassigned'>('all');
  const [searchMember, setSearchMember] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

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

      return {
        member,
        total,
        done,
        ongoing: ongoingTasks.length,
        progressPercent,
        stateLabel,
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

  // Filtered members by search query and category
  const filteredMemberStats = useMemo(() => {
    return memberProgressList.filter((item) => {
      const matchesSearch =
        item.member.name.toLowerCase().includes(searchMember.toLowerCase()) ||
        item.member.email.toLowerCase().includes(searchMember.toLowerCase()) ||
        (item.member.phoneNumber && item.member.phoneNumber.includes(searchMember)) ||
        (item.member.occupation && item.member.occupation.toLowerCase().includes(searchMember.toLowerCase()));

      let matchesCategory = true;
      if (filterStatus === 'completed') {
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
          <div className="flex flex-wrap items-center gap-3">
            {onOpenNewTaskModal && (
              <button
                type="button"
                onClick={onOpenNewTaskModal}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>+ Buat &amp; Tugaskan Konten Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* Aggregate Progress Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-xs text-indigo-200 font-medium">Total Tugas Komunitas</p>
            <p className="text-2xl font-black text-white mt-0.5">{totalTasks} Tugas</p>
            <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallCompletionPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-emerald-300 font-semibold mt-1">
              {overallCompletionPercentage}% tugas terselesaikan
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-xs text-emerald-200 font-medium">Member Tuntas Tugas (100%)</p>
            <p className="text-2xl font-black text-emerald-300 mt-0.5">{membersWithCompletedTasks} Member</p>
            <p className="text-[10px] text-emerald-200/70 mt-1">
              Seluruh tugas yang diberikan telah selesai
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-xs text-amber-200 font-medium">Member Sedang Berproses</p>
            <p className="text-2xl font-black text-amber-300 mt-0.5">{membersInProgress} Member</p>
            <p className="text-[10px] text-amber-200/70 mt-1">
              Memiliki tugas todo / proses / review
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-xs text-slate-300 font-medium">Belum Menerima Tugas</p>
            <p className="text-2xl font-black text-slate-200 mt-0.5">{membersWithoutTasks} Member</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Siap untuk didelegasikan tugas baru
            </p>
          </div>
        </div>
      </div>

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
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada member yang cocok dengan filter atau kata kunci pencarian.
                  </td>
                </tr>
              ) : (
                filteredMemberStats.map((item) => {
                  const m = item.member;
                  const isFinished = item.stateLabel === 'completed_all';
                  const isProcessing = item.stateLabel === 'in_progress';
                  const isUnassigned = item.stateLabel === 'no_tasks';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 truncate">{m.name}</p>
                              {m.userType === 'admin' && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black border border-amber-300">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono truncate">{m.email}</p>
                            {m.phoneNumber && (
                              <p className="text-[10px] text-emerald-700 font-mono truncate">
                                📞 {m.phoneNumber}
                              </p>
                            )}
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
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>Sedang Berjalan ({item.ongoing})</span>
                          </span>
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
                        <button
                          type="button"
                          onClick={() => setSelectedMemberId(m.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Lihat Detail Tugas →
                        </button>
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
    </div>
  );
};

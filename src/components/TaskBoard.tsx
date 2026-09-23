import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Users,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquare,
  Sparkles,
  UserPlus,
  AlertCircle,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Task, TaskCategory, TaskPriority, TaskStatus, TeamMember } from '../types';

interface TaskBoardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  onSelectTask: (task: Task) => void;
  onOpenNewTaskModal: (status?: TaskStatus) => void;
  onQuickStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAssignBuddy: (taskId: string, buddyId: string) => void;
}

const statusColumns: { id: TaskStatus; title: string; color: string; bg: string }[] = [
  { id: 'todo', title: 'Akan Dikerjakan', color: 'border-slate-300 text-slate-700', bg: 'bg-slate-100/70' },
  { id: 'in_progress', title: 'Sedang Berjalan', color: 'border-indigo-400 text-indigo-700', bg: 'bg-indigo-50/50' },
  { id: 'review', title: 'Dalam Review', color: 'border-amber-400 text-amber-700', bg: 'bg-amber-50/50' },
  { id: 'done', title: 'Selesai', color: 'border-emerald-400 text-emerald-700', bg: 'bg-emerald-50/50' },
];

const priorityBadges: Record<TaskPriority, { text: string; bg: string; textCol: string }> = {
  low: { text: 'Rendah', bg: 'bg-slate-100', textCol: 'text-slate-600' },
  medium: { text: 'Sedang', bg: 'bg-blue-50', textCol: 'text-blue-700' },
  high: { text: 'Tinggi', bg: 'bg-amber-50', textCol: 'text-amber-700' },
  urgent: { text: 'Mendesak', bg: 'bg-rose-50', textCol: 'text-rose-700' },
};

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  teamMembers,
  currentUser,
  onSelectTask,
  onOpenNewTaskModal,
  onQuickStatusChange,
  onQuickAssignBuddy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterBuddyOnly, setFilterBuddyOnly] = useState<'all' | 'mine' | 'with_buddy' | 'need_buddy'>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.assigneeName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;

    let matchesBuddy = true;
    if (filterBuddyOnly === 'mine') {
      matchesBuddy = task.assigneeId === currentUser.id || task.buddyId === currentUser.id;
    } else if (filterBuddyOnly === 'with_buddy') {
      matchesBuddy = !!task.buddyId;
    } else if (filterBuddyOnly === 'need_buddy') {
      matchesBuddy = !task.buddyId && task.status !== 'done';
    }

    return matchesSearch && matchesCategory && matchesBuddy;
  });

  const getUrgencyInfo = (dueDateStr: string, isDone: boolean) => {
    if (isDone) return null;
    const now = Date.now();
    const due = new Date(dueDateStr).getTime();
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { label: 'Terlewat', class: 'bg-rose-100 text-rose-800 border-rose-200' };
    }
    if (diffHours <= 24) {
      return { label: '< 24 Jam', class: 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse' };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: TBK Synergy Mission */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Sistem Kolaborasi Pegiat Medsos "Teman Bawa Kawan" (TBK)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Saling Support Konten Kreator, Tembus Syarat Monetisasi Bareng!
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Tiap konten kolaborasi (duet/cross-promo, live streaming affiliate, audit naskah/thumbnail) yang diselesaikan tepat waktu bersama <strong>Kawan Pendamping</strong> melipatgandakan perolehan <strong>+120 XP</strong>, mendongkrak jam tayang & followers, serta memberikan <strong>50 Poin Referal</strong> ke sesama kreator!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-add-task-top"
              onClick={() => onOpenNewTaskModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Tambah Konten / Tugas TBK
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-tasks"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari konten, brand sponsor, hashtag, atau kawan kreator..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <span className="text-slate-500 text-[11px] font-medium px-2">Kategori:</span>
            <select
              id="select-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border-0 rounded-md py-1 px-2 text-xs font-medium text-slate-700 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Semua Konten & Tugas</option>
              <option value="monetization_sponsor">💰 Monetisasi & Sponsor</option>
              <option value="collab_crosspromo">🤝 Kolaborasi & Duet</option>
              <option value="content_production">🎬 Produksi Konten</option>
              <option value="algorithm_growth">📈 Algoritma & SEO</option>
              <option value="distribution_engagement">⚡ Live & Distribusi</option>
            </select>
          </div>

          {/* TBK Buddy Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setFilterBuddyOnly('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                filterBuddyOnly === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterBuddyOnly('mine')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                filterBuddyOnly === 'mine' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tugas Saya
            </button>
            <button
              onClick={() => setFilterBuddyOnly('need_buddy')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                filterBuddyOnly === 'need_buddy'
                  ? 'bg-amber-400 text-slate-900 font-semibold shadow-xs'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <UserPlus className="w-3 h-3" />
              Butuh Kawan
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md ${
                viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Tampilan Papan Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${
                viewMode === 'list' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Tampilan Daftar / Tabel"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {statusColumns.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="flex flex-col bg-slate-100/60 rounded-xl p-3 border border-slate-200/80 min-h-[480px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700">{col.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white text-slate-600 border border-slate-200">
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenNewTaskModal(col.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors"
                    title={`Tambah tugas ke ${col.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Task Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-center p-3 text-slate-400 text-xs">
                      <p>Tidak ada tugas</p>
                      <button
                        onClick={() => onOpenNewTaskModal(col.id)}
                        className="mt-1 text-indigo-600 hover:underline text-[11px] font-medium"
                      >
                        + Tambah sekarang
                      </button>
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const urgency = getUrgencyInfo(task.dueDate, task.status === 'done');
                      const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
                      const hasSubtasks = task.subtasks.length > 0;

                      return (
                        <div
                          key={task.id}
                          id={`task-card-${task.id}`}
                          onClick={() => onSelectTask(task)}
                          className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group space-y-3"
                        >
                          {/* Tags, Priority & Encryption Flag */}
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-md font-semibold ${
                                  priorityBadges[task.priority].bg
                                } ${priorityBadges[task.priority].textCol}`}
                              >
                                {priorityBadges[task.priority].text}
                              </span>

                              {urgency && (
                                <span
                                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${urgency.class}`}
                                >
                                  {urgency.label}
                                </span>
                              )}
                            </div>

                            {/* Task status indicator icon */}
                            {task.status === 'done' && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                          </div>

                          {/* Task Title */}
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {task.title}
                          </h4>

                          {/* Monetization Target Badge */}
                          {task.monetizationGoal && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-semibold border border-amber-200">
                              <span>🎯 {task.monetizationGoal}</span>
                            </div>
                          )}

                          {/* Subtasks progress bar */}
                          {hasSubtasks && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                                <span>Checklist Tugas</span>
                                <span>
                                  {completedSubtasks}/{task.subtasks.length}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 transition-all"
                                  style={{
                                    width: `${(completedSubtasks / task.subtasks.length) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* TBK Teamwork Pair Info (Teman Utama & Kawan Pendamping) */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            {/* Assignee & Buddy Avatar Duo */}
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2 overflow-hidden items-center">
                                {/* Teman Utama (Assignee) */}
                                <img
                                  src={task.assigneeAvatar || currentUser.avatar}
                                  alt={task.assigneeName}
                                  title={`Teman Utama: ${task.assigneeName}`}
                                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                                  referrerPolicy="no-referrer"
                                />

                                {/* Kawan Pendamping (Buddy) */}
                                {task.buddyId ? (
                                  <img
                                    src={task.buddyAvatar || teamMembers[1].avatar}
                                    alt={task.buddyName}
                                    title={`Kawan Pendamping (TBK): ${task.buddyName}`}
                                    className="inline-block h-6 w-6 rounded-full ring-2 ring-amber-400 object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : null}
                              </div>

                              <div className="text-[11px] leading-tight">
                                <span className="font-medium text-slate-700 block truncate max-w-[90px]">
                                  {task.assigneeName.split(' ')[0]}
                                </span>
                                {task.buddyName ? (
                                  <span className="text-[10px] text-amber-700 font-bold block truncate max-w-[90px]">
                                    + {task.buddyName.split(' ')[0]} 🤝
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 block">Solo</span>
                                )}
                              </div>
                            </div>

                            {/* Buddy Quick Action or Bonus XP Badge */}
                            {!task.buddyId && task.status !== 'done' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Quick invite teammate
                                  const candidate = teamMembers.find((m) => m.id !== task.assigneeId);
                                  if (candidate) {
                                    onQuickAssignBuddy(task.id, candidate.id);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 transition-colors"
                                title="Bawa Kawan ke tugas ini untuk mendapatkan bonus sinergi +40 XP!"
                              >
                                <UserPlus className="w-3 h-3 text-amber-600" />
                                Bawa Kawan
                              </button>
                            ) : (
                              <div className="text-right">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                                  <Sparkles className="w-3 h-3" />
                                  +120 XP
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Footer: Due date & comments */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>

                            <div className="flex items-center gap-2">
                              {task.comments.length > 0 && (
                                <span className="flex items-center gap-0.5 text-slate-500">
                                  <MessageSquare className="w-3 h-3" />
                                  {task.comments.length}
                                </span>
                              )}

                              {/* Quick Move Forward Button */}
                              {task.status !== 'done' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const nextStatusMap: Record<TaskStatus, TaskStatus> = {
                                      todo: 'in_progress',
                                      in_progress: 'review',
                                      review: 'done',
                                      done: 'done',
                                    };
                                    onQuickStatusChange(task.id, nextStatusMap[task.status]);
                                  }}
                                  className="p-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                  title="Geser status berikutnya"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List / Table View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tugas</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Prioritas</th>
                  <th className="py-3 px-4">Teman Utama & Kawan</th>
                  <th className="py-3 px-4">Tenggat</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada tugas yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 line-clamp-1">{task.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="capitalize">{task.category}</span>
                          {task.subtasks.length > 0 && (
                            <span>
                              • {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} Sub-tugas
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                            priorityBadges[task.priority].bg
                          } ${priorityBadges[task.priority].textCol}`}
                        >
                          {priorityBadges[task.priority].text}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-800">{task.assigneeName}</span>
                          {task.buddyName ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                              🤝 {task.buddyName}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">Solo</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(task.dueDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {task.platform || 'Multiplatform'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(task);
                          }}
                          className="px-2.5 py-1 rounded-md text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

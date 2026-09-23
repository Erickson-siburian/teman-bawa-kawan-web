import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Sparkles,
  Gift,
  Download,
  ExternalLink,
  MessageSquare,
  Send,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { Task, TaskStatus, TeamMember } from '../types';
import { createGoogleCalendarUrl, downloadIcsCalendar } from '../lib/calendarExport';
import { playTaskDoneChime } from '../lib/audio';

interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddComment: (taskId: string, text: string) => void;
  onAssignBuddy: (taskId: string, buddyId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  onClose,
  teamMembers,
  currentUser,
  onStatusChange,
  onToggleSubtask,
  onAddComment,
  onAssignBuddy,
  onDeleteTask,
}) => {
  const [commentText, setCommentText] = useState('');

  if (!task) return null;

  const handleStatusChangeClick = (newStatus: TaskStatus) => {
    if (newStatus === 'done' && task.status !== 'done') {
      playTaskDoneChime();
    }
    onStatusChange(task.id, newStatus);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(task.id, commentText.trim());
    setCommentText('');
  };

  const isDueSoon = new Date(task.dueDate).getTime() - Date.now() < 86400000;
  const isPastDue = new Date(task.dueDate).getTime() < Date.now();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                task.status === 'done'
                  ? 'bg-emerald-100 text-emerald-800'
                  : task.status === 'in_progress'
                  ? 'bg-indigo-100 text-indigo-800'
                  : task.status === 'review'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {task.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (confirm('Yakin ingin menghapus tugas ini?')) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Hapus tugas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          {/* Title & Category */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 font-medium flex-wrap">
              {task.platform && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold uppercase text-[10px]">
                  {task.platform}
                </span>
              )}
              <span className="capitalize">{task.category.replace('_', ' ')}</span>
              <span>•</span>
              <span className="capitalize">Prioritas: {task.priority}</span>
              {task.onTime && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tepat Waktu (+80 XP)
                  </span>
                </>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">{task.title}</h2>
            {task.monetizationGoal && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs">
                <span className="font-bold">🎯 Target Monetisasi:</span>
                <span>{task.monetizationGoal}</span>
              </div>
            )}
          </div>

          {/* Status Progression Bar */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="font-semibold text-slate-700 block">Perbarui Status Tugas:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['todo', 'in_progress', 'review', 'done'] as TaskStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChangeClick(st)}
                  className={`py-1.5 px-2 rounded-lg text-center font-bold text-[11px] transition-all capitalize ${
                    task.status === st
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Deskripsi Tugas */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800">Deskripsi Tugas</span>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
              {task.description || 'Tidak ada deskripsi rinci.'}
            </div>
          </div>

          {/* Teman Bawa Kawan (TBK) Partner Duo Box */}
          <div className="p-4 rounded-xl bg-linear-to-r from-amber-50/80 to-indigo-50/50 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                Kolaborasi Teman Bawa Kawan (TBK)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                +120 XP Combo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Teman Utama */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2.5">
                <img
                  src={task.assigneeAvatar || currentUser.avatar}
                  alt={task.assigneeName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Teman Utama</span>
                  <span className="font-bold text-slate-800 text-xs block truncate">{task.assigneeName}</span>
                </div>
              </div>

              {/* Kawan Pendamping */}
              <div className="bg-white p-2.5 rounded-lg border border-amber-300 flex items-center justify-between gap-2">
                {task.buddyId ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={task.buddyAvatar || teamMembers[1].avatar}
                      alt={task.buddyName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-amber-700 block">Kawan Pendamping</span>
                      <span className="font-bold text-slate-800 text-xs block truncate">{task.buddyName} 🤝</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Belum ada Kawan</span>
                      <span className="text-xs font-semibold text-amber-800">Ajak Kawan!</span>
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) onAssignBuddy(task.id, e.target.value);
                      }}
                      className="text-[11px] font-bold bg-amber-400 text-slate-900 rounded-md px-2 py-1 border-0 cursor-pointer"
                    >
                      <option value="">+ Pilih</option>
                      {teamMembers
                        .filter((m) => m.id !== task.assigneeId)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {task.referralCodeUsed && (
              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600">
                <span className="flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  Kode Referal Aktif:
                </span>
                <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {task.referralCodeUsed}
                </span>
              </div>
            )}
          </div>

          {/* Subtasks (Checklist) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>Sub-tugas Kolaborasi</span>
              <span className="text-slate-400 text-[11px] font-normal">
                {task.subtasks.filter((s) => s.completed).length} dari {task.subtasks.length} tuntas
              </span>
            </div>

            {task.subtasks.length === 0 ? (
              <p className="text-slate-400 italic text-xs">Belum ada sub-tugas.</p>
            ) : (
              <div className="space-y-1.5">
                {task.subtasks.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => onToggleSubtask(task.id, st.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      st.completed
                        ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                        : 'bg-white border-slate-200/90 hover:border-indigo-300 text-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => {}} // Handled by div click
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="flex-1">{st.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendar Integration Action Bar */}
          <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block">Integrasi Kalender:</span>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={createGoogleCalendarUrl(task)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-indigo-700 font-semibold text-xs border border-slate-200 shadow-2xs transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                Tambah ke Google Calendar
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <button
                onClick={() => downloadIcsCalendar([task], `tbk-${task.id}.ics`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Ekspor File .ics
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Tenggat: {new Date(task.dueDate).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
            </p>
          </div>

          {/* Comments & Peer Activity Stream */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              Diskusi & Dukungan Kawan ({task.comments.length})
            </span>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {task.comments.length === 0 ? (
                <p className="text-slate-400 italic text-xs py-2">
                  Belum ada komentar. Berikan semangat untuk kawan tim Anda!
                </p>
              ) : (
                task.comments.map((comm) => (
                  <div key={comm.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{comm.userName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-xs">{comm.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSendComment} className="flex gap-2 pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Kirim catatan atau semangat kawan..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                Kirim
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

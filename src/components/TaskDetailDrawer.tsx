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
  Youtube,
  Instagram,
  MessageCircle,
  Facebook,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Task, TaskStatus, TeamMember } from '../types';
import { createGoogleCalendarUrl, downloadIcsCalendar } from '../lib/calendarExport';
import { playTaskDoneChime } from '../lib/audio';
import { MASTER_OFFICIAL_SOCIALS, formatSocialUrl } from '../constants/socials';

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!task) return null;

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const extractUrlOrHandle = (title: string): string | null => {
    const urlMatch = title.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) return urlMatch[0];
    const handleMatch = title.match(/@[a-zA-Z0-9._-]+/);
    if (handleMatch) {
      const h = handleMatch[0].replace('@', '');
      if (title.toLowerCase().includes('instagram')) return `https://instagram.com/${h}`;
      if (title.toLowerCase().includes('tiktok')) return `https://tiktok.com/@${h}`;
      return `https://instagram.com/${h}`;
    }
    return null;
  };

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

          {/* 5 Akun Media Sosial & Grup Resmi Admin TBK (Wajib Di-Follow) */}
          {(task.isOfficialMandatory || task.id === 'task-mandatory-official' || task.tags?.includes('WajibAdmin')) ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-amber-500/10 via-amber-100/50 to-orange-500/10 border-2 border-amber-300 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                    <ShieldCheck className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                      📌 5 Akun Resmi Admin TBK (Wajib Di-Follow)
                    </h4>
                    <p className="text-[11px] text-amber-900 font-medium">
                      Buka tautan dan subscribe/follow untuk verifikasi otomatis di sistem
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  Wajib 100%
                </span>
              </div>

              {/* 5 Channels List */}
              <div className="space-y-2.5">
                {/* 1. YouTube */}
                <div className="p-3 bg-white rounded-xl border border-red-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <Youtube className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">1. YouTube Official Admin</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-50 text-red-700 font-semibold border border-red-100">
                          Tonton min 2 mnt &amp; Sub
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-600 truncate">
                        {MASTER_OFFICIAL_SOCIALS.youtube}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleCopyText(MASTER_OFFICIAL_SOCIALS.youtube, 'yt')}
                      className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Salin Link YouTube"
                    >
                      {copiedKey === 'yt' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'yt' ? 'Tersalin' : 'Salin'}</span>
                    </button>
                    <a
                      href={formatSocialUrl('youtube', MASTER_OFFICIAL_SOCIALS.youtube)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <span>Buka &amp; Subscribe</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 2. Instagram */}
                <div className="p-3 bg-white rounded-xl border border-pink-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">2. Instagram Official Admin</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-50 text-pink-700 font-semibold border border-pink-100">
                          Follow Akun
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-600 truncate">
                        {MASTER_OFFICIAL_SOCIALS.instagram}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleCopyText(MASTER_OFFICIAL_SOCIALS.instagram, 'ig')}
                      className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Salin Handle Instagram"
                    >
                      {copiedKey === 'ig' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'ig' ? 'Tersalin' : 'Salin'}</span>
                    </button>
                    <a
                      href={formatSocialUrl('instagram', MASTER_OFFICIAL_SOCIALS.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <span>Buka &amp; Follow IG</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 3. TikTok */}
                <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 font-black text-xs">
                      TT
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">3. TikTok Official Admin</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          Follow Akun
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-600 truncate">
                        {MASTER_OFFICIAL_SOCIALS.tiktok}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleCopyText(MASTER_OFFICIAL_SOCIALS.tiktok, 'tt')}
                      className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Salin Handle TikTok"
                    >
                      {copiedKey === 'tt' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'tt' ? 'Tersalin' : 'Salin'}</span>
                    </button>
                    <a
                      href={formatSocialUrl('tiktok', MASTER_OFFICIAL_SOCIALS.tiktok)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <span>Buka &amp; Follow TikTok</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 4. Facebook */}
                <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Facebook className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">4. Fanspage Facebook Admin</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                          Follow Fanspage
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-600 truncate">
                        {MASTER_OFFICIAL_SOCIALS.facebook}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleCopyText(MASTER_OFFICIAL_SOCIALS.facebook, 'fb')}
                      className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Salin Link Facebook"
                    >
                      {copiedKey === 'fb' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'fb' ? 'Tersalin' : 'Salin'}</span>
                    </button>
                    <a
                      href={formatSocialUrl('facebook', MASTER_OFFICIAL_SOCIALS.facebook)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <span>Buka Fanspage FB</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 5. WhatsApp Group */}
                <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">5. Link Grup WhatsApp Komunitas</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                          Gabung Komunitas
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-600 truncate">
                        {MASTER_OFFICIAL_SOCIALS.whatsappGroup}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleCopyText(MASTER_OFFICIAL_SOCIALS.whatsappGroup, 'wa')}
                      className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Salin Link WhatsApp"
                    >
                      {copiedKey === 'wa' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'wa' ? 'Tersalin' : 'Salin'}</span>
                    </button>
                    <a
                      href={formatSocialUrl('whatsappGroup', MASTER_OFFICIAL_SOCIALS.whatsappGroup)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <span>Gabung Grup WA</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : task.mediaLink ? (
            <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-950 flex items-center gap-1.5 text-xs">
                  <span className="text-base">▶</span> Link YouTube / Media Sosial Terlampir
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(task.mediaLink!, 'single-media')}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1 border border-slate-200 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'single-media' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'single-media' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                  <a
                    href={task.mediaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>Buka Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <p className="text-xs font-mono text-slate-600 truncate bg-white p-2 rounded-lg border border-red-100">
                {task.mediaLink}
              </p>
            </div>
          ) : null}

          {/* Broadcast to All Members Box */}
          {task.assignedToAll && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Tugas Komunitas untuk Seluruh Peserta TBK
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[10px]">
                  {task.completedByMemberIds?.length || 0} / {teamMembers.length} Peserta Selesai
                </span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Diberikan oleh member <strong>{task.creatorName}</strong> agar seluruh anggota komunitas saling gotong-royong mem-follow atau menonton video.
              </p>

              {/* Action: Mark as Completed by current user */}
              <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                {task.completedByMemberIds?.includes(currentUser.id) ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Anda Telah Menyelesaikan Tugas Ini
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      const updated = [...(task.completedByMemberIds || []), currentUser.id];
                      task.completedByMemberIds = updated;
                      if (updated.length >= teamMembers.length) {
                        onStatusChange(task.id, 'done');
                      } else {
                        onStatusChange(task.id, 'in_progress');
                      }
                      playTaskDoneChime();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Tandai Saya Telah Selesaikan Tugas Ini
                  </button>
                )}
              </div>
            </div>
          )}

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
                {task.subtasks.map((st) => {
                  const targetUrl = extractUrlOrHandle(st.title);
                  return (
                    <div
                      key={st.id}
                      onClick={() => onToggleSubtask(task.id, st.id)}
                      className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        st.completed
                          ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                          : 'bg-white border-slate-200/90 hover:border-indigo-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => {}} // Handled by div click
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                        />
                        <span className="truncate">{st.title}</span>
                      </div>
                      {targetUrl && (
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleCopyText(targetUrl, `sub-${st.id}`)}
                            className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Salin Tautan"
                          >
                            {copiedKey === `sub-${st.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center gap-1 border border-indigo-200 transition-colors"
                          >
                            <span>Buka</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
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

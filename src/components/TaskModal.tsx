import React, { useState } from 'react';
import {
  X,
  Users,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Tag,
  Gift,
} from 'lucide-react';
import { SocialPlatform, Task, TaskCategory, TaskPriority, TaskStatus, TeamMember } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => Promise<void>;
  initialStatus?: TaskStatus;
  teamMembers: TeamMember[];
  currentUser: TeamMember;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialStatus = 'todo',
  teamMembers,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('monetization_sponsor');
  const [platform, setPlatform] = useState<SocialPlatform>('youtube');
  const [monetizationGoal, setMonetizationGoal] = useState<string>('');
  const [mediaLink, setMediaLink] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [buddyId, setBuddyId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date(Date.now() + 86400000 * 3);
    d.setHours(17, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [tagsInput, setTagsInput] = useState('Monetisasi, TBK-Sinergi, Kolaborasi');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([
    { id: 'sub-1', title: 'Diskusi awal bersama Kawan Pendamping', completed: false },
  ]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [referralCode, setReferralCode] = useState(currentUser.referralCode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      const selectedAssignee = teamMembers.find((m) => m.id === assigneeId) || currentUser;
      const selectedBuddy = buddyId ? teamMembers.find((m) => m.id === buddyId) : undefined;

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        isEncrypted: false,
        status,
        priority,
        category,
        platform,
        mediaLink: mediaLink.trim() || undefined,
        monetizationGoal: monetizationGoal.trim() || undefined,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        assigneeId: selectedAssignee.id,
        assigneeName: selectedAssignee.name,
        assigneeAvatar: selectedAssignee.avatar,
        buddyId: selectedBuddy?.id,
        buddyName: selectedBuddy?.name,
        buddyAvatar: selectedBuddy?.avatar,
        dueDate: new Date(dueDate).toISOString(),
        tags,
        subtasks,
        referralCodeUsed: referralCode.trim() || undefined,
      });

      onClose();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Tambah Tugas Kolaborasi TBK</h3>
              <p className="text-xs text-slate-500">Libatkan Kawan untuk meraih bonus sinergi dan poin referal.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Judul Tugas */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Implementasi Pipeline CI/CD & Audit Keamanan"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Tugas</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan sasaran, deliverable, dan langkah yang dibutuhkan..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Grid: Teman Utama & Kawan Pendamping (TBK Partner) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/40 rounded-xl border border-amber-200/60">
            {/* Teman Utama (Assignee) */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">Teman Utama (Penanggung Jawab)</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Kawan Pendamping (TBK Buddy) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-amber-900">Kawan Pendamping (TBK Partner)</label>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.2 rounded-full">
                  +40 XP Sinergi
                </span>
              </div>
              <select
                value={buddyId}
                onChange={(e) => setBuddyId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-amber-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Bekerja Mandiri (Tanpa Kawan) --</option>
                {teamMembers
                  .filter((m) => m.id !== assigneeId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      🤝 {m.name} ({m.role})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Platform & Target Monetisasi Medsos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-indigo-50/40 rounded-xl border border-indigo-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Platform Utama</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="youtube">🔴 YouTube (Shorts & Long-form)</option>
                <option value="tiktok">🎵 TikTok (Duet, Stitch & Live)</option>
                <option value="instagram">📸 Instagram (Reels & Feed)</option>
                <option value="affiliate_shop">🛍️ Affiliate (TikTok Shop & Shopee)</option>
                <option value="multiplatform">🌐 Multi-Platform Sinergi</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Monetisasi / Milestone</label>
              <input
                type="text"
                value={monetizationGoal}
                onChange={(e) => setMonetizationGoal(e.target.value)}
                placeholder="Misal: Kontrak Rp 15 Jt, 4.000 Jam Tayang, GMV Rp 25 Jt"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Link YouTube / Media Sosial (Poin 5) */}
          <div className="p-3 bg-red-50/40 rounded-xl border border-red-100">
            <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <span className="text-red-600 font-bold">▶ / 🔗</span>
              <span>Link YouTube atau Media Sosial Tugas / Konten</span>
            </label>
            <input
              type="url"
              value={mediaLink}
              onChange={(e) => setMediaLink(e.target.value)}
              placeholder="https://youtube.com/watch?v=... atau https://instagram.com/p/..."
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Masukkan tautan YouTube, video TikTok, postingan Instagram, atau sosmed lain untuk ditonton/didiskusikan bersama rekan kawan.
            </p>
          </div>

          {/* Grid: Kategori, Prioritas, Tenggat Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Konten / Sinergi</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="monetization_sponsor">💰 Monetisasi & Sponsor</option>
                <option value="collab_crosspromo">🤝 Kolaborasi & Duet</option>
                <option value="content_production">🎬 Produksi Konten</option>
                <option value="algorithm_growth">📈 Algoritma & SEO</option>
                <option value="distribution_engagement">⚡ Live & Distribusi</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
                <option value="urgent">Mendesak</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tenggat Waktu</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Subtugas (Checklist) */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">Sub-tugas (Checklist Kolaborasi)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Tambahkan sub-tugas baru..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <span className="text-slate-700 truncate">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kode Referal & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-amber-500" />
                Kode Referal TBK
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Contoh: TBK-ERICK-88"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Bonus 50 poin referal bila selesai tepat waktu bersama kawan.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Label / Tag (Pisahkan koma)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Frontend, API, Sprint-1"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : 'Buat Tugas TBK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

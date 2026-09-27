import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Youtube,
  Instagram,
  Video,
  MapPin,
  Share2,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react';
import { Task, SocialPlatform, TaskCategory, TeamMember } from '../types';

interface CommunityBroadcastTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeamMember;
  allMembers: TeamMember[];
  onSubmit: (taskData: Partial<Task>) => Promise<void>;
  targetMember?: TeamMember;
}

export const CommunityBroadcastTaskModal: React.FC<CommunityBroadcastTaskModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allMembers,
  onSubmit,
  targetMember,
}) => {
  const creator = targetMember || currentUser;

  // Presets
  const presets = [
    {
      id: 'youtube_watch_sub',
      title: 'Tonton Min 2 Menit & Subscribe YouTube',
      platform: 'youtube' as SocialPlatform,
      category: 'algorithm_growth' as TaskCategory,
      icon: Youtube,
      color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      defaultTitle: `🔴 Tonton Min 2 Menit & Subscribe YouTube ${creator.socialAccounts?.youtube || creator.name}`,
      defaultDescription: `Tugas saling support dari member ${creator.name}! Seluruh peserta wajib menonton video YouTube terbaru minimal 2 menit sebelum subscribe dan like agar lolos verifikasi algoritma YouTube dan tidak terhapus sebagai spam.`,
      defaultLink: creator.socialAccounts?.youtube
        ? creator.socialAccounts.youtube.startsWith('http')
          ? creator.socialAccounts.youtube
          : `https://youtube.com/@${creator.socialAccounts.youtube.replace('@', '')}`
        : 'https://youtube.com',
      subtasks: [
        'Tonton video minimal 2 menit penuh tanpa skip',
        'Tekan tombol Subscribe & aktifkan lonceng',
        'Beri Like & tinggalkan komentar positif yang relevan',
      ],
      tags: ['TugasMemberBaru', 'SalingSupport', 'YouTubeSubscribe', 'SeluruhPeserta'],
    },
    {
      id: 'instagram_follow',
      title: 'Follow Instagram & Like Postingan',
      platform: 'instagram' as SocialPlatform,
      category: 'distribution_engagement' as TaskCategory,
      icon: Instagram,
      color: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100',
      defaultTitle: `📸 Follow Akun Instagram & Like 3 Reels ${creator.socialAccounts?.instagram || creator.name}`,
      defaultDescription: `Tugas saling support untuk seluruh peserta! Follow akun Instagram ${creator.socialAccounts?.instagram || `@${creator.name.toLowerCase().replace(/\s+/g, '')}`} dan beri like pada 3 konten reel/foto terbaru untuk mendongkrak engagement sinergi.`,
      defaultLink: creator.socialAccounts?.instagram
        ? creator.socialAccounts.instagram.startsWith('http')
          ? creator.socialAccounts.instagram
          : `https://instagram.com/${creator.socialAccounts.instagram.replace('@', '')}`
        : 'https://instagram.com',
      subtasks: [
        `Follow akun Instagram ${creator.socialAccounts?.instagram || creator.name}`,
        'Like 3 postingan / reels terbaru',
        'Tinggalkan 1 komentar suportif',
      ],
      tags: ['FollowInstagram', 'SalingSupport', 'Engagement', 'SeluruhPeserta'],
    },
    {
      id: 'tiktok_follow',
      title: 'Follow TikTok & Tonton VT FYP',
      platform: 'tiktok' as SocialPlatform,
      category: 'distribution_engagement' as TaskCategory,
      icon: Video,
      color: 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800',
      defaultTitle: `🎵 Follow Akun TikTok & Tonton 1 Video FYP Sampai Habis`,
      defaultDescription: `Ayo seluruh peserta TBK saling support akun TikTok kawan kita! Follow akun TikTok ${creator.socialAccounts?.tiktok || creator.name}, tonton 1 video sampai habis, like dan share copy link.`,
      defaultLink: creator.socialAccounts?.tiktok
        ? creator.socialAccounts.tiktok.startsWith('http')
          ? creator.socialAccounts.tiktok
          : `https://tiktok.com/@${creator.socialAccounts.tiktok.replace('@', '')}`
        : 'https://tiktok.com',
      subtasks: [
        `Follow akun TikTok ${creator.socialAccounts?.tiktok || creator.name}`,
        'Tonton minimal 1 video sampai selesai (watch time penuh)',
        'Like dan salin tautan (copy link) untuk trigger algoritma FYP',
      ],
      tags: ['TikTokFYP', 'FollowTikTok', 'SalingSupport', 'SeluruhPeserta'],
    },
    {
      id: 'google_review',
      title: 'Ulas Google Maps / Play Store Bintang 5',
      platform: 'all' as SocialPlatform,
      category: 'ops' as TaskCategory,
      icon: MapPin,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      defaultTitle: `⭐ Ulasan Positif Bintang 5 Google Maps / Play Store`,
      defaultDescription: `Bantu reputasi bisnis/usaha kawan TBK dengan memberikan ulasan rating bintang 5 dan ulasan organik yang bermutu di Google Maps atau Google Play Store.`,
      defaultLink: creator.socialAccounts?.googleMap || creator.socialAccounts?.googlePlaystore || 'https://maps.google.com',
      subtasks: [
        'Buka link lokasi bisnis Google Maps / Play Store',
        'Beri rating Bintang 5',
        'Tulis ulasan positif minimal 2 kalimat bermutu',
      ],
      tags: ['GoogleMaps', 'ReviewBintang5', 'SalingSupport', 'SeluruhPeserta'],
    },
  ];

  const [selectedPresetId, setSelectedPresetId] = useState<string>(presets[0].id);
  const [title, setTitle] = useState(presets[0].defaultTitle);
  const [description, setDescription] = useState(presets[0].defaultDescription);
  const [mediaLink, setMediaLink] = useState(presets[0].defaultLink);
  const [platform, setPlatform] = useState<SocialPlatform>(presets[0].platform);
  const [category, setCategory] = useState<TaskCategory>(presets[0].category);
  const [tags, setTags] = useState<string[]>(presets[0].tags);
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>(
    presets[0].subtasks.map((st, idx) => ({ id: `st-${idx}`, title: st, completed: false }))
  );
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date(Date.now() + 86400000 * 4);
    d.setHours(21, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    const p = presets.find((item) => item.id === presetId);
    if (!p) return;
    setSelectedPresetId(presetId);
    setTitle(p.defaultTitle);
    setDescription(p.defaultDescription);
    setMediaLink(p.defaultLink);
    setPlatform(p.platform);
    setCategory(p.category);
    setTags(p.tags);
    setSubtasks(p.subtasks.map((st, idx) => ({ id: `st-${Date.now()}-${idx}`, title: st, completed: false })));
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `st-${Date.now()}`,
        title: newSubtaskText.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        isEncrypted: false,
        status: 'todo',
        priority: 'high',
        category,
        platform,
        mediaLink: mediaLink.trim() || undefined,
        creatorId: creator.id,
        creatorName: creator.name,
        creatorAvatar: creator.avatar,
        assigneeId: 'all',
        assigneeName: 'Seluruh Peserta TBK',
        assignedToAll: true,
        communityTaskType: (selectedPresetId as any) || 'other',
        completedByMemberIds: [],
        dueDate: new Date(dueDate).toISOString(),
        tags,
        subtasks,
      });

      onClose();
    } catch (err) {
      console.error('Failed to broadcast community task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-amber-600 via-amber-700 to-amber-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <Share2 className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wide">
                  TUGAS UNTUK SEMUA MEMBER
                </span>
                <span className="text-amber-200 text-xs font-semibold">TBK Sinergi</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                Beri Tugas ke Seluruh Peserta Komunitas
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Member Broadcast Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-400 shrink-0 mt-0.5"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-xs text-amber-950">
                  Diberikan oleh: <span className="text-amber-700">{creator.name}</span>
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold text-[10px]">
                  {creator.role}
                </span>
              </div>
              <p className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                Tugas ini akan otomatis <strong>disiarkan ke seluruh peserta komunitas TBK ({allMembers.length} anggota)</strong>. Setiap anggota akan menerima notifikasi dan wajib saling gotong-royong menyelesaikan tugas ini.
              </p>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Pilih Jenis Tugas Saling Support Cepat (1-Klik):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset) => {
                const IconComponent = preset.icon;
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg border ${preset.color} shrink-0`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate text-slate-900">{preset.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">Saling follow & tonton</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Judul Tugas Saling Support <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Tonton Min 2 Menit & Subscribe YouTube Channel Saya..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Media / Video Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Tautan Video / Akun Media Sosial (YouTube / IG / TikTok / Maps)</span>
              {mediaLink && (
                <a
                  href={mediaLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  Uji Buka Link <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </label>
            <input
              type="url"
              value={mediaLink}
              onChange={(e) => setMediaLink(e.target.value)}
              placeholder="https://youtube.com/watch?v=... atau https://instagram.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
            <p className="text-[10px] text-slate-500">
              Peserta akan dapat langsung mengklik tombol &quot;Buka Link&quot; dari kartu tugas untuk menonton atau follow.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Instruksi Lengkap untuk Seluruh Peserta
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan aturan tugas, misal: wajib tonton minimal 2 menit sebelum subscribe agar lolos verifikasi..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Checklist Subtasks */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Langkah-Langkah Pengerjaan Tugas (Checklist)</span>
              <span className="text-[10px] text-slate-400">{subtasks.length} langkah</span>
            </label>
            <div className="space-y-1.5">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="truncate">{st.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Tambah langkah tugas baru..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah
              </button>
            </div>
          </div>

          {/* Target & Deadline Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Penerima Tugas</span>
              </div>
              <p className="text-[11px] text-indigo-700 font-medium">
                📢 Seluruh Peserta Komunitas TBK ({allMembers.length} Orang)
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Tenggat Waktu (Deadline)
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 hidden sm:block">
              ✨ Hadiah: <strong className="text-amber-700">+50 XP</strong> untuk setiap peserta yang menyelesaikan.
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Share2 className="w-4 h-4" />
                {isSubmitting ? 'Menyiarkan Tugas...' : 'Siarkan Tugas ke Seluruh Peserta'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

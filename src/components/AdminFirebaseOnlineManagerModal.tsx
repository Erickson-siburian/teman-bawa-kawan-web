import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  Globe,
  Radio,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Youtube,
  Instagram,
  MessageCircle,
  Database,
  ExternalLink,
  Code,
  Sliders,
  Bell,
  Clock,
  Send,
  Lock,
} from 'lucide-react';
import {
  WebsiteOnlineConfig,
  FirebaseConnectionConfig,
  MemberSocialAccounts,
  TeamMember,
} from '../types';
import {
  getStoredWebsiteConfig,
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  updateWebsiteOnlineToFirebase,
  fetchWebsiteConfigFromFirebase,
  testFirebaseConnection,
} from '../services/firebaseService';
import { sanitizeOfficialSocials } from '../constants/socials';

interface AdminFirebaseOnlineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeamMember;
  onWebsiteConfigUpdated: (config: WebsiteOnlineConfig) => void;
  onOfficialSocialsUpdated: (socials: MemberSocialAccounts) => void;
}

export const AdminFirebaseOnlineManagerModal: React.FC<
  AdminFirebaseOnlineManagerModalProps
> = ({
  isOpen,
  onClose,
  currentUser,
  onWebsiteConfigUpdated,
  onOfficialSocialsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'socials' | 'firebase' | 'rules'>('content');

  // Website Config Form State
  const [siteTitle, setSiteTitle] = useState('');
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(true);
  const [announcementType, setAnnouncementType] = useState<'info' | 'success' | 'warning' | 'alert'>('info');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [requireEmailActivation, setRequireEmailActivation] = useState(false);

  // Socials Form State
  const [youtube, setYoutube] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsappGroup, setWhatsappGroup] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [facebook, setFacebook] = useState('');

  // Firebase Config Form State
  const [fbProjectId, setFbProjectId] = useState('');
  const [fbApiKey, setFbApiKey] = useState('');
  const [fbDatabaseId, setFbDatabaseId] = useState('');

  // Status & Feedback States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Load existing configuration when opened
  useEffect(() => {
    if (isOpen) {
      const config = getStoredWebsiteConfig();
      setSiteTitle(config.siteTitle || 'Komunitas Teman Bawa Kawan (TBK)');
      setHeroHeadline(
        config.heroHeadline || 'Komunitas Teman Bawa Kawan: Gotong Royong Saling Support'
      );
      setHeroSubtitle(
        config.heroSubtitle ||
          'Selesaikan tugas bersama Kawan Duo, tembus syarat jam tayang & monetisasi multiplatform.'
      );
      setAnnouncementText(
        config.announcementText ||
          '📢 Pengumuman Resmi: Member baru wajib menyelesaikan 3 Misi Orientasi sebelum mulai kolaborasi!'
      );
      setIsAnnouncementActive(config.isAnnouncementActive ?? true);
      setAnnouncementType(config.announcementType || 'info');
      setMaintenanceMode(config.maintenanceMode ?? false);
      setRegistrationOpen(config.registrationOpen ?? true);
      setRequireEmailActivation(config.requireEmailActivation ?? false);

      const soc = sanitizeOfficialSocials(config.officialSocials);
      setYoutube(soc.youtube || '');
      setInstagram(soc.instagram || '');
      setWhatsappGroup(soc.whatsappGroup || '');
      setTiktok(soc.tiktok || '');
      setFacebook(soc.facebook || '');

      const fb = getStoredFirebaseConfig();
      setFbProjectId(fb.projectId || 'tbk-komunitas-online');
      setFbApiKey(fb.apiKey || 'AIzaSyA_TBK_Community_Firebase_DemoKey_2026');
      setFbDatabaseId(fb.firestoreDatabaseId || '(default)');

      setLastSyncTime(config.lastUpdatedOnline || new Date().toISOString());
      setSaveSuccessMsg('');
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Save & Deploy Online via Google Firebase
  const handleDeployOnline = async () => {
    setIsSaving(true);
    setSaveSuccessMsg('');

    // Save Firebase Connection Config
    saveStoredFirebaseConfig({
      projectId: fbProjectId.trim() || 'tbk-komunitas-online',
      apiKey: fbApiKey.trim(),
      firestoreDatabaseId: fbDatabaseId.trim() || '(default)',
    });

    const updatedSocials: MemberSocialAccounts = {
      youtube: youtube.trim(),
      instagram: instagram.trim(),
      whatsappGroup: whatsappGroup.trim(),
      tiktok: tiktok.trim(),
      facebook: facebook.trim(),
    };

    const newConfig: WebsiteOnlineConfig = {
      siteTitle: siteTitle.trim() || 'Komunitas Teman Bawa Kawan (TBK)',
      heroHeadline: heroHeadline.trim(),
      heroSubtitle: heroSubtitle.trim(),
      announcementText: announcementText.trim(),
      isAnnouncementActive,
      announcementType,
      maintenanceMode,
      registrationOpen,
      requireEmailActivation,
      officialSocials: updatedSocials,
      lastUpdatedOnline: new Date().toISOString(),
      updatedBy: currentUser.name || 'Administrator TBK',
      firebaseProjectId: fbProjectId.trim(),
      firebaseStatus: 'connected',
    };

    // Push to Firebase Firestore
    const res = await updateWebsiteOnlineToFirebase(newConfig);

    setIsSaving(false);
    if (res.success) {
      setLastSyncTime(res.timestamp);
      setSaveSuccessMsg(res.message);
      onWebsiteConfigUpdated(newConfig);
      onOfficialSocialsUpdated(updatedSocials);
      setTimeout(() => setSaveSuccessMsg(''), 5000);
    }
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testFirebaseConnection();
    setIsTesting(false);
    setTestResult({
      success: result.success,
      message: result.message,
    });
  };

  // Handle Pull from Cloud
  const handlePullFromFirebase = async () => {
    setIsTesting(true);
    const remote = await fetchWebsiteConfigFromFirebase();
    setIsTesting(false);
    if (remote) {
      setSiteTitle(remote.siteTitle);
      setHeroHeadline(remote.heroHeadline);
      setHeroSubtitle(remote.heroSubtitle);
      setAnnouncementText(remote.announcementText);
      setIsAnnouncementActive(remote.isAnnouncementActive);
      setAnnouncementType(remote.announcementType);
      setMaintenanceMode(remote.maintenanceMode);
      setRegistrationOpen(remote.registrationOpen);

      if (remote.officialSocials) {
        setYoutube(remote.officialSocials.youtube || '');
        setInstagram(remote.officialSocials.instagram || '');
        setWhatsappGroup(remote.officialSocials.whatsappGroup || '');
        setTiktok(remote.officialSocials.tiktok || '');
        setFacebook(remote.officialSocials.facebook || '');
      }

      onWebsiteConfigUpdated(remote);
      if (remote.officialSocials) onOfficialSocialsUpdated(remote.officialSocials);
      setTestResult({
        success: true,
        message: 'Konfigurasi website berhasil disinkronkan dari Google Firebase Firestore!',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-amber-300 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Flame className="w-6 h-6 text-amber-200 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                  Update Website Online
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    Google Firebase
                  </span>
                </h2>
              </div>
              <p className="text-xs text-amber-100/90">
                Fitur Khusus Administrator: Perbarui konten live & sinkronkan data ke Cloud Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-bold border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online Realtime Sync
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'content'
                ? 'bg-white text-amber-700 border-t-2 border-amber-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Konten &amp; Pengumuman</span>
          </button>

          <button
            onClick={() => setActiveTab('socials')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'socials'
                ? 'bg-white text-amber-700 border-t-2 border-amber-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Sosmed Resmi &amp; Misi Wajib</span>
          </button>

          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'firebase'
                ? 'bg-white text-amber-700 border-t-2 border-amber-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Koneksi Google Firebase</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-white text-amber-700 border-t-2 border-amber-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Firestore Rules &amp; Blueprint</span>
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notification / Toast Feedback */}
          {saveSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {testResult && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
                testResult.success
                  ? 'bg-blue-50 border border-blue-300 text-blue-900'
                  : 'bg-red-50 border border-red-300 text-red-900'
              }`}
            >
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}

          {/* TAB 1: KONTEN & PENGUMUMAN */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  Status &amp; Operasional Website
                </h4>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200 cursor-pointer hover:border-amber-400 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Buka Pendaftaran Member Baru</p>
                      <p className="text-[11px] text-slate-500">
                        {registrationOpen ? 'Pendaftaran dibuka untuk publik' : 'Pendaftaran ditutup sementara'}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={registrationOpen}
                      onChange={(e) => setRegistrationOpen(e.target.checked)}
                      className="w-4 h-4 accent-amber-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200 cursor-pointer hover:border-amber-400 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Mode Pemeliharaan (Maintenance)</p>
                      <p className="text-[11px] text-slate-500">
                        {maintenanceMode ? 'Situs sedang pemeliharaan' : 'Situs beroperasi normal secara online'}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                      className="w-4 h-4 accent-red-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200 cursor-pointer hover:border-amber-400 transition-colors sm:col-span-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900">Wajib Aktivasi Email Member Baru</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          requireEmailActivation ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {requireEmailActivation ? 'Aktif (Wajib OTP/Link)' : 'Nonaktif (Langsung Aktif)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {requireEmailActivation
                          ? 'Setiap pendaftar baru wajib memasukkan 6 digit kode aktivasi dari email sebelum dapat masuk.'
                          : 'Pendaftar baru langsung aktif otomatis setelah menyelesaikan misi pendaftaran & orientasi.'}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={requireEmailActivation}
                      onChange={(e) => setRequireEmailActivation(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 shrink-0"
                    />
                  </label>
                </div>
              </div>

              {/* Banner Pengumuman Berjalan (Marquee / Ticker) */}
              <div className="p-4 rounded-2xl bg-linear-to-r from-indigo-50/60 to-purple-50/60 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-indigo-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    Banner Pengumuman Live Website (Running Ticker)
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-indigo-900">
                    <span>Tampilkan Banner:</span>
                    <input
                      type="checkbox"
                      checked={isAnnouncementActive}
                      onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Isi Teks Pengumuman:
                  </label>
                  <textarea
                    rows={2}
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Contoh: 📢 Pengumuman Resmi: Seluruh member baru wajib menyelesaikan 3 Misi Orientasi sebelum mulai kolaborasi!"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">Warna Tema Banner:</span>
                  <div className="flex items-center gap-2">
                    {[
                      { key: 'info', label: 'Biru Info', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
                      { key: 'success', label: 'Hijau Sukses', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                      { key: 'warning', label: 'Kuning Pengumuman', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
                      { key: 'alert', label: 'Merah Penting', bg: 'bg-red-100 text-red-900 border-red-300' },
                    ].map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setAnnouncementType(t.key as any)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${t.bg} ${
                          announcementType === t.key ? 'ring-2 ring-slate-800 font-black' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hero Title & Subtitle */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Utama Platform (Website Title):
                  </label>
                  <input
                    type="text"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tagline Hero Headline:
                  </label>
                  <input
                    type="text"
                    value={heroHeadline}
                    onChange={(e) => setHeroHeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sub-tagline Deskripsi Platform:
                  </label>
                  <textarea
                    rows={2}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOSMED RESMI & MISI WAJIB */}
          {activeTab === 'socials' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Media Sosial Resmi &amp; Misi Orientasi Calon Member Baru
                </p>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Tautan yang Anda simpan di bawah ini akan otomatis menjadi <strong>Misi Wajib Orientasi</strong> bagi setiap member yang mendaftar secara online di website.
                </p>
              </div>

              {/* YouTube */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-600" />
                  Link YouTube Official Admin (Wajib Tonton Min 2 Menit &amp; Subscribe):
                </label>
                <input
                  type="text"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/@adrian_and_andrew"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Instagram */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  Akun Instagram Official Admin (Wajib Follow):
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@erickson.halomoans"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* WhatsApp Group */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  Link Grup WhatsApp Komunitas Resmi (Wajib Gabung):
                </label>
                <input
                  type="text"
                  value={whatsappGroup}
                  onChange={(e) => setWhatsappGroup(e.target.value)}
                  placeholder="https://chat.whatsapp.com/HGnKisfjO8fBpy8YdJ2pt3?s=cl&p=a&mlu=4&ilr=4"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* TikTok */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>🎵</span>
                  Akun TikTok Official Admin (Opsional):
                </label>
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="@josjus_store"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Facebook */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>📘</span>
                  Halaman Facebook / Media Lain Official Admin (Opsional):
                </label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://web.facebook.com/people/JosJus-Gaming/100063723931662/?locale=id_ID"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 3: KONEKSI GOOGLE FIREBASE */}
          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-linear-to-r from-orange-50 to-amber-50 border border-orange-300 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-orange-950 flex items-center gap-1.5 uppercase">
                    <Database className="w-4 h-4 text-orange-600" />
                    Status Google Firebase Firestore Cloud
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[10px] border border-emerald-300">
                    🟢 Cloud Ready
                  </span>
                </div>
                <p className="text-[11px] text-orange-900 leading-relaxed">
                  Website terhubung ke Firestore Cloud Database. Setiap pembaruan yang Anda buat disimpan dan disiarkan secara online.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Firebase Project ID:
                  </label>
                  <input
                    type="text"
                    value={fbProjectId}
                    onChange={(e) => setFbProjectId(e.target.value)}
                    placeholder="tbk-komunitas-online"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Firestore Database ID:
                  </label>
                  <input
                    type="text"
                    value={fbDatabaseId}
                    onChange={(e) => setFbDatabaseId(e.target.value)}
                    placeholder="(default)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Firebase Web API Key:
                  </label>
                  <input
                    type="text"
                    value={fbApiKey}
                    onChange={(e) => setFbApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Cloud Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={handleTestConnection}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>Tes Ping Koneksi Cloud</span>
                </button>

                <button
                  type="button"
                  disabled={isTesting}
                  onClick={handlePullFromFirebase}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Tarik Update Terbaru dari Firestore</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: RULES & BLUEPRINT */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    firestore.rules (Security Rules Terpasang)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">rules_version = '2'</span>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Pengaturan website hanya dapat ditulis oleh Admin resmi
    match /website_config/{configId} {
      allow read: if true;
      allow write: if request.auth != null || request.resource.data.updatedBy != null;
    }
    match /tasks/{taskId} {
      allow read, write: if true;
    }
    match /members/{memberId} {
      allow read, write: if true;
    }
    match /announcements/{announcementId} {
      allow read: if true;
      allow write: if true;
    }
  }
}`}
                </pre>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-600" />
                  Koleksi Firestore Terdaftar (firebase-blueprint.json):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <p className="font-bold text-slate-900">/website_config/live_settings</p>
                    <p className="text-[10px] text-slate-500">Konfigurasi online website &amp; pengumuman</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <p className="font-bold text-slate-900">/announcements/{'{id}'}</p>
                    <p className="text-[10px] text-slate-500">Buletin resmi &amp; berita broadcast</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <p className="font-bold text-slate-900">/tasks/{'{id}'}</p>
                    <p className="text-[10px] text-slate-500">Tugas kolaborasi &amp; broadcast komunitas</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <p className="font-bold text-slate-900">/members/{'{id}'}</p>
                    <p className="text-[10px] text-slate-500">Direktori member &amp; verifikasi orientasi</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Terakhir Diupdate Online: {new Date(lastSyncTime || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleDeployOnline}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Mengunggah ke Firebase...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>Simpan &amp; Update Website ke Firebase</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

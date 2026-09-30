import React, { useState, useEffect } from 'react';
import {
  Database,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  FileJson,
  Trash2,
  Users,
  CheckSquare,
  Sparkles,
  Terminal,
  Activity,
  ArrowRight,
  Flame,
  Radio,
} from 'lucide-react';
import { TeamMember, Task, WebsiteOnlineConfig } from '../types';
import {
  testFirebaseConnection,
  syncAllMembersToFirebase,
  fetchMembersFromFirebase,
  syncAllTasksToFirebase,
  fetchTasksFromFirebase,
  getStoredFirebaseConfig,
} from '../services/firebaseService';
import { getStoredRegisteredMembers, saveRegisteredMemberLocally } from '../lib/memberStorage';
import confetti from 'canvas-confetti';

interface AdminDatabaseSyncViewProps {
  currentUser: TeamMember;
  teamMembers: TeamMember[];
  tasks: Task[];
  websiteConfig: WebsiteOnlineConfig;
  onUpdateTeamMembers: (members: TeamMember[]) => void;
  onUpdateTasks: (tasks: Task[]) => void;
  onOpenFirebaseConfigModal?: () => void;
}

interface LogEntry {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  text: string;
}

export const AdminDatabaseSyncView: React.FC<AdminDatabaseSyncViewProps> = ({
  currentUser,
  teamMembers,
  tasks,
  websiteConfig,
  onUpdateTeamMembers,
  onUpdateTasks,
  onOpenFirebaseConfigModal,
}) => {
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    latencyMs: number;
    message: string;
  }>({
    tested: false,
    success: true,
    latencyMs: 35,
    message: 'Memeriksa status Google Firebase...',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [actionLabel, setActionLabel] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      time: new Date().toLocaleTimeString('id-ID'),
      type: 'info',
      text: 'Sistem Sinkronisasi Manual Admin & Database diinisialisasi.',
    },
    {
      id: 'init-2',
      time: new Date().toLocaleTimeString('id-ID'),
      type: 'info',
      text: `Database lokal memuat ${teamMembers.length} member dan ${tasks.length} tugas aktif.`,
    },
  ]);

  const addLog = (text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString('id-ID'),
        type,
        text,
      },
      ...prev.slice(0, 49),
    ]);
  };

  const fbConfig = getStoredFirebaseConfig();

  // Test connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    addLog('Menguji koneksi ke Google Firebase Cloud Firestore...', 'info');
    const res = await testFirebaseConnection();
    setConnectionStatus({
      tested: true,
      success: res.success,
      latencyMs: res.latencyMs,
      message: res.message,
    });
    addLog(res.message, res.success ? 'success' : 'warning');
  };

  // 1. Sinkronkan Members ke Firebase
  const handleExportMembers = async () => {
    setIsProcessing(true);
    setActionLabel('Mengekspor Member ke Cloud Firebase...');
    addLog(`Memulai upload ${teamMembers.length} data member ke Firestore (/members)...`, 'info');

    try {
      const res = await syncAllMembersToFirebase(teamMembers);
      addLog(res.message, res.success ? 'success' : 'error');
      if (res.success) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } catch (e: any) {
      addLog(`Error saat ekspor member: ${e?.message || 'Gagal'}`, 'error');
    } finally {
      setIsProcessing(false);
      setActionLabel('');
    }
  };

  // 2. Tarik Members dari Firebase
  const handleImportMembers = async () => {
    setIsProcessing(true);
    setActionLabel('Mengimpor Member dari Cloud Firebase...');
    addLog('Menghubungi koleksi /members di Google Firebase Firestore...', 'info');

    try {
      const res = await fetchMembersFromFirebase();
      if (res.success && res.members.length > 0) {
        // Merge with local members
        const map = new Map<string, TeamMember>();
        teamMembers.forEach((m) => map.set(m.id, m));
        res.members.forEach((m) => {
          map.set(m.id, m);
          saveRegisteredMemberLocally(m);
        });

        const merged = Array.from(map.values());
        onUpdateTeamMembers(merged);
        addLog(
          `Berhasil menarik ${res.members.length} member dari Cloud Firestore. Total database lokal kini: ${merged.length} member.`,
          'success'
        );
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else {
        addLog(res.message || 'Tidak ada data member baru di cloud.', 'warning');
      }
    } catch (e: any) {
      addLog(`Error tarik member: ${e?.message || 'Gagal'}`, 'error');
    } finally {
      setIsProcessing(false);
      setActionLabel('');
    }
  };

  // 3. Sinkronkan Tugas ke Firebase
  const handleExportTasks = async () => {
    setIsProcessing(true);
    setActionLabel('Mengekspor Tugas ke Cloud Firebase...');
    addLog(`Mengunggah ${tasks.length} data tugas kolaborasi ke Firestore (/tasks)...`, 'info');

    try {
      const res = await syncAllTasksToFirebase(tasks);
      addLog(res.message, res.success ? 'success' : 'error');
      if (res.success) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } catch (e: any) {
      addLog(`Error saat ekspor tugas: ${e?.message || 'Gagal'}`, 'error');
    } finally {
      setIsProcessing(false);
      setActionLabel('');
    }
  };

  // 4. Tarik Tugas dari Firebase
  const handleImportTasks = async () => {
    setIsProcessing(true);
    setActionLabel('Mengimpor Tugas dari Cloud Firebase...');
    addLog('Menghubungi koleksi /tasks di Google Firebase Firestore...', 'info');

    try {
      const res = await fetchTasksFromFirebase();
      if (res.success && res.tasks.length > 0) {
        const map = new Map<string, Task>();
        tasks.forEach((t) => map.set(t.id, t));
        res.tasks.forEach((t) => map.set(t.id, t));
        const merged = Array.from(map.values());
        onUpdateTasks(merged);
        addLog(`Berhasil menarik ${res.tasks.length} tugas dari Firestore. Total tugas: ${merged.length}.`, 'success');
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else {
        addLog(res.message || 'Tidak ada data tugas di cloud.', 'warning');
      }
    } catch (e: any) {
      addLog(`Error tarik tugas: ${e?.message || 'Gagal'}`, 'error');
    } finally {
      setIsProcessing(false);
      setActionLabel('');
    }
  };

  // 5. Full 2-Way Sync (Parallel Batch Commit for Lightning Speed)
  const handleFullTwoWaySync = async () => {
    setIsProcessing(true);
    setActionLabel('Melakukan Sinkronisasi Penuh 2-Arah Kilat...');
    addLog('=== MEMULAI SINKRONISASI PENUH 2-ARAH CLOUD FIREBASE (MODE KILAT) ===', 'info');

    try {
      // Step A: Push Members & Tasks in parallel
      addLog('Langkah 1/2: Mengunggah data Member & Tugas ke Cloud secara paralel...', 'info');
      const [pushMembersRes, pushTasksRes] = await Promise.all([
        syncAllMembersToFirebase(teamMembers),
        syncAllTasksToFirebase(tasks),
      ]);
      addLog(pushMembersRes.message, pushMembersRes.success ? 'success' : 'warning');
      addLog(pushTasksRes.message, pushTasksRes.success ? 'success' : 'warning');

      // Step B: Pull Remote Members & Tasks in parallel
      addLog('Langkah 2/2: Menarik data terbaru Member & Tugas dari Cloud Firestore...', 'info');
      const [remoteM, remoteT] = await Promise.all([
        fetchMembersFromFirebase(),
        fetchTasksFromFirebase(),
      ]);

      if (remoteM.success && remoteM.members.length > 0) {
        const mapM = new Map<string, TeamMember>();
        teamMembers.forEach((m) => mapM.set(m.id, m));
        remoteM.members.forEach((m) => {
          mapM.set(m.id, m);
          saveRegisteredMemberLocally(m);
        });
        onUpdateTeamMembers(Array.from(mapM.values()));
      }

      if (remoteT.success && remoteT.tasks.length > 0) {
        const mapT = new Map<string, Task>();
        tasks.forEach((t) => mapT.set(t.id, t));
        remoteT.tasks.forEach((t) => mapT.set(t.id, t));
        onUpdateTasks(Array.from(mapT.values()));
      }

      addLog('✅ SINKRONISASI PENUH 2-ARAH SELESAI DENGAN CEPAT & AMAN!', 'success');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (err: any) {
      addLog(`Sinkronisasi penuh mengalami kendala: ${err?.message || 'Error'}`, 'error');
    } finally {
      setIsProcessing(false);
      setActionLabel('');
    }
  };

  // Backup Database to Downloadable JSON
  const handleBackupJson = () => {
    const backupData = {
      version: '2026.1',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser.name,
      websiteConfig,
      teamMembers,
      tasks,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `tbk_database_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addLog('File backup database JSON berhasil diunduh ke komputer Anda.', 'success');
  };

  // Restore Database from JSON file
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.teamMembers && Array.isArray(parsed.teamMembers)) {
          onUpdateTeamMembers(parsed.teamMembers);
          parsed.teamMembers.forEach((m: TeamMember) => saveRegisteredMemberLocally(m));
        }

        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          onUpdateTasks(parsed.tasks);
        }

        addLog(`Database berhasil di-restore dari file: ${file.name}`, 'success');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      } catch (err: any) {
        addLog(`Gagal memuat file JSON backup: ${err?.message || 'Format tidak valid'}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 border-2 border-emerald-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  Admin &amp; Database
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                  Pusat Sinkronisasi Firebase Manual
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Kontrol penuh ekspor, impor, backup, dan sinkronisasi manual ke Google Cloud Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={checkConnection}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Cek Koneksi</span>
            </button>

            {onOpenFirebaseConfigModal && (
              <button
                onClick={onOpenFirebaseConfigModal}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Pengaturan Firebase &amp; Sosmed</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Status & Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Cloud Firebase */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Status Firebase
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connectionStatus.success ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </div>
          <p className="text-base font-black text-slate-900 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>{connectionStatus.success ? 'Terhubung (Online)' : 'Standby Cloud'}</span>
          </p>
          <p className="text-[11px] text-slate-500 font-mono truncate">
            Project: {fbConfig.projectId || 'tbk-komunitas-online'}
          </p>
        </div>

        {/* Total Member */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Data Member Lokal
            </span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-900">{teamMembers.length}</p>
          <p className="text-[11px] text-slate-500">
            {getStoredRegisteredMembers().length} terdaftar permanen di perangkat ini
          </p>
        </div>

        {/* Total Tugas */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Tugas &amp; Kolaborasi
            </span>
            <CheckSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-900">{tasks.length}</p>
          <p className="text-[11px] text-slate-500">
            {tasks.filter((t) => t.status === 'done').length} tugas telah tuntas
          </p>
        </div>

        {/* Latensi Koneksi */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Respon Jaringan
            </span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-900">
            {connectionStatus.latencyMs} <span className="text-xs font-normal">ms</span>
          </p>
          <p className="text-[11px] text-slate-500">Respon Cloud Firestore real-time</p>
        </div>
      </div>

      {/* Processing Loader Indicator */}
      {isProcessing && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
          <span className="text-xs font-bold">{actionLabel}</span>
        </div>
      )}

      {/* Main Operations Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Actions & Sync Tools */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: One-Click Full 2-Way Sync */}
          <div className="p-5 rounded-2xl bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400/60 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Sinkronisasi Penuh 2-Arah (One-Click Full Sync)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 font-bold text-[10px]">
                Rekomendasi
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Otomatis mengunggah seluruh member &amp; tugas lokal ke Firestore, sekaligus menarik data terbaru dari cloud agar seluruh perangkat sinkron secara presisi.
            </p>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleFullTwoWaySync}
              className="w-full py-3 rounded-xl bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-md shadow-emerald-600/20 active:scale-98 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>SINKRONKAN SEMUA KE FIREBASE SEKARANG (2-ARAH)</span>
            </button>
          </div>

          {/* Card 2: Manual Granular Sync Actions */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Tindakan Manual per Koleksi Cloud</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export Member */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExportMembers}
                className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-left transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-indigo-900 mb-1">
                  <CloudUpload className="w-4 h-4 text-indigo-600" />
                  <span>Upload Member ke Cloud</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Kirim {teamMembers.length} member lokal ke Firestore /members
                </p>
              </button>

              {/* Import Member */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleImportMembers}
                className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/70 text-left transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-teal-900 mb-1">
                  <CloudDownload className="w-4 h-4 text-teal-600" />
                  <span>Tarik Member dari Cloud</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Ambil dan gabungkan member yang ada di Firestore /members
                </p>
              </button>

              {/* Export Tasks */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExportTasks}
                className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-left transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900 mb-1">
                  <CloudUpload className="w-4 h-4 text-amber-600" />
                  <span>Upload Tugas ke Cloud</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Kirim {tasks.length} tugas ke Firestore /tasks
                </p>
              </button>

              {/* Import Tasks */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleImportTasks}
                className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-left transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 mb-1">
                  <CloudDownload className="w-4 h-4 text-emerald-600" />
                  <span>Tarik Tugas dari Cloud</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Ambil tugas kolaborasi terbaru dari Firestore /tasks
                </p>
              </button>
            </div>
          </div>

          {/* Card 3: Backup & Restore JSON */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <FileJson className="w-4 h-4 text-slate-700" />
              <span>Backup &amp; Restore Berkas Database (Offline Safety)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Unduh salinan cadangan lengkap seluruh member dan tugas ke format file JSON agar data Anda 100% aman dan bisa dipulihkan kapan saja.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleBackupJson}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Unduh Backup Database (.json)</span>
              </button>

              <label className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Restore Database dari File JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileRestore}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Terminal Sync Log Console */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl flex flex-col h-full min-h-[420px]">
            {/* Terminal Header */}
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-slate-400 font-mono font-bold flex items-center gap-1.5 ml-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Console Log Sinkronisasi</span>
                </span>
              </div>

              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-400 hover:text-white transition-colors"
              >
                Bersihkan Log
              </button>
            </div>

            {/* Terminal Logs */}
            <div className="p-4 font-mono text-[11px] leading-relaxed flex-1 overflow-y-auto space-y-2 text-slate-300">
              {logs.length === 0 ? (
                <p className="text-slate-600 italic">Belum ada aktivitas sinkronisasi.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                    <span
                      className={`break-all ${
                        log.type === 'success'
                          ? 'text-emerald-400 font-bold'
                          : log.type === 'error'
                          ? 'text-red-400 font-bold'
                          : log.type === 'warning'
                          ? 'text-amber-300 font-semibold'
                          : 'text-slate-300'
                      }`}
                    >
                      {log.type === 'success' && '✓ '}
                      {log.type === 'error' && '✕ '}
                      {log.type === 'warning' && '⚠ '}
                      {log.text}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Status: Siap Menerima Perintah</span>
              <span className="text-emerald-400 font-mono">Cloud Firestore Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

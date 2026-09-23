import React from 'react';
import { Wifi, WifiOff, RefreshCw, Database, CloudUpload } from 'lucide-react';

interface OfflineIndicatorProps {
  onlineStatus: 'online' | 'offline' | 'syncing';
  outboxCount: number;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  onFlushSync: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  onlineStatus,
  outboxCount,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  onFlushSync,
}) => {
  return (
    <aside aria-label="Status Jaringan dan Sinkronisasi Data" className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
      {/* Simulation Toggle Pill */}
      <button
        id="btn-toggle-offline-sim"
        onClick={onToggleSimulatedOffline}
        className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 ${
          isSimulatedOffline
            ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
            : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-slate-50'
        }`}
        title="Nyalakan/matikan simulasi offline untuk menguji antrean sinkronisasi lokal"
      >
        {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
        <span>{isSimulatedOffline ? 'Simulasi Offline Aktif' : 'Simulasi Jaringan'}</span>
      </button>

      {/* Sync Badge if items pending */}
      {outboxCount > 0 && (
        <button
          onClick={onFlushSync}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 shadow-lg flex items-center gap-1.5 transition-all"
          title="Klik untuk menyinkronkan antrean ke cloud"
        >
          <CloudUpload className="w-3.5 h-3.5" />
          <span>{outboxCount} Antrean</span>
        </button>
      )}
    </aside>
  );
};

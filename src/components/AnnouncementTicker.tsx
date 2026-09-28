import React from 'react';
import { WebsiteOnlineConfig } from '../types';

interface AnnouncementTickerProps {
  config: WebsiteOnlineConfig;
}

export const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({ config }) => {
  if (!config.isAnnouncementActive || !config.announcementText) return null;

  const bgStyles = {
    info: 'bg-blue-600 text-white',
    success: 'bg-emerald-600 text-white',
    warning: 'bg-amber-500 text-slate-950 font-bold',
    alert: 'bg-red-600 text-white font-bold',
  }[config.announcementType || 'info'];

  return (
    <div className={`w-full py-2 px-4 ${bgStyles} text-xs shadow-xs relative z-40 overflow-hidden`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span className="font-extrabold uppercase tracking-wider text-[10px] bg-black/20 px-2 py-0.5 rounded-full">
            LIVE BROADCAST
          </span>
        </div>
        <p className="truncate font-semibold text-center flex-1">
          {config.announcementText}
        </p>
        <span className="text-[10px] opacity-75 shrink-0 hidden sm:inline">
          Diupdate via Firebase Cloud
        </span>
      </div>
    </div>
  );
};

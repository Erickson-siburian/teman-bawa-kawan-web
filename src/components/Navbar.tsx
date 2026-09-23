import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Calendar,
  Award,
  BarChart3,
  ShieldCheck,
  Wifi,
  WifiOff,
  Bell,
  RefreshCw,
  Sparkles,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { NotificationItem, TeamMember } from '../types';

interface NavbarProps {
  activeTab: 'board' | 'calendar' | 'gamification' | 'analytics' | 'admin_monitor';
  setActiveTab: (tab: 'board' | 'calendar' | 'gamification' | 'analytics' | 'admin_monitor') => void;
  onlineStatus: 'online' | 'offline' | 'syncing';
  outboxCount: number;
  onManualSync: () => void;
  onOpenEncryptionModal?: () => void;
  notifications: NotificationItem[];
  onMarkNotifRead: (id: string) => void;
  onMarkAllNotifsRead: () => void;
  keyFingerprint?: string;
  currentUser: TeamMember;
  allMembers: TeamMember[];
  onSwitchUser: (user: TeamMember) => void;
  onSimulatePeerAction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onlineStatus,
  outboxCount,
  onManualSync,
  notifications,
  onMarkNotifRead,
  onMarkAllNotifsRead,
  currentUser,
  allMembers,
  onSwitchUser,
  onSimulatePeerAction,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo TBK"
              className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-amber-400/50 bg-amber-50"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Teman Bawa Kawan</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  TBK
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Saling Support Pegiat Medsos Demi Monetisasi
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            <button
              id="nav-tab-board"
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'board'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Konten & Tugas
            </button>
            <button
              id="nav-tab-calendar"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Kalender Editorial
            </button>
            <button
              id="nav-tab-gamification"
              onClick={() => setActiveTab('gamification')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'gamification'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4" />
              Member Aktif
            </button>
            <button
              id="nav-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analitik Monetisasi
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time Peer Collaboration Demo Trigger */}
            <button
              id="btn-simulate-peer"
              onClick={onSimulatePeerAction}
              title="Simulasikan aksi kolaboratif kawan tim secara real-time"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Simulasi Kawan</span>
            </button>

            {/* Sync & Online Status Pill */}
            <button
              id="btn-sync-status"
              onClick={onManualSync}
              title={
                onlineStatus === 'online'
                  ? 'Cloud Tersinkronisasi Real-Time (Klik untuk sinkronkan ulang)'
                  : onlineStatus === 'syncing'
                  ? 'Sedang Menyinkronkan ke Cloud...'
                  : `Mode Offline Aktif (${outboxCount} antrean). Klik untuk menyinkronkan.`
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                onlineStatus === 'online'
                  ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  : onlineStatus === 'syncing'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
              }`}
            >
              {onlineStatus === 'online' ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : onlineStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span className="hidden sm:inline">Sinkronisasi...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                  <span>Offline ({outboxCount})</span>
                </>
              )}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                id="btn-notifications"
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div
                  id="notifications-popover"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-slate-800">Notifikasi Otomatis</h4>
                      {unreadNotifs.length > 0 && (
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          {unreadNotifs.length} baru
                        </span>
                      )}
                    </div>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={onMarkAllNotifsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-slate-400">Belum ada notifikasi.</p>
                    ) : (
                      notifications.slice(0, 8).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => onMarkNotifRead(notif.id)}
                          className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            notif.read ? 'bg-slate-50 text-slate-600' : 'bg-indigo-50/70 border border-indigo-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-semibold">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active User Avatar & Switcher */}
            <div className="relative">
              <button
                id="btn-user-profile"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-indigo-600 font-medium">{currentUser.levelTitle}</p>
                </div>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                  referrerPolicy="no-referrer"
                />
              </button>

              {showUserMenu && (
                <div
                  id="user-switch-menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="p-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                    <div className="mt-2 flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-600">Kode Referal:</span>
                      <span className="font-mono font-bold text-indigo-600">{currentUser.referralCode}</span>
                    </div>
                  </div>

                  <div className="mt-2">
                    {currentUser.userType === 'admin' ? (
                      <>
                        <p className="text-[10px] font-semibold text-amber-700 px-2 py-1 flex items-center gap-1">
                          <span>👑</span> AKSES ADMIN - GANTI USER:
                        </p>
                        {allMembers.map((member) => (
                          <button
                            key={member.id}
                            onClick={() => {
                              onSwitchUser(member);
                              setShowUserMenu(false);
                            }}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors ${
                              member.id === currentUser.id
                                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-6 h-6 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">{member.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                            </div>
                            {member.id === currentUser.id && <UserCheck className="w-4 h-4 text-indigo-600" />}
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="p-2.5 bg-slate-50 rounded-lg text-center space-y-1">
                        <p className="text-xs font-bold text-slate-700">Akun Member Terverifikasi</p>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Privasi Anda terlindungi. Fitur pergantian akun hanya dapat digunakan oleh administrator resmi.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
              activeTab === 'board' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Papan
          </button>
          {currentUser.userType === 'admin' && (
            <button
              onClick={() => setActiveTab('admin_monitor')}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
                activeTab === 'admin_monitor' ? 'text-amber-600 font-bold' : 'text-amber-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Monitor
            </button>
          )}
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
              activeTab === 'calendar' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Kalender
          </button>
          <button
            onClick={() => setActiveTab('gamification')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
              activeTab === 'gamification' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Award className="w-4 h-4" />
            Member Aktif
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
              activeTab === 'analytics' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analitik
          </button>
        </div>
      </div>
    </header>
  );
};

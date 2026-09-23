import React, { useState } from 'react';
import {
  Home,
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
  UserCheck,
  Plus,
  Menu,
  X,
  Flame,
  ChevronDown,
} from 'lucide-react';
import { Logo } from './Logo';
import { NotificationItem, TeamMember } from '../types';

interface SidebarProps {
  activeTab: 'landing' | 'board' | 'calendar' | 'gamification' | 'analytics';
  setActiveTab: (tab: 'landing' | 'board' | 'calendar' | 'gamification' | 'analytics') => void;
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
  onOpenNewTaskModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
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
  onOpenNewTaskModal,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const navItems = [
    {
      id: 'landing' as const,
      label: 'Halaman Depan',
      icon: Home,
      desc: 'Beranda & Showcase Sinergi',
    },
    {
      id: 'board' as const,
      label: 'Konten & Tugas',
      icon: CheckCircle2,
      desc: 'Papan Kanban Kolaborasi',
    },
    {
      id: 'calendar' as const,
      label: 'Kalender Editorial',
      icon: Calendar,
      desc: 'Jadwal & Prime Time',
    },
    {
      id: 'gamification' as const,
      label: 'Member Aktif',
      icon: UserCheck,
      badge: `${allMembers.length} Member`,
      desc: 'Direktori & Rekap Anggota',
    },
    {
      id: 'analytics' as const,
      label: 'Dashboard Trend',
      icon: BarChart3,
      desc: 'Tren Sosmed & Interaksi',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header with New Logo */}
      <div className="p-4 sm:p-5 border-b border-slate-100">
        <div
          onClick={() => {
            setActiveTab('landing');
            setMobileOpen(false);
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Ke Halaman Depan"
        >
          <div className="relative shrink-0">
            <Logo size="md" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" title="Online" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-black text-lg text-slate-900 tracking-tight leading-tight group-hover:text-emerald-700 transition-colors">
              Teman <span className="text-amber-500 font-extrabold">bawa</span> Kawan
            </h1>
          </div>
        </div>

        {/* Quick Add Task Button */}
        {onOpenNewTaskModal && (
          <button
            id="sidebar-btn-new-task"
            onClick={() => {
              onOpenNewTaskModal();
              setMobileOpen(false);
            }}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tugas Kolaborasi Baru</span>
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Navigasi
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs border border-indigo-100/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs truncate">{item.label}</p>
                  <p className="text-[10px] text-slate-400 font-normal truncate">{item.desc}</p>
                </div>
              </div>
              {item.badge && (
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Tools & System Status Section */}
        <div className="pt-4 mt-3 border-t border-slate-100 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Sinergi & Sistem
          </p>

          {/* Cloud Sync Status */}
          <button
            id="sidebar-btn-sync"
            onClick={onManualSync}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs border transition-colors ${
              onlineStatus === 'online'
                ? 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                : onlineStatus === 'syncing'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
            }`}
          >
            <div className="flex items-center gap-2">
              {onlineStatus === 'online' ? (
                <Wifi className="w-4 h-4 text-emerald-600" />
              ) : onlineStatus === 'syncing' ? (
                <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
              ) : (
                <WifiOff className="w-4 h-4 text-rose-600" />
              )}
              <span className="font-medium text-xs">
                {onlineStatus === 'online'
                  ? 'Cloud Online'
                  : onlineStatus === 'syncing'
                  ? 'Menyinkronkan...'
                  : `Offline (${outboxCount})`}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Sync</span>
          </button>

          {/* Simulate Peer Activity */}
          <button
            id="sidebar-btn-simulate-peer"
            onClick={onSimulatePeerAction}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-amber-800 bg-amber-50/70 border border-amber-200/60 hover:bg-amber-100/70 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">Simulasi Aksi Kawan</span>
          </button>

          {/* Notifications Toggle */}
          <div className="relative">
            <button
              id="sidebar-btn-notifications"
              onClick={() => setShowNotifs(!showNotifs)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                showNotifs
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-600" />
                <span>Notifikasi</span>
              </div>
              {unreadNotifs.length > 0 ? (
                <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full animate-bounce">
                  {unreadNotifs.length} baru
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">{notifications.length}</span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifs && (
              <div
                id="sidebar-notifications-popover"
                className="absolute left-0 bottom-full mb-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-xs text-slate-800">Notifikasi Otomatis</h4>
                    {unreadNotifs.length > 0 && (
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
                        {unreadNotifs.length}
                      </span>
                    )}
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={onMarkAllNotifsRead}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400">Belum ada notifikasi.</p>
                  ) : (
                    notifications.slice(0, 6).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => onMarkNotifRead(notif.id)}
                        className={`p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          notif.read ? 'bg-slate-50 text-slate-600' : 'bg-indigo-50/70 border border-indigo-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-semibold text-[11px]">{notif.title}</span>
                          <span className="text-[9px] text-slate-400 shrink-0">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="mt-0.5 text-slate-600 text-[10px] leading-relaxed">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Card & Switcher at Bottom */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60 relative">
        <button
          id="sidebar-btn-user"
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-xs transition-all text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-medium">
                <span>{currentUser.levelTitle}</span>
                <span className="flex items-center gap-0.5 text-amber-600">
                  <Flame className="w-3 h-3 fill-amber-500" />
                  {currentUser.streak}h
                </span>
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        {/* User Switcher Dropdown */}
        {showUserMenu && (
          <div
            id="sidebar-user-switch-menu"
            className="absolute left-3 right-3 bottom-full mb-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-2 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500">{currentUser.email}</p>
              <div className="mt-1.5 flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded-lg">
                <span className="text-slate-600">Kode Referal:</span>
                <span className="font-mono font-bold text-indigo-600">{currentUser.referralCode}</span>
              </div>
            </div>

            <div className="mt-2 max-h-48 overflow-y-auto">
              <p className="text-[10px] font-semibold text-slate-400 px-2 py-1">GANTI SUDUT PANDANG KAWAN:</p>
              {allMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => {
                    onSwitchUser(member);
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left text-xs transition-colors ${
                    member.id === currentUser.id
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs">{member.name}</p>
                    <p className="text-[9px] text-slate-400 truncate">{member.role}</p>
                  </div>
                  {member.id === currentUser.id && <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <button
            id="mobile-sidebar-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div
            onClick={() => {
              setActiveTab('landing');
              setMobileOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Logo size="sm" />
            <div>
              <h1 className="font-black text-sm text-slate-900 leading-tight">
                Teman <span className="text-amber-500">bawa</span> Kawan
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenNewTaskModal && (
            <button
              onClick={onOpenNewTaskModal}
              className="p-1.5 rounded-lg bg-indigo-600 text-white text-xs"
              title="Buat Tugas"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar (Permanent Fixed Left) */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide in) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

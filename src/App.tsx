import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { LandingHeroView } from './components/LandingHeroView';
import { TaskBoard } from './components/TaskBoard';
import { TaskModal } from './components/TaskModal';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { CalendarView } from './components/CalendarView';
import { GamificationView } from './components/GamificationView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdminProgressMonitor } from './components/AdminProgressMonitor';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthRegistrationModal } from './components/AuthRegistrationModal';
import { AdminOfficialSocialsModal } from './components/AdminOfficialSocialsModal';
import { PostRegisterOrientationModal } from './components/PostRegisterOrientationModal';
import { EditMemberModal } from './components/EditMemberModal';
import { DeleteMemberConfirmModal } from './components/DeleteMemberConfirmModal';
import { CommunityBroadcastTaskModal } from './components/CommunityBroadcastTaskModal';
import { AdminFirebaseOnlineManagerModal } from './components/AdminFirebaseOnlineManagerModal';
import { AdminAccessGateModal } from './components/AdminAccessGateModal';
import { AnnouncementTicker } from './components/AnnouncementTicker';
import {
  NotificationItem,
  ReferralRecord,
  Task,
  TaskStatus,
  TeamMember,
  MemberSocialAccounts,
  WebsiteOnlineConfig,
  SocialFollowProof,
} from './types';
import { syncManager } from './lib/syncManager';
import { playTaskDoneChime, playLevelUpFanfare, playNotificationTone } from './lib/audio';
import { initialTeamMembers, initialTasks, initialNotifications, initialReferrals } from './data/initialData';
import { getStoredWebsiteConfig, subscribeToWebsiteConfigOnline } from './services/firebaseService';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'board' | 'calendar' | 'gamification' | 'analytics' | 'admin_monitor'>('landing');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [isAdminSocialsModalOpen, setIsAdminSocialsModalOpen] = useState(false);
  const [isAdminFirebaseModalOpen, setIsAdminFirebaseModalOpen] = useState(false);
  const [isAdminAccessGateOpen, setIsAdminAccessGateOpen] = useState(false);
  const [isOrientationModalOpen, setIsOrientationModalOpen] = useState(false);
  const [orientationMember, setOrientationMember] = useState<TeamMember | null>(null);

  // Live Website Config & Google Firebase State
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteOnlineConfig>(getStoredWebsiteConfig());

  // Community Broadcast Task & Calendar Selection States
  const [isBroadcastTaskModalOpen, setIsBroadcastTaskModalOpen] = useState(false);
  const [broadcastTaskCreator, setBroadcastTaskCreator] = useState<TeamMember | undefined>(undefined);
  const [selectedMemberIdForCalendar, setSelectedMemberIdForCalendar] = useState<string | null>(null);

  // Edit & Delete Member States
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] = useState(false);

  const [officialAdminSocials, setOfficialAdminSocials] = useState<MemberSocialAccounts>(
    websiteConfig.officialSocials || {
      instagram: '@adrian_andrew.id',
      youtube: 'https://youtube.com/@adrian_andrew.id',
      tiktok: '@adrianandrew_tiktok',
      facebook: 'Adrian Andrew ID',
      whatsappGroup: 'https://chat.whatsapp.com/TBKOfficialCommunity',
    }
  );

  // Default currentUser is a regular member (user-2: Siti Rahmawati, userType: 'user')
  const [currentUser, setCurrentUser] = useState<TeamMember>(initialTeamMembers[0]);

  const [onlineStatus, setOnlineStatus] = useState<'online' | 'offline' | 'syncing'>(
    syncManager.isOnline() ? 'online' : 'offline'
  );
  const [outboxCount, setOutboxCount] = useState<number>(syncManager.getOutboxCount());
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(syncManager.getIsSimulatedOffline());

  // Modals & Drawers
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalInitialStatus, setTaskModalInitialStatus] = useState<TaskStatus>('todo');

  // Stabilize mutable state references to prevent infinite render loops
  const currentUserIdRef = useRef(currentUser.id);
  currentUserIdRef.current = currentUser.id;

  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  // Fetch initial data or use cached
  const loadInitialData = useCallback(async () => {
    // Check cached data first for instant render, fallback to initial default data
    const cachedTasks = syncManager.getCachedTasks();
    const cachedTeam = syncManager.getCachedTeam();
    const cachedNotifs = syncManager.getCachedNotifs();

    const activeTasks = cachedTasks && cachedTasks.length > 0 ? cachedTasks : initialTasks;
    const rawTeam = cachedTeam && cachedTeam.length > 0 ? cachedTeam : initialTeamMembers;
    // Ensure deleted admin account is pruned from any cached browser storage
    const activeTeam = rawTeam.filter(
      (m: TeamMember) => m.id !== 'user-1' && m.email.toLowerCase() !== 'haihaihai9191@gmail.com'
    );

    // Ensure member_joined notifications are included even if cachedNotifs exists
    const baseNotifs = cachedNotifs && cachedNotifs.length > 0 ? [...cachedNotifs] : [...initialNotifications];
    initialNotifications.forEach((initN) => {
      if (!baseNotifs.some((n) => n.id === initN.id)) {
        baseNotifs.unshift(initN);
      }
    });
    const activeNotifs = baseNotifs;

    setTasks(activeTasks);
    setTeamMembers(activeTeam);
    setNotifications(activeNotifs);
    setReferrals(initialReferrals);

    const matched = activeTeam.find((m) => m.id === currentUserIdRef.current);
    if (matched) setCurrentUser(matched);

    // Save defaults to cache if not already set
    if (!cachedTasks || cachedTasks.length === 0) syncManager.setCachedTasks(activeTasks);
    syncManager.setCachedTeam(activeTeam);
    if (!cachedNotifs || cachedNotifs.length === 0) syncManager.setCachedNotifs(activeNotifs);

    // If online, attempt to fetch fresh data from server
    if (syncManager.isOnline()) {
      try {
        const [tasksRes, teamRes, notifRes, refRes, officialRes] = await Promise.all([
          fetch('/api/tasks').then((r) => r.json()).catch(() => null),
          fetch('/api/team').then((r) => r.json()).catch(() => null),
          fetch('/api/notifications').then((r) => r.json()).catch(() => null),
          fetch('/api/referrals').then((r) => r.json()).catch(() => null),
          fetch('/api/admin/official-socials').then((r) => r.json()).catch(() => null),
        ]);

        if (tasksRes && tasksRes.success) {
          setTasks(tasksRes.tasks);
          syncManager.setCachedTasks(tasksRes.tasks);
        }
        if (teamRes && teamRes.success) {
          const normalizedServerTeam = teamRes.teamMembers.filter(
            (m: TeamMember) => m.id !== 'user-1' && m.email.toLowerCase() !== 'haihaihai9191@gmail.com'
          );
          setTeamMembers(normalizedServerTeam);
          syncManager.setCachedTeam(normalizedServerTeam);
          const matchedUser = normalizedServerTeam.find((m: TeamMember) => m.id === currentUserIdRef.current);
          if (matchedUser) setCurrentUser(matchedUser);
        }
        if (notifRes && notifRes.success) {
          setNotifications(notifRes.notifications);
          syncManager.setCachedNotifs(notifRes.notifications);
        }
        if (refRes && refRes.success) {
          setReferrals(refRes.referrals);
        }
        if (officialRes && officialRes.success && officialRes.socialAccounts) {
          setOfficialAdminSocials(officialRes.socialAccounts);
        }
      } catch (err) {
        console.warn('Backend API tidak tersambung (mode static/offline Vercel), menggunakan penyimpanan lokal.', err);
      }
    }
  }, []);

  useEffect(() => {
    loadInitialData();

    // Listen to network status changes
    const unsubStatus = syncManager.onStatusChange((status) => {
      setOnlineStatus(status);
      setOutboxCount(syncManager.getOutboxCount());
    });

    // Listen to real-time events (SSE & BroadcastChannel)
    const unsubData = syncManager.onDataEvent((type, data) => {
      if (type === 'task_created') {
        setTasks((prev) => {
          if (prev.some((t) => t.id === data.id)) return prev;
          const updated = [data, ...prev];
          syncManager.setCachedTasks(updated);
          return updated;
        });
      } else if (type === 'task_updated') {
        setTasks((prev) => {
          const updated = prev.map((t) => (t.id === data.id ? data : t));
          syncManager.setCachedTasks(updated);
          return updated;
        });
        setSelectedTask((prev) => (prev?.id === data.id ? data : prev));
      } else if (type === 'task_deleted') {
        setTasks((prev) => {
          const updated = prev.filter((t) => t.id !== data.id);
          syncManager.setCachedTasks(updated);
          return updated;
        });
        setSelectedTask((prev) => (prev?.id === data.id ? null : prev));
      } else if (type === 'team_updated') {
        setTeamMembers(data);
        syncManager.setCachedTeam(data);
        const me = data.find((m: TeamMember) => m.id === currentUserIdRef.current);
        if (me) setCurrentUser(me);
      } else if (type === 'notification_added') {
        setNotifications((prev) => {
          const updated = [data, ...prev];
          syncManager.setCachedNotifs(updated);
          return updated;
        });
        playNotificationTone();
      } else if (type === 'sync_completed') {
        if (data.tasks) {
          setTasks(data.tasks);
          syncManager.setCachedTasks(data.tasks);
        }
        if (data.teamMembers) {
          setTeamMembers(data.teamMembers);
          syncManager.setCachedTeam(data.teamMembers);
        }
        setOutboxCount(syncManager.getOutboxCount());
      }
    });

    return () => {
      unsubStatus();
      unsubData();
    };
  }, [loadInitialData]);

  // Periodic deadline checker (isolated in its own timer effect)
  useEffect(() => {
    const deadlineChecker = setInterval(() => {
      const now = Date.now();
      tasksRef.current.forEach((t) => {
        if (t.status !== 'done') {
          const due = new Date(t.dueDate).getTime();
          const diffHours = (due - now) / (1000 * 60 * 60);
          if (diffHours > 0 && diffHours <= 2) {
            // Urgent deadline alert
            const alertNotif: NotificationItem = {
              id: `notif-urgent-${t.id}`,
              title: '⏰ Deadline Segera Berakhir!',
              message: `Tugas "${t.title}" tersisa kurang dari 2 jam! Selesaikan bersama Kawan tepat waktu.`,
              type: 'deadline',
              read: false,
              createdAt: new Date().toISOString(),
            };
            setNotifications((prev) => {
              if (prev.some((n) => n.id === alertNotif.id)) return prev;
              playNotificationTone();
              return [alertNotif, ...prev];
            });
          }
        }
      });
    }, 30000);

    // Subscribe to Google Firebase Firestore website config online
    const unsubFirebase = subscribeToWebsiteConfigOnline((liveConfig) => {
      setWebsiteConfig(liveConfig);
      if (liveConfig.officialSocials) {
        setOfficialAdminSocials(liveConfig.officialSocials);
      }
    });

    return () => {
      clearInterval(deadlineChecker);
      unsubFirebase();
    };
  }, []);

  // Create Task (including Community Broadcast Task)
  const handleCreateTask = async (taskData: Partial<Task>) => {
    const isBroadcast = !!taskData.assignedToAll || taskData.assigneeId === 'all';
    const creatorUser = taskData.creatorId
      ? teamMembers.find((m) => m.id === taskData.creatorId) || currentUser
      : currentUser;

    const newTask: Task = {
      id: taskData.id || `task-${Date.now()}`,
      title: taskData.title || 'Tugas TBK',
      description: taskData.description || '',
      isEncrypted: !!taskData.isEncrypted,
      encryptedData: taskData.encryptedData,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      creatorId: creatorUser.id,
      creatorName: creatorUser.name,
      creatorAvatar: creatorUser.avatar,
      assigneeId: isBroadcast ? 'all' : taskData.assigneeId || currentUser.id,
      assigneeName: isBroadcast ? 'Seluruh Peserta TBK' : taskData.assigneeName || currentUser.name,
      assigneeAvatar: isBroadcast ? undefined : taskData.assigneeAvatar || currentUser.avatar,
      buddyId: taskData.buddyId,
      buddyName: taskData.buddyName,
      buddyAvatar: taskData.buddyAvatar,
      dueDate: taskData.dueDate || new Date(Date.now() + 86400000 * 2).toISOString(),
      category: taskData.category || 'development',
      tags: taskData.tags || ['TBK'],
      subtasks: taskData.subtasks || [],
      comments: [],
      referralCodeUsed: taskData.referralCodeUsed,
      mediaLink: taskData.mediaLink,
      platform: taskData.platform,
      monetizationGoal: taskData.monetizationGoal,
      isOfficialMandatory: !!taskData.isOfficialMandatory,
      assignedToAll: isBroadcast,
      completedByMemberIds: taskData.completedByMemberIds || [],
      communityTaskType: taskData.communityTaskType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: syncManager.isOnline() ? 'synced' : 'pending_sync',
    };

    // Optimistic UI update
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      syncManager.setCachedTasks(updated);
      return updated;
    });

    // Create notification if broadcasted to all members
    if (newTask.assignedToAll) {
      const broadcastNotif: NotificationItem = {
        id: `notif-broadcast-${Date.now()}`,
        title: `📢 Tugas Saling Support dari ${newTask.creatorName}`,
        message: `Member ${newTask.creatorName} mengajak seluruh peserta: "${newTask.title}". Tonton/follow untuk saling support!`,
        type: 'community_task',
        read: false,
        createdAt: new Date().toISOString(),
        taskId: newTask.id,
        memberId: newTask.creatorId,
      };
      setNotifications((prev) => [broadcastNotif, ...prev]);
      playNotificationTone();
    }

    if (syncManager.isOnline()) {
      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask),
        });
      } catch (e) {
        syncManager.queueAction('create', newTask.id, newTask);
        setOutboxCount(syncManager.getOutboxCount());
      }
    } else {
      syncManager.queueAction('create', newTask.id, newTask);
      setOutboxCount(syncManager.getOutboxCount());
    }
  };

  // Update Task Status
  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const isNewlyCompleted = newStatus === 'done' && targetTask.status !== 'done';
    const dueTimestamp = new Date(targetTask.dueDate).getTime();
    const isOnTime = Date.now() <= dueTimestamp;

    let xpGained = 0;
    if (isNewlyCompleted) {
      xpGained = 50;
      if (isOnTime) xpGained += 30;
      if (targetTask.buddyId) xpGained += 40;

      playTaskDoneChime();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    const updatedTask: Task = {
      ...targetTask,
      status: newStatus,
      completedAt: isNewlyCompleted ? new Date().toISOString() : targetTask.completedAt,
      onTime: isNewlyCompleted ? isOnTime : targetTask.onTime,
      xpAwarded: isNewlyCompleted ? xpGained : targetTask.xpAwarded,
      updatedAt: new Date().toISOString(),
    };

    // Update state optimistically
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? updatedTask : t));
      syncManager.setCachedTasks(updated);
      return updated;
    });
    setSelectedTask((prev) => (prev?.id === taskId ? updatedTask : prev));

    // Update currentUser XP if this is current user
    if (isNewlyCompleted && targetTask.assigneeId === currentUser.id) {
      setCurrentUser((prev) => ({
        ...prev,
        xp: prev.xp + xpGained,
        completedTasksCount: prev.completedTasksCount + 1,
        streak: isOnTime ? prev.streak + 1 : prev.streak,
        level: Math.max(1, Math.floor((prev.xp + xpGained) / 350) + 1),
      }));
    }

    if (syncManager.isOnline()) {
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (e) {
        syncManager.queueAction('update', taskId, { status: newStatus });
        setOutboxCount(syncManager.getOutboxCount());
      }
    } else {
      syncManager.queueAction('update', taskId, { status: newStatus });
      setOutboxCount(syncManager.getOutboxCount());
    }
  };

  // Toggle Subtask
  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s));

    const updatedTask: Task = {
      ...task,
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? updatedTask : t));
      syncManager.setCachedTasks(updated);
      return updated;
    });
    setSelectedTask(updatedTask);

    if (syncManager.isOnline()) {
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subtasks: updatedSubtasks }),
        });
      } catch {
        syncManager.queueAction('update', taskId, { subtasks: updatedSubtasks });
        setOutboxCount(syncManager.getOutboxCount());
      }
    } else {
      syncManager.queueAction('update', taskId, { subtasks: updatedSubtasks });
      setOutboxCount(syncManager.getOutboxCount());
    }
  };

  // Add Comment
  const handleAddComment = async (taskId: string, text: string) => {
    const newComment = {
      id: `comm-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text,
      createdAt: new Date().toISOString(),
    };

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask: Task = {
      ...task,
      comments: [...task.comments, newComment],
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? updatedTask : t));
      syncManager.setCachedTasks(updated);
      return updated;
    });
    setSelectedTask(updatedTask);

    if (syncManager.isOnline()) {
      try {
        await fetch(`/api/tasks/${taskId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newComment),
        });
      } catch {
        syncManager.queueAction('comment', taskId, newComment);
        setOutboxCount(syncManager.getOutboxCount());
      }
    } else {
      syncManager.queueAction('comment', taskId, newComment);
      setOutboxCount(syncManager.getOutboxCount());
    }
  };

  // Assign Buddy
  const handleAssignBuddy = async (taskId: string, buddyId: string) => {
    const buddy = teamMembers.find((m) => m.id === buddyId);
    if (!buddy) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask: Task = {
      ...task,
      buddyId: buddy.id,
      buddyName: buddy.name,
      buddyAvatar: buddy.avatar,
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? updatedTask : t));
      syncManager.setCachedTasks(updated);
      return updated;
    });
    setSelectedTask((prev) => (prev?.id === taskId ? updatedTask : prev));

    // Sound chime and notification
    playNotificationTone();

    if (syncManager.isOnline()) {
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buddyId: buddy.id,
            buddyName: buddy.name,
            buddyAvatar: buddy.avatar,
          }),
        });
      } catch {
        syncManager.queueAction('update', taskId, {
          buddyId: buddy.id,
          buddyName: buddy.name,
          buddyAvatar: buddy.avatar,
        });
        setOutboxCount(syncManager.getOutboxCount());
      }
    } else {
      syncManager.queueAction('update', taskId, {
        buddyId: buddy.id,
        buddyName: buddy.name,
        buddyAvatar: buddy.avatar,
      });
      setOutboxCount(syncManager.getOutboxCount());
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      syncManager.setCachedTasks(updated);
      return updated;
    });
    setSelectedTask(null);

    if (syncManager.isOnline()) {
      try {
        await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      } catch {
        syncManager.queueAction('delete', taskId, null);
        setOutboxCount(syncManager.getOutboxCount());
      }
    } else {
      syncManager.queueAction('delete', taskId, null);
      setOutboxCount(syncManager.getOutboxCount());
    }
  };

  // Update Full Task
  const handleUpdateTask = async (updatedTask: Task) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      syncManager.setCachedTasks(updated);
      return updated;
    });
    setSelectedTask((prev) => (prev?.id === updatedTask.id ? updatedTask : prev));

    if (syncManager.isOnline()) {
      try {
        await fetch(`/api/tasks/${updatedTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
        });
      } catch {
        syncManager.queueAction('update', updatedTask.id, updatedTask);
        setOutboxCount(syncManager.getOutboxCount());
      }
    } else {
      syncManager.queueAction('update', updatedTask.id, updatedTask);
      setOutboxCount(syncManager.getOutboxCount());
    }
  };

  // Update Admin Official Sosmed & Mandatory Onboarding Task
  const handleUpdateAdminOfficialSosmed = async (
    socialAccounts: MemberSocialAccounts,
    createMandatoryTask: boolean
  ) => {
    setOfficialAdminSocials(socialAccounts);

    const updatedUser: TeamMember = {
      ...currentUser,
      socialAccounts,
    };
    setCurrentUser(updatedUser);
    setTeamMembers((prev) => prev.map((m) => (m.id === currentUser.id ? updatedUser : m)));
    syncManager.setCachedTeam(
      teamMembers.map((m) => (m.id === currentUser.id ? updatedUser : m))
    );

    // Save to central server official socials endpoint
    if (syncManager.isOnline()) {
      try {
        const res = await fetch('/api/admin/official-socials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            socialAccounts,
            enableMandatoryTask: createMandatoryTask,
          }),
        });
        const data = await res.json();
        if (data.success) {
          // Fetch updated tasks and team to sync state
          const [tasksRes, teamRes] = await Promise.all([
            fetch('/api/tasks').then((r) => r.json()).catch(() => null),
            fetch('/api/team').then((r) => r.json()).catch(() => null),
          ]);
          if (tasksRes && tasksRes.success) {
            setTasks(tasksRes.tasks);
            syncManager.setCachedTasks(tasksRes.tasks);
          }
          if (teamRes && teamRes.success) {
            setTeamMembers(teamRes.teamMembers);
            syncManager.setCachedTeam(teamRes.teamMembers);
          }
        }
      } catch (e) {
        console.warn('Gagal simpan sosmed admin ke server:', e);
      }
    }
  };

  // Quick Verify Member by Admin
  const handleVerifyMember = async (memberId: string) => {
    try {
      const res = await fetch(`/api/admin/verify-member/${memberId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        if (data.member) {
          setTeamMembers((prev) => prev.map((m) => (m.id === memberId ? data.member : m)));
          syncManager.setCachedTeam(
            teamMembers.map((m) => (m.id === memberId ? data.member : m))
          );
        }
        if (data.tasks) {
          setTasks(data.tasks);
          syncManager.setCachedTasks(data.tasks);
        }
        playTaskDoneChime();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (e) {
      console.warn('Gagal verifikasi member:', e);
    }
  };

  // Manual Trigger Sync
  const handleManualSync = async () => {
    setOnlineStatus('syncing');
    const result = await syncManager.flushOutbox();
    if (result.success) {
      await loadInitialData();
      setOnlineStatus(syncManager.isOnline() ? 'online' : 'offline');
    }
  };

  // Toggle Simulated Offline
  const handleToggleSimulatedOffline = () => {
    const nextVal = !isSimulatedOffline;
    setIsSimulatedOffline(nextVal);
    syncManager.setSimulatedOffline(nextVal);
    setOnlineStatus(nextVal ? 'offline' : 'online');
  };

  // Simulate Peer Action (Live real-time collaborative activity)
  const handleSimulatePeerAction = async () => {
    try {
      const actions = ['buddy_checkoff', 'cheer_comment'];
      const actionType = actions[Math.floor(Math.random() * actions.length)];

      const res = await fetch('/api/simulate-peer-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType }),
      });
      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
        syncManager.setCachedTasks(data.tasks);
        playNotificationTone();
      }
    } catch {
      // Local fallback simulation
      const buddyUser = teamMembers[1] || teamMembers[0];
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: '👥 Aktivitas Kawan TBK!',
        message: `${buddyUser.name} menyelesaikan sub-tugas dan menyemangati tim!`,
        type: 'buddy_invite',
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
      playNotificationTone();
    }
  };

  // Redeem Reward Shop
  const handleRedeemReward = (rewardName: string, cost: number) => {
    setCurrentUser((prev) => ({
      ...prev,
      referralPoints: Math.max(0, prev.referralPoints - cost),
    }));
  };

  // Notification read actions
  const handleMarkNotifRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (syncManager.isOnline()) {
      fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    }
  };

  const handleMarkAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (syncManager.isOnline()) {
      fetch('/api/notifications/read-all', { method: 'POST' });
    }
  };

  // Handle Notification selection (Synchronized with Editorial Calendar & Task Board)
  const handleSelectNotification = (notif: NotificationItem) => {
    if (notif.type === 'member_joined' && notif.memberId) {
      setSelectedMemberIdForCalendar(notif.memberId);
      setActiveTab('calendar');
    } else if (notif.type === 'community_task' && notif.taskId) {
      const target = tasks.find((t) => t.id === notif.taskId);
      if (target) {
        setSelectedTask(target);
        setActiveTab('board');
      }
    }
  };

  // Member Edit & Delete Handlers (User Request 3)
  const handleOpenEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setIsEditMemberModalOpen(true);
  };

  const handleSaveEditedMember = async (updated: TeamMember) => {
    try {
      const res = await fetch(`/api/team/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.teamMembers) {
          setTeamMembers(data.teamMembers);
          syncManager.setCachedTeam(data.teamMembers);
        }
      }
    } catch (e) {
      console.warn('Gagal simpan edit member ke server:', e);
    }

    setTeamMembers((prev) => {
      const next = prev.map((m) => (m.id === updated.id ? updated : m));
      syncManager.setCachedTeam(next);
      return next;
    });

    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
    }

    const editNotif: NotificationItem = {
      id: `notif-edit-${Date.now()}`,
      title: '✏️ Data Member Diperbarui',
      message: `Data member ${updated.name} (${updated.email}) berhasil diperbarui.`,
      type: 'task_done',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [editNotif, ...prev]);
  };

  const handleOpenDeleteMember = (memberId: string) => {
    const target = teamMembers.find((m) => m.id === memberId);
    if (!target) return;
    if (target.userType === 'admin' || target.id === 'user-1') {
      alert('Akun Administrator Utama tidak dapat dihapus.');
      return;
    }
    setDeletingMember(target);
    setIsDeleteMemberModalOpen(true);
  };

  const handleConfirmDeleteMember = async (memberId: string) => {
    const target = deletingMember || teamMembers.find((m) => m.id === memberId);
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.teamMembers) {
          setTeamMembers(data.teamMembers);
          syncManager.setCachedTeam(data.teamMembers);
        }
        if (data.tasks) {
          setTasks(data.tasks);
          syncManager.setCachedTasks(data.tasks);
        }
      }
    } catch (e) {
      console.warn('Gagal hapus member di server:', e);
    }

    setTeamMembers((prev) => {
      const next = prev.filter((m) => m.id !== memberId);
      syncManager.setCachedTeam(next);
      return next;
    });
    setTasks((prev) => prev.filter((t) => t.assigneeId !== memberId));

    const delNotif: NotificationItem = {
      id: `notif-del-${Date.now()}`,
      title: '🗑️ Member Dihapus',
      message: `Member ${target?.name || memberId} telah dihapus dari daftar Member Aktif.`,
      type: 'security',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [delNotif, ...prev]);
    setIsDeleteMemberModalOpen(false);
    setDeletingMember(null);
  };

  const handleAuthSuccess = async (member: TeamMember, isRegistration?: boolean) => {
    const isAdmin = member.userType === 'admin';

    if (isAdmin) {
      member.userType = 'admin';
      member.password = member.password || 'password123';
      member.socialFollowProof = {
        allCompleted: true,
        completedAt: member.socialFollowProof?.completedAt || new Date().toISOString(),
      };
    } else if (isRegistration || !member.socialFollowProof?.allCompleted) {
      setOrientationMember(member);
      setIsOrientationModalOpen(true);
      // Gated! User CANNOT proceed to board until orientation proof is fulfilled!
      return;
    }

    setCurrentUser(member);
    setIsLoggedIn(true);

    // If new member, prepend to teamMembers locally first for immediate responsiveness
    setTeamMembers((prev) => {
      const exists = prev.some((m) => m.id === member.id || m.email === member.email);
      const updated = exists ? prev.map((m) => (m.id === member.id ? member : m)) : [member, ...prev];
      syncManager.setCachedTeam(updated);
      return updated;
    });

    // Send to central server so Admin and all devices receive the new member live
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.teamMembers) {
          setTeamMembers(data.teamMembers);
          syncManager.setCachedTeam(data.teamMembers);
        }
        if (data.tasks) {
          setTasks(data.tasks);
          syncManager.setCachedTasks(data.tasks);
        }
      }
    } catch (err) {
      console.warn('Sinkronisasi pendaftaran ke server disimpan secara lokal:', err);
    }

    playLevelUpFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: '🎉 Selamat Datang di Komunitas TBK!',
      message: `Halo ${member.name}, Anda berhasil masuk ke dashboard Komunitas TBK.`,
      type: 'level_up',
      read: false,
      createdAt: new Date().toISOString(),
    };

    const joinNotif: NotificationItem = {
      id: `notif-join-${member.id}-${Date.now()}`,
      title: `👤 Member Baru Bergabung: ${member.name}`,
      message: `${member.name} (${member.role || member.occupation || 'Member Baru'}) telah bergabung di Komunitas TBK pada tanggal ${new Date(member.joinedAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}. Klik untuk melihat resume member di Kalender Editorial!`,
      type: 'member_joined',
      read: false,
      createdAt: member.joinedAt || new Date().toISOString(),
      memberId: member.id,
    };

    setNotifications((prev) => [joinNotif, notif, ...prev]);

    // Navigate to board
    setActiveTab('board');
  };

  // Complete Orientation Mission (YouTube Watch Time, Follow & WhatsApp Join)
  const handleCompleteOrientation = async (data: {
    youtubeWatchedSeconds: number;
    youtubeConfirmed: boolean;
    instagramConfirmed: boolean;
    tiktokConfirmed: boolean;
    facebookConfirmed: boolean;
    whatsappConfirmed?: boolean;
  }) => {
    const targetMember = orientationMember || currentUser;
    try {
      const res = await fetch('/api/member/orientation-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: targetMember.id,
          ...data,
        }),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.member) {
          setTeamMembers((prev) =>
            prev.map((m) => (m.id === targetMember.id ? resData.member : m))
          );
          setCurrentUser(resData.member);
        }
        if (resData.tasks) {
          setTasks(resData.tasks);
          syncManager.setCachedTasks(resData.tasks);
        }
      }
    } catch (e) {
      console.warn('Gagal sinkronisasi orientasi ke server:', e);
      // Local fallback
      const updatedProof: SocialFollowProof = {
        youtubeWatchedSeconds: data.youtubeWatchedSeconds,
        youtubeSubscribed: data.youtubeConfirmed,
        youtubeWatchProof:
          data.youtubeWatchedSeconds >= 120
            ? `Tuntas ${Math.floor(data.youtubeWatchedSeconds / 60)}m ${data.youtubeWatchedSeconds % 60}s (> 2 Menit, Valid Algoritma)`
            : `${Math.floor(data.youtubeWatchedSeconds / 60)}m ${data.youtubeWatchedSeconds % 60}s`,
        youtubeVerifiedAt: data.youtubeConfirmed ? new Date().toISOString() : undefined,
        instagramFollowed: data.instagramConfirmed,
        tiktokFollowed: data.tiktokConfirmed,
        facebookFollowed: data.facebookConfirmed,
        whatsappJoined: !!data.whatsappConfirmed,
        allCompleted: data.youtubeConfirmed && data.instagramConfirmed,
        completedAt: new Date().toISOString(),
      };
      setTeamMembers((prev) =>
        prev.map((m) =>
          m.id === targetMember.id ? { ...m, socialFollowProof: updatedProof } : m
        )
      );
      setCurrentUser((prev) => ({ ...prev, socialFollowProof: updatedProof }));
    }

    setIsLoggedIn(true);
    setIsOrientationModalOpen(false);
    setActiveTab('board');

    playTaskDoneChime();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
    });

    // Add member joined notification
    const newJoinNotif: NotificationItem = {
      id: `notif-join-${targetMember.id}-${Date.now()}`,
      title: `👤 Member Baru Bergabung: ${targetMember.name}`,
      message: `${targetMember.name} (${targetMember.role || targetMember.occupation || 'Member Baru'}) telah resmi bergabung di Komunitas TBK. Klik untuk melihat resume di Kalender Editorial!`,
      type: 'member_joined',
      read: false,
      createdAt: targetMember.joinedAt || new Date().toISOString(),
      memberId: targetMember.id,
    };
    setNotifications((prev) => [newJoinNotif, ...prev]);

    // Prompt new member to give task to all members
    setBroadcastTaskCreator(targetMember);
    setTimeout(() => {
      setIsBroadcastTaskModalOpen(true);
    }, 1200);
  };

  // Full-Screen Front Landing Page (Hero Showcase inspired by reference design)
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 font-sans">
        <LandingHeroView
          onEnterDashboard={(tab) => {
            if (!isLoggedIn) {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            } else {
              setActiveTab(tab || 'board');
            }
          }}
          currentUser={currentUser}
          allMembers={teamMembers}
          isLoggedIn={isLoggedIn}
          onOpenAuthModal={(mode) => {
            setAuthModalMode(mode || 'register');
            setIsAuthModalOpen(true);
          }}
          onLogout={() => {
            setIsLoggedIn(false);
            setActiveTab('landing');
          }}
        />

        <AuthRegistrationModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onAuthSuccess={handleAuthSuccess}
          existingMembers={teamMembers}
          officialSocials={officialAdminSocials}
        />

        <AdminOfficialSocialsModal
          isOpen={isAdminSocialsModalOpen}
          onClose={() => setIsAdminSocialsModalOpen(false)}
          currentSocials={officialAdminSocials}
          mandatoryTask={tasks.find((t) => t.isOfficialMandatory || t.tags?.includes('WajibAdmin'))}
          onSave={(socials, enableMandatory) => handleUpdateAdminOfficialSosmed(socials, enableMandatory)}
          onDeleteMandatoryTask={() => {
            const mTask = tasks.find((t) => t.isOfficialMandatory || t.tags?.includes('WajibAdmin'));
            if (mTask) handleDeleteTask(mTask.id);
          }}
        />

        <PostRegisterOrientationModal
          isOpen={isOrientationModalOpen}
          onClose={() => {
            setIsOrientationModalOpen(false);
            setIsLoggedIn(false);
            setActiveTab('landing');
          }}
          currentUser={orientationMember || currentUser}
          officialSocials={officialAdminSocials}
          mandatoryTask={tasks.find((t) => t.isOfficialMandatory || t.tags?.includes('WajibAdmin'))}
          onCompleteOrientation={handleCompleteOrientation}
        />

        <OfflineIndicator
          onlineStatus={onlineStatus}
          outboxCount={outboxCount}
          isSimulatedOffline={isSimulatedOffline}
          onToggleSimulatedOffline={handleToggleSimulatedOffline}
          onFlushSync={handleManualSync}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onlineStatus={onlineStatus}
        outboxCount={outboxCount}
        onManualSync={handleManualSync}
        notifications={notifications}
        onMarkNotifRead={handleMarkNotifRead}
        onMarkAllNotifsRead={handleMarkAllNotifsRead}
        onSelectNotification={handleSelectNotification}
        currentUser={currentUser}
        allMembers={teamMembers}
        onSwitchUser={setCurrentUser}
        onSimulatePeerAction={handleSimulatePeerAction}
        onOpenNewTaskModal={() => {
          setTaskModalInitialStatus('todo');
          setIsTaskModalOpen(true);
        }}
        onOpenBroadcastTaskModal={() => {
          setBroadcastTaskCreator(currentUser);
          setIsBroadcastTaskModalOpen(true);
        }}
        onOpenAdminSocialsModal={() => setIsAdminSocialsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
        {activeTab === 'board' && (
          <TaskBoard
            tasks={tasks}
            teamMembers={teamMembers}
            currentUser={currentUser}
            onSelectTask={setSelectedTask}
            onOpenNewTaskModal={(status) => {
              setTaskModalInitialStatus(status || 'todo');
              setIsTaskModalOpen(true);
            }}
            onOpenBroadcastTaskModal={() => {
              setBroadcastTaskCreator(currentUser);
              setIsBroadcastTaskModalOpen(true);
            }}
            onQuickStatusChange={handleUpdateTaskStatus}
            onQuickAssignBuddy={handleAssignBuddy}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            teamMembers={teamMembers}
            currentUser={currentUser}
            onSelectTask={setSelectedTask}
            selectedMemberId={selectedMemberIdForCalendar}
            onOpenBroadcastTaskModal={(member) => {
              setBroadcastTaskCreator(member || currentUser);
              setIsBroadcastTaskModalOpen(true);
            }}
          />
        )}

        {activeTab === 'gamification' && (
          <GamificationView
            currentUser={currentUser}
            allMembers={teamMembers}
            referrals={referrals}
            onRedeemReward={handleRedeemReward}
            onOpenRegisterModal={() => {
              setAuthModalMode('register');
              setIsAuthModalOpen(true);
            }}
            onEditMember={handleOpenEditMember}
            onDeleteMember={handleOpenDeleteMember}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard tasks={tasks} teamMembers={teamMembers} />}

        {activeTab === 'admin_monitor' && (
          <AdminProgressMonitor
            tasks={tasks}
            teamMembers={teamMembers}
            currentUser={currentUser}
            onSelectTask={setSelectedTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onOpenNewTaskModal={() => {
              setTaskModalInitialStatus('todo');
              setIsTaskModalOpen(true);
            }}
            onUpdateAdminOfficialSosmed={handleUpdateAdminOfficialSosmed}
            onOpenAdminSocialsModal={() => setIsAdminSocialsModalOpen(true)}
            onVerifyMember={handleVerifyMember}
            onDeleteTask={handleDeleteTask}
            onEditMember={handleOpenEditMember}
            onDeleteMember={handleOpenDeleteMember}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <AuthRegistrationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
        existingMembers={teamMembers}
        officialSocials={officialAdminSocials}
      />

      <AdminOfficialSocialsModal
        isOpen={isAdminSocialsModalOpen}
        onClose={() => setIsAdminSocialsModalOpen(false)}
        currentSocials={officialAdminSocials}
        mandatoryTask={tasks.find((t) => t.isOfficialMandatory || t.tags?.includes('WajibAdmin'))}
        onSave={(socials, enableMandatory) => handleUpdateAdminOfficialSosmed(socials, enableMandatory)}
        onDeleteMandatoryTask={() => {
          const mTask = tasks.find((t) => t.isOfficialMandatory || t.tags?.includes('WajibAdmin'));
          if (mTask) handleDeleteTask(mTask.id);
        }}
      />

      <PostRegisterOrientationModal
        isOpen={isOrientationModalOpen}
        onClose={() => {
          setIsOrientationModalOpen(false);
          setIsLoggedIn(false);
          setActiveTab('landing');
        }}
        currentUser={orientationMember || currentUser}
        officialSocials={officialAdminSocials}
        mandatoryTask={tasks.find((t) => t.isOfficialMandatory || t.tags?.includes('WajibAdmin'))}
        onCompleteOrientation={handleCompleteOrientation}
      />

      <EditMemberModal
        isOpen={isEditMemberModalOpen}
        onClose={() => {
          setIsEditMemberModalOpen(false);
          setEditingMember(null);
        }}
        member={editingMember}
        onSave={handleSaveEditedMember}
      />

      <DeleteMemberConfirmModal
        isOpen={isDeleteMemberModalOpen}
        onClose={() => {
          setIsDeleteMemberModalOpen(false);
          setDeletingMember(null);
        }}
        member={deletingMember}
        onConfirmDelete={handleConfirmDeleteMember}
      />
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        initialStatus={taskModalInitialStatus}
        teamMembers={teamMembers}
        currentUser={currentUser}
      />

      <CommunityBroadcastTaskModal
        isOpen={isBroadcastTaskModalOpen}
        onClose={() => {
          setIsBroadcastTaskModalOpen(false);
          setBroadcastTaskCreator(undefined);
        }}
        currentUser={currentUser}
        targetMember={broadcastTaskCreator}
        allMembers={teamMembers}
        onSubmit={handleCreateTask}
      />

      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        teamMembers={teamMembers}
        currentUser={currentUser}
        onStatusChange={handleUpdateTaskStatus}
        onToggleSubtask={handleToggleSubtask}
        onAddComment={handleAddComment}
        onAssignBuddy={handleAssignBuddy}
        onDeleteTask={handleDeleteTask}
      />

      {/* Floating Offline & Sync Indicator */}
      <OfflineIndicator
        onlineStatus={onlineStatus}
        outboxCount={outboxCount}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={handleToggleSimulatedOffline}
        onFlushSync={handleManualSync}
      />
    </div>
  );
}

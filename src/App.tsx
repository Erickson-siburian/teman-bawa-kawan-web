import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { LandingHeroView } from './components/LandingHeroView';
import { TaskBoard } from './components/TaskBoard';
import { TaskModal } from './components/TaskModal';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { CalendarView } from './components/CalendarView';
import { GamificationView } from './components/GamificationView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthRegistrationModal } from './components/AuthRegistrationModal';
import { NotificationItem, ReferralRecord, Task, TaskStatus, TeamMember } from './types';
import { syncManager } from './lib/syncManager';
import { playTaskDoneChime, playLevelUpFanfare, playNotificationTone } from './lib/audio';
import { initialTeamMembers, initialTasks, initialNotifications, initialReferrals } from './data/initialData';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'board' | 'calendar' | 'gamification' | 'analytics'>('landing');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');

  const [currentUser, setCurrentUser] = useState<TeamMember>({
    id: 'user-1',
    name: 'Adrian & Andrew',
    email: 'haihaihai9191@gmail.com',
    role: 'Wiraswasta / Pedagang & Ambassador TBK',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    gender: 'Laki-Laki',
    phoneNumber: '081298765432',
    occupation: 'Wiraswasta / Pedagang',
    socialAccounts: {
      instagram: '@adrian_andrew.id',
      youtube: 'AdrianAndrewOfficial',
      googleMap: 'Adrian Local Guide',
      facebook: 'Adrian Andrew ID',
      googlePlaystore: 'adrian.reviewer',
      threads: '@adrian_andrew.id',
      tiktok: '@adrianandrew_tiktok',
      linkedIn: 'adrian-andrew',
      spotify: 'Adrian Andrew Podcast',
      detik: 'adrian_komentar',
      xTwitter: '@adrian_andrew',
    },
    creatorNiche: 'Multiplatform Sinergi',
    primaryPlatform: 'Instagram',
    monetizationStatus: 'monetized',
    xp: 1420,
    level: 4,
    levelTitle: 'Master Monetisasi TBK',
    streak: 9,
    referralCode: 'TBK-ADRIAN-88',
    referralPoints: 340,
    referralsCount: 6,
    buddySynergyScore: 94,
    completedTasksCount: 18,
    onTimeRate: 92,
    status: 'online',
    joinedAt: '2026-01-15T08:30:00Z',
  });

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
    const activeTeam = cachedTeam && cachedTeam.length > 0 ? cachedTeam : initialTeamMembers;
    const activeNotifs = cachedNotifs && cachedNotifs.length > 0 ? cachedNotifs : initialNotifications;

    setTasks(activeTasks);
    setTeamMembers(activeTeam);
    setNotifications(activeNotifs);
    setReferrals(initialReferrals);

    const matched = activeTeam.find((m) => m.id === currentUserIdRef.current);
    if (matched) setCurrentUser(matched);

    // Save defaults to cache if not already set
    if (!cachedTasks || cachedTasks.length === 0) syncManager.setCachedTasks(activeTasks);
    if (!cachedTeam || cachedTeam.length === 0) syncManager.setCachedTeam(activeTeam);
    if (!cachedNotifs || cachedNotifs.length === 0) syncManager.setCachedNotifs(activeNotifs);

    // If online, attempt to fetch fresh data from server
    if (syncManager.isOnline()) {
      try {
        const [tasksRes, teamRes, notifRes, refRes] = await Promise.all([
          fetch('/api/tasks').then((r) => r.json()),
          fetch('/api/team').then((r) => r.json()),
          fetch('/api/notifications').then((r) => r.json()),
          fetch('/api/referrals').then((r) => r.json()),
        ]);

        if (tasksRes && tasksRes.success) {
          setTasks(tasksRes.tasks);
          syncManager.setCachedTasks(tasksRes.tasks);
        }
        if (teamRes && teamRes.success) {
          setTeamMembers(teamRes.teamMembers);
          syncManager.setCachedTeam(teamRes.teamMembers);
          const matchedUser = teamRes.teamMembers.find((m: TeamMember) => m.id === currentUserIdRef.current);
          if (matchedUser) setCurrentUser(matchedUser);
        }
        if (notifRes && notifRes.success) {
          setNotifications(notifRes.notifications);
          syncManager.setCachedNotifs(notifRes.notifications);
        }
        if (refRes && refRes.success) {
          setReferrals(refRes.referrals);
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

    return () => {
      clearInterval(deadlineChecker);
    };
  }, []);

  // Create Task
  const handleCreateTask = async (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || 'Tugas TBK',
      description: taskData.description || '',
      isEncrypted: !!taskData.isEncrypted,
      encryptedData: taskData.encryptedData,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      assigneeId: taskData.assigneeId || currentUser.id,
      assigneeName: taskData.assigneeName || currentUser.name,
      assigneeAvatar: taskData.assigneeAvatar || currentUser.avatar,
      buddyId: taskData.buddyId,
      buddyName: taskData.buddyName,
      buddyAvatar: taskData.buddyAvatar,
      dueDate: taskData.dueDate || new Date(Date.now() + 86400000 * 2).toISOString(),
      category: taskData.category || 'development',
      tags: taskData.tags || ['TBK'],
      subtasks: taskData.subtasks || [],
      comments: [],
      referralCodeUsed: taskData.referralCodeUsed,
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

  const handleAuthSuccess = (member: TeamMember) => {
    setCurrentUser(member);
    setIsLoggedIn(true);

    // If new member, prepend to teamMembers
    setTeamMembers((prev) => {
      const exists = prev.some((m) => m.id === member.id || m.email === member.email);
      const updated = exists ? prev.map((m) => (m.id === member.id ? member : m)) : [member, ...prev];
      syncManager.setCachedTeam(updated);
      return updated;
    });

    playLevelUpFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: '🎉 Selamat Datang di Komunitas TBK!',
      message: `Halo ${member.name}, akun Anda berhasil diverifikasi. Silakan mulai eksplorasi tugas atau hubungkan akun sosmed Anda.`,
      type: 'level_up',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    // Navigate to board
    setActiveTab('board');
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
        currentUser={currentUser}
        allMembers={teamMembers}
        onSwitchUser={setCurrentUser}
        onSimulatePeerAction={handleSimulatePeerAction}
        onOpenNewTaskModal={() => {
          setTaskModalInitialStatus('todo');
          setIsTaskModalOpen(true);
        }}
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
            onQuickStatusChange={handleUpdateTaskStatus}
            onQuickAssignBuddy={handleAssignBuddy}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView tasks={tasks} currentUser={currentUser} onSelectTask={setSelectedTask} />
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
          />
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard tasks={tasks} teamMembers={teamMembers} />}
      </main>

      {/* Modals & Drawers */}
      <AuthRegistrationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
        existingMembers={teamMembers}
      />
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        initialStatus={taskModalInitialStatus}
        teamMembers={teamMembers}
        currentUser={currentUser}
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

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
  isEncrypted?: boolean;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  isEncrypted: boolean;
  encryptedData?: EncryptedPayload;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  creatorId: string;
  creatorName: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  buddyId?: string; // Teman Pendamping / Kawan TBK
  buddyName?: string;
  buddyAvatar?: string;
  dueDate: string;
  category:
    | 'monetization_sponsor'
    | 'collab_crosspromo'
    | 'content_production'
    | 'algorithm_growth'
    | 'distribution_engagement'
    | 'development'
    | 'design'
    | 'research'
    | 'marketing'
    | 'ops';
  platform?: 'youtube' | 'tiktok' | 'instagram' | 'affiliate_shop' | 'multiplatform';
  monetizationGoal?: string;
  tags: string[];
  subtasks: Subtask[];
  comments: TaskComment[];
  completedAt?: string;
  onTime?: boolean;
  referralCodeUsed?: string;
  xpAwarded?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemberSocialAccounts {
  instagram?: string;
  youtube?: string;
  googleMap?: string;
  facebook?: string;
  googlePlaystore?: string;
  threads?: string;
  tiktok?: string;
  linkedIn?: string;
  spotify?: string;
  detik?: string;
  xTwitter?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  password?: string;
  userType?: 'admin' | 'user';
  role: string;
  avatar: string;
  gender?: 'Laki-Laki' | 'Perempuan';
  phoneNumber?: string;
  occupation?: string;
  socialAccounts?: MemberSocialAccounts;
  creatorNiche?: string;
  primaryPlatform?: string;
  monetizationStatus?: 'not_eligible' | 'in_progress' | 'partner_eligible' | 'monetized_active';
  xp: number;
  level: number;
  levelTitle: string;
  streak: number;
  referralCode: string;
  referralPoints: number;
  referralsCount: number;
  buddySynergyScore: number;
  completedTasksCount: number;
  onTimeRate: number;
  status: 'online' | 'busy' | 'offline';
  joinedAt?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'buddy_invite' | 'task_done' | 'level_up' | 'referral_reward' | 'sync' | 'security';
  read: boolean;
  createdAt: string;
}

interface ReferralRecord {
  id: string;
  code: string;
  inviterName: string;
  refereeName: string;
  taskId: string;
  taskTitle: string;
  bonusXp: number;
  bonusPoints: number;
  completedAt: string;
}

// Initial Team Members Data (TBK Member Circle with Registration Details)
let teamMembers: TeamMember[] = [
  {
    id: 'user-1',
    name: 'Adrian & Andrew',
    email: 'haihaihai9191@gmail.com',
    password: 'password123',
    userType: 'admin',
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
    monetizationStatus: 'monetized_active',
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
  },
  {
    id: 'user-2',
    name: 'Siti Rahmawati',
    email: 'siti.rahma@tbk-team.id',
    role: 'Konten Kreator Shorts & Reels (92K)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    gender: 'Perempuan',
    phoneNumber: '081388776655',
    occupation: 'Konten Kreator / Influencer',
    socialAccounts: {
      instagram: '@sitirahma_official',
      youtube: 'SitiRahmaChannel',
      tiktok: '@sitirahma_reels',
      threads: '@sitirahma_official',
      googleMap: 'Siti Rahma Food Guide',
      facebook: 'Siti Rahmawati Page',
    },
    creatorNiche: 'Kuliner & Lifestyle',
    primaryPlatform: 'TikTok',
    monetizationStatus: 'partner_eligible',
    xp: 980,
    level: 3,
    levelTitle: 'Kreator Sinergi TBK',
    streak: 6,
    referralCode: 'TBK-SITI-42',
    referralPoints: 210,
    referralsCount: 4,
    buddySynergyScore: 88,
    completedTasksCount: 14,
    onTimeRate: 86,
    status: 'online',
    joinedAt: '2026-02-01T10:15:00Z',
  },
  {
    id: 'user-3',
    name: 'Budi Santoso',
    email: 'budi.santoso@tbk-team.id',
    role: 'Video Editor & Motion Designer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    gender: 'Laki-Laki',
    phoneNumber: '081234567890',
    occupation: 'Freelancer / Editor Video',
    socialAccounts: {
      youtube: 'BudiMotionStudio',
      tiktok: '@budimotion',
      linkedIn: 'budisantoso-motion',
      instagram: '@budisantoso.art',
      googlePlaystore: 'budidev.apps',
    },
    creatorNiche: 'Desain Visual & Tech',
    primaryPlatform: 'YouTube',
    monetizationStatus: 'monetized_active',
    xp: 1150,
    level: 3,
    levelTitle: 'Kreator Sinergi TBK',
    streak: 7,
    referralCode: 'TBK-BUDI-19',
    referralPoints: 260,
    referralsCount: 5,
    buddySynergyScore: 91,
    completedTasksCount: 16,
    onTimeRate: 88,
    status: 'online',
    joinedAt: '2026-02-10T14:20:00Z',
  },
  {
    id: 'user-4',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@tbk-team.id',
    role: 'Live Shopping Host & Reviewer Google Map',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    gender: 'Perempuan',
    phoneNumber: '081599887744',
    occupation: 'Reviewer & Affiliate Host',
    socialAccounts: {
      googleMap: 'Dewi Local Guide Bintang 5',
      tiktok: '@dewilestari.affiliate',
      instagram: '@dewi_host',
      spotify: 'Dewi Cerita Belanja',
      detik: 'dewi_reviewer',
    },
    creatorNiche: 'E-Commerce & Affiliate',
    primaryPlatform: 'TikTok',
    monetizationStatus: 'partner_eligible',
    xp: 750,
    level: 2,
    levelTitle: 'Kawan Kolaborator TBK',
    streak: 4,
    referralCode: 'TBK-DEWI-77',
    referralPoints: 150,
    referralsCount: 3,
    buddySynergyScore: 84,
    completedTasksCount: 10,
    onTimeRate: 90,
    status: 'busy',
    joinedAt: '2026-03-01T09:45:00Z',
  },
];

// Initial Tasks Data (Social Media Creator Monetization Tasks)
let tasks: Task[] = [
  {
    id: 'task-101',
    title: 'Kontrak Kerja Sama & Jadwal Kolaborasi Konten 2026',
    description: 'Kesepakatan jadwal penayangan konten kolaborasi 3 video berseri. Berisi rincian rate card, terms komisi affiliate, dan tanggal tayang yang disepakati bersama.',
    isEncrypted: false,
    status: 'in_progress',
    priority: 'urgent',
    creatorId: 'user-1',
    creatorName: 'Adrian Pratama',
    assigneeId: 'user-4',
    assigneeName: 'Dewi Lestari',
    assigneeAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    buddyId: 'user-1',
    buddyName: 'Adrian Pratama',
    buddyAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    category: 'monetization_sponsor',
    tags: ['Monetisasi', 'Endorsement', 'Kolaborasi', 'RateCard'],
    subtasks: [
      { id: 'sub-1', title: 'Review draf naskah & kesepakatan bersama', completed: true },
      { id: 'sub-2', title: 'Susun rincian rate card & komisi affiliate', completed: true },
      { id: 'sub-3', title: 'Sinkronisasi jadwal tayang ke kalender kawan', completed: false },
    ],
    comments: [
      {
        id: 'c-1',
        userId: 'user-1',
        userName: 'Adrian Pratama',
        text: 'Kawan Dewi, rincian jadwal kolaborasi dan pembagian tugas sudah diunggah secara terbuka. Silakan dicek dan disesuaikan.',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'c-2',
        userId: 'user-4',
        userName: 'Dewi Lestari',
        text: 'Siap Kawan Adrian! Sinergi TBK kita mantap, saya akan siapkan perlengkapan live stream sebelum deadline.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
    referralCodeUsed: 'TBK-ADRIAN-88',
    xpAwarded: 120,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'task-102',
    title: 'Video Kolaborasi Duet/Stitch: Rahasia Tembus Monetisasi 2026',
    description: 'Saling support cross-promotion di YouTube Shorts & TikTok untuk mendongkrak retensi audiens, jam tayang, dan followers aktif secara organik.',
    isEncrypted: false,
    status: 'done',
    priority: 'high',
    creatorId: 'user-2',
    creatorName: 'Siti Rahmawati',
    assigneeId: 'user-2',
    assigneeName: 'Siti Rahmawati',
    assigneeAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    buddyId: 'user-3',
    buddyName: 'Budi Santoso',
    buddyAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    category: 'collab_crosspromo',
    tags: ['CrossPromo', 'DuetTikTok', 'TBK-Sinergi', 'Monetisasi'],
    subtasks: [
      { id: 'sub-4', title: 'Susun naskah hook 3 detik pertama pemikat algoritma', completed: true },
      { id: 'sub-5', title: 'Editing ritme cepat & efek suara transisi', completed: true },
      { id: 'sub-6', title: 'Posting serentak di jam prime time (19:00 WIB)', completed: true },
    ],
    comments: [
      {
        id: 'c-3',
        userId: 'user-3',
        userName: 'Budi Santoso',
        text: 'Video sudah di-render dengan rasio 9:16 dan color grading cerah, siap viral bareng!',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
    completedAt: new Date(Date.now() - 86400000 * 1.2).toISOString(),
    onTime: true,
    referralCodeUsed: 'TBK-SITI-42',
    xpAwarded: 120,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'task-103',
    title: 'Jadwal Live Bareng (Co-Host) TikTok & Shopee Affiliate Flash Sale',
    description: 'Sesi live streaming kolaborasi 2 jam untuk memaksimalkan GMV penjualan affiliate & komisi keranjang kuning dengan saling lempar audiens.',
    isEncrypted: false,
    status: 'in_progress',
    priority: 'urgent',
    creatorId: 'user-1',
    creatorName: 'Adrian Pratama',
    assigneeId: 'user-3',
    assigneeName: 'Budi Santoso',
    assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    buddyId: 'user-2',
    buddyName: 'Siti Rahmawati',
    buddyAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    category: 'distribution_engagement',
    tags: ['LiveStreaming', 'Affiliate', 'ShopeeLive', 'CoHost'],
    subtasks: [
      { id: 'sub-7', title: 'Kurasi 10 produk sampel dengan komisi tertinggi (>15%)', completed: true },
      { id: 'sub-8', title: 'Sinkronkan jadwal tayang ke Google Calendar & iCal', completed: true },
      { id: 'sub-9', title: 'Siapkan pin kuis interaktif & saling moderasi komentar live', completed: false },
    ],
    comments: [],
    referralCodeUsed: 'TBK-BUDI-19',
    xpAwarded: 90,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'task-104',
    title: 'Audit A/B Testing 3 Thumbnail & Riset Tagar Viral Algoritma',
    description: 'Optimasi CTR video panjang YouTube untuk mengejar syarat 4.000 jam tayang monetisasi program partner (YPP).',
    isEncrypted: false,
    status: 'todo',
    priority: 'high',
    creatorId: 'user-3',
    creatorName: 'Budi Santoso',
    assigneeId: 'user-1',
    assigneeName: 'Adrian Pratama',
    assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    buddyId: 'user-4',
    buddyName: 'Dewi Lestari',
    buddyAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    category: 'algorithm_growth',
    tags: ['Algoritma', 'CTR-Audit', 'YouTubeMonetize', 'Thumbnail'],
    subtasks: [
      { id: 'sub-10', title: 'Riset tren kata kunci Google Trends & volume pencarian', completed: true },
      { id: 'sub-11', title: 'Desain 3 variasi thumbnail kontras tinggi dengan ekspresi kuat', completed: false },
      { id: 'sub-12', title: 'Uji coba naskah hook 30 detik pertama bersama Kawan', completed: false },
    ],
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

let notifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '🔥 Sinergi Kreator TBK Aktif!',
    message: 'Kawan Dewi Lestari mengonfirmasi undangan Kawan Pendamping pada Kontrak Endorsement Brand Eksklusif.',
    type: 'buddy_invite',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'notif-2',
    title: '🎁 Bonus Referal Monetisasi Tepat Waktu!',
    message: 'Konten duet video selesai tepat waktu! Anda & Kawan Budi masing-masing mendapat +50 Poin Referal.',
    type: 'referral_reward',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'notif-3',
    title: '⚡ Level Up: Master Monetisasi TBK!',
    message: 'Selamat! Adrian Pratama mencapai Level 4 dengan skor sinergi saling support 94%.',
    type: 'level_up',
    read: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

let referrals: ReferralRecord[] = [
  {
    id: 'ref-1',
    code: 'TBK-ADRIAN-88',
    inviterName: 'Adrian Pratama',
    refereeName: 'Dewi Lestari',
    taskId: 'task-101',
    taskTitle: 'Kontrak Endorsement Brand Eksklusif & Rate Card 2026',
    bonusXp: 80,
    bonusPoints: 50,
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ref-2',
    code: 'TBK-SITI-42',
    inviterName: 'Siti Rahmawati',
    refereeName: 'Budi Santoso',
    taskId: 'task-102',
    taskTitle: 'Video Kolaborasi Duet/Stitch: Rahasia Tembus Monetisasi 2026',
    bonusXp: 80,
    bonusPoints: 50,
    completedAt: new Date(Date.now() - 86400000 * 1.2).toISOString(),
  },
];

// Active SSE client connections for real-time collaboration
const sseClients: Response[] = [];

function broadcastEvent(type: string, data: any) {
  const payload = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  sseClients.forEach((client) => {
    try {
      client.write(`event: ${type}\ndata: ${payload}\n\n`);
    } catch (err) {
      // client connection closed
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // SSE (Server-Sent Events) Endpoint for real-time live sync
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.push(res);

    // Initial greeting
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', clients: sseClients.length })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) {
        sseClients.splice(idx, 1);
      }
    });
  });

  // GET All Tasks
  app.get('/api/tasks', (req: Request, res: Response) => {
    res.json({ success: true, tasks });
  });

  // POST Create New Task
  app.post('/api/tasks', (req: Request, res: Response) => {
    const newTaskData = req.body;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskData.title || 'Tugas Baru TBK',
      description: newTaskData.description || '',
      isEncrypted: !!newTaskData.isEncrypted,
      encryptedData: newTaskData.encryptedData,
      status: newTaskData.status || 'todo',
      priority: newTaskData.priority || 'medium',
      creatorId: newTaskData.creatorId || 'user-1',
      creatorName: newTaskData.creatorName || 'Adrian Pratama',
      assigneeId: newTaskData.assigneeId || 'user-1',
      assigneeName: newTaskData.assigneeName || 'Adrian Pratama',
      assigneeAvatar: newTaskData.assigneeAvatar,
      buddyId: newTaskData.buddyId,
      buddyName: newTaskData.buddyName,
      buddyAvatar: newTaskData.buddyAvatar,
      dueDate: newTaskData.dueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
      category: newTaskData.category || 'development',
      tags: newTaskData.tags || ['TBK'],
      subtasks: newTaskData.subtasks || [],
      comments: [],
      referralCodeUsed: newTaskData.referralCodeUsed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);

    // Create notification if buddy is assigned
    if (newTask.buddyId && newTask.buddyName) {
      const buddyNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: '🤝 Undangan Kawan Pendamping Baru!',
        message: `${newTask.creatorName} mengajak Anda menjadi Kawan pada tugas "${newTask.title}".`,
        type: 'buddy_invite',
        read: false,
        createdAt: new Date().toISOString(),
      };
      notifications.unshift(buddyNotif);
      broadcastEvent('notification_added', buddyNotif);
    }

    broadcastEvent('task_created', newTask);
    res.status(201).json({ success: true, task: newTask });
  });

  // PUT Update Task
  app.put('/api/tasks/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const taskIndex = tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });
    }

    const previousTask = tasks[taskIndex];
    const updates = req.body;

    // Check if task is just completed
    let isNewlyCompleted = false;
    let isOnTime = false;
    let xpGained = 0;

    if (updates.status === 'done' && previousTask.status !== 'done') {
      isNewlyCompleted = true;
      const dueTimestamp = new Date(previousTask.dueDate).getTime();
      const currentTimestamp = Date.now();
      isOnTime = currentTimestamp <= dueTimestamp;

      // Base XP
      xpGained = 50;
      if (isOnTime) xpGained += 30; // On time bonus
      if (previousTask.buddyId) xpGained += 40; // TBK Buddy Synergy bonus!

      updates.completedAt = new Date().toISOString();
      updates.onTime = isOnTime;
      updates.xpAwarded = xpGained;

      // Update Member Gamification Stats
      const assignee = teamMembers.find((m) => m.id === previousTask.assigneeId);
      if (assignee) {
        assignee.xp += xpGained;
        assignee.completedTasksCount += 1;
        if (isOnTime) assignee.streak += 1;
        // Level recalculation (every 350 XP)
        assignee.level = Math.max(1, Math.floor(assignee.xp / 350) + 1);
      }

      // If there's a buddy, buddy gets bonus XP & synergy boost
      if (previousTask.buddyId) {
        const buddy = teamMembers.find((m) => m.id === previousTask.buddyId);
        if (buddy) {
          buddy.xp += Math.round(xpGained * 0.8);
          buddy.buddySynergyScore = Math.min(100, buddy.buddySynergyScore + 2);
          if (isOnTime) buddy.streak += 1;
        }

        // Referral Reward generation if on-time
        if (isOnTime) {
          const newRef: ReferralRecord = {
            id: `ref-${Date.now()}`,
            code: previousTask.referralCodeUsed || 'TBK-TEAM',
            inviterName: previousTask.assigneeName,
            refereeName: previousTask.buddyName || 'Kawan Tim',
            taskId: previousTask.id,
            taskTitle: previousTask.title,
            bonusXp: 80,
            bonusPoints: 50,
            completedAt: new Date().toISOString(),
          };
          referrals.unshift(newRef);

          if (assignee) {
            assignee.referralPoints += 50;
            assignee.referralsCount += 1;
          }

          const refNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            title: '🎁 Hadiah Sinergi Kawan Tepat Waktu!',
            message: `Tugas "${previousTask.title}" tuntas tepat waktu! +${xpGained} XP & 50 Poin Referal ditambahkan.`,
            type: 'referral_reward',
            read: false,
            createdAt: new Date().toISOString(),
          };
          notifications.unshift(refNotif);
          broadcastEvent('notification_added', refNotif);
        }
      }
    }

    const updatedTask: Task = {
      ...previousTask,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex] = updatedTask;

    broadcastEvent('task_updated', updatedTask);
    broadcastEvent('team_updated', teamMembers);

    res.json({
      success: true,
      task: updatedTask,
      isNewlyCompleted,
      isOnTime,
      xpGained,
    });
  });

  // DELETE Task
  app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const taskIndex = tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    broadcastEvent('task_deleted', { id: deletedTask.id });
    res.json({ success: true, id });
  });

  // POST Add Comment to Task
  app.post('/api/tasks/:id/comments', (req: Request, res: Response) => {
    const { id } = req.params;
    const { text, userId, userName, userAvatar, isEncrypted } = req.body;
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });
    }

    const newComment: TaskComment = {
      id: `comm-${Date.now()}`,
      userId: userId || 'user-1',
      userName: userName || 'Adrian Pratama',
      userAvatar: userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: text || '',
      createdAt: new Date().toISOString(),
      isEncrypted: !!isEncrypted,
    };

    task.comments.push(newComment);
    task.updatedAt = new Date().toISOString();

    broadcastEvent('task_updated', task);
    res.status(201).json({ success: true, comment: newComment, task });
  });

  // BATCH SYNC: Handles offline queue synchronization
  app.post('/api/sync/batch', (req: Request, res: Response) => {
    const { queue } = req.body; // Array of actions queued offline
    const processed: string[] = [];
    const errors: string[] = [];

    if (Array.isArray(queue)) {
      for (const item of queue) {
        try {
          if (item.action === 'create' && item.payload) {
            const exists = tasks.some((t) => t.id === item.payload.id);
            if (!exists) {
              tasks.unshift({
                ...item.payload,
                updatedAt: new Date().toISOString(),
              });
              processed.push(item.id);
            }
          } else if (item.action === 'update' && item.payload && item.taskId) {
            const tIdx = tasks.findIndex((t) => t.id === item.taskId);
            if (tIdx !== -1) {
              tasks[tIdx] = {
                ...tasks[tIdx],
                ...item.payload,
                updatedAt: new Date().toISOString(),
              };
              processed.push(item.id);
            }
          } else if (item.action === 'delete' && item.taskId) {
            tasks = tasks.filter((t) => t.id !== item.taskId);
            processed.push(item.id);
          }
        } catch (err: any) {
          errors.push(item.id);
        }
      }
    }

    // Broadcast full sync update
    broadcastEvent('sync_completed', { processedCount: processed.length, tasksCount: tasks.length });

    res.json({
      success: true,
      processedCount: processed.length,
      tasks,
      teamMembers,
      serverTime: new Date().toISOString(),
    });
  });

  // GET Team Members & Gamification
  app.get('/api/team', (req: Request, res: Response) => {
    res.json({ success: true, teamMembers });
  });

  // POST Create/Register New Team Member (Instant Real-time Sync across all devices)
  app.post('/api/team', (req: Request, res: Response) => {
    const newMember: TeamMember = req.body;
    if (!newMember || !newMember.id) {
      return res.status(400).json({ success: false, message: 'Data member tidak valid' });
    }

    // Default to 'user' if not explicitly defined
    if (!newMember.userType) {
      newMember.userType = 'user';
    }

    const existingIndex = teamMembers.findIndex(
      (m) => m.id === newMember.id || m.email.toLowerCase() === newMember.email.toLowerCase()
    );

    if (existingIndex !== -1) {
      teamMembers[existingIndex] = {
        ...teamMembers[existingIndex],
        ...newMember,
      };
    } else {
      teamMembers.unshift(newMember);

      // Create notification for admin and community
      const registerNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: '🎉 Member Baru Bergabung!',
        message: `${newMember.name} (${newMember.occupation || 'Member Baru'}) berhasil mendaftar ke Komunitas TBK.`,
        type: 'level_up',
        read: false,
        createdAt: new Date().toISOString(),
      };
      notifications.unshift(registerNotif);
      broadcastEvent('notification_added', registerNotif);
    }

    // Broadcast updated team list to all connected clients (Admin PC & mobile devices)
    broadcastEvent('team_updated', teamMembers);

    res.status(201).json({
      success: true,
      member: newMember,
      teamMembers,
    });
  });

  // PUT Update Team Member (for Profile & Official Sosmed updates)
  app.put('/api/team/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const memberIndex = teamMembers.findIndex((m) => m.id === id);

    if (memberIndex === -1) {
      return res.status(404).json({ success: false, message: 'Member tidak ditemukan' });
    }

    teamMembers[memberIndex] = {
      ...teamMembers[memberIndex],
      ...updates,
    };

    broadcastEvent('team_updated', teamMembers);
    res.json({ success: true, member: teamMembers[memberIndex], teamMembers });
  });

  // GET Notifications
  app.get('/api/notifications', (req: Request, res: Response) => {
    res.json({ success: true, notifications });
  });

  // PUT Mark Notification Read
  app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
    const { id } = req.params;
    const notif = notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
    }
    res.json({ success: true, id });
  });

  // POST Mark All Notifications Read
  app.post('/api/notifications/read-all', (req: Request, res: Response) => {
    notifications.forEach((n) => (n.read = true));
    res.json({ success: true });
  });

  // GET Referrals & Rewards
  app.get('/api/referrals', (req: Request, res: Response) => {
    res.json({ success: true, referrals });
  });

  // POST Simulate Peer Action (For demonstrating real-time buddy collaboration)
  app.post('/api/simulate-peer-action', (req: Request, res: Response) => {
    const { actionType } = req.body;
    let message = '';

    if (actionType === 'buddy_checkoff') {
      // Find a task with buddy
      const taskWithBuddy = tasks.find((t) => t.buddyId && t.status !== 'done');
      if (taskWithBuddy && taskWithBuddy.subtasks.length > 0) {
        const unchecked = taskWithBuddy.subtasks.find((s) => !s.completed);
        if (unchecked) {
          unchecked.completed = true;
          taskWithBuddy.comments.push({
            id: `comm-${Date.now()}`,
            userId: taskWithBuddy.buddyId || 'user-2',
            userName: taskWithBuddy.buddyName || 'Kawan Pendamping',
            text: `🎯 Sub-tugas "${unchecked.title}" baru saja saya selesaikan! Ayo semangat!`,
            createdAt: new Date().toISOString(),
          });
          taskWithBuddy.updatedAt = new Date().toISOString();
          message = `Kawan ${taskWithBuddy.buddyName} menyelesaikan sub-tugas pada "${taskWithBuddy.title}"!`;
          broadcastEvent('task_updated', taskWithBuddy);
        }
      }
    } else if (actionType === 'cheer_comment') {
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
      if (randomTask) {
        const cheers = [
          'Mantap sekali kerjanya Kawan! Terus pertahankan ritme TBK kita! 🚀',
          'Sinergi solid! Jangan lupa istirahat sejenak kawan. 💪',
          'Semua target tepat waktu pasti tercapai bersama tim TBK! ⭐',
        ];
        const randomCheer = cheers[Math.floor(Math.random() * cheers.length)];
        const buddyUser = teamMembers[1]; // Siti
        randomTask.comments.push({
          id: `comm-${Date.now()}`,
          userId: buddyUser.id,
          userName: buddyUser.name,
          userAvatar: buddyUser.avatar,
          text: randomCheer,
          createdAt: new Date().toISOString(),
        });
        randomTask.updatedAt = new Date().toISOString();
        message = `${buddyUser.name} memberikan komentar penyemangat!`;
        broadcastEvent('task_updated', randomTask);
      }
    }

    const peerNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: '👥 Aktivitas Kawan TBK!',
      message: message || 'Kawan tim berkolaborasi secara real-time pada papan tugas.',
      type: 'buddy_invite',
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.unshift(peerNotif);
    broadcastEvent('notification_added', peerNotif);

    res.json({ success: true, message, tasks, notifications });
  });

  // GET Analytics Summary
  app.get('/api/analytics', (req: Request, res: Response) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const onTimeCompleted = tasks.filter((t) => t.status === 'done' && t.onTime).length;
    const buddyTasks = tasks.filter((t) => !!t.buddyId).length;
    const onTimeRate = completedTasks > 0 ? Math.round((onTimeCompleted / completedTasks) * 100) : 100;
    const buddySynergyRate = totalTasks > 0 ? Math.round((buddyTasks / totalTasks) * 100) : 0;

    // Category distribution
    const categoryStats: Record<string, number> = {};
    tasks.forEach((t) => {
      categoryStats[t.category] = (categoryStats[t.category] || 0) + 1;
    });

    // Priority distribution
    const priorityStats: Record<string, number> = {};
    tasks.forEach((t) => {
      priorityStats[t.priority] = (priorityStats[t.priority] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        onTimeRate,
        buddySynergyRate,
        openCollaborationTasks: totalTasks,
        totalTeamXp: teamMembers.reduce((acc, m) => acc + m.xp, 0),
        totalReferralPoints: teamMembers.reduce((acc, m) => acc + m.referralPoints, 0),
        categoryStats,
        priorityStats,
      },
    });
  });

  // GET iCalendar (.ics) download for all team tasks or single task
  app.get('/api/calendar/export.ics', (req: Request, res: Response) => {
    const { taskId } = req.query;
    let targetTasks = tasks;
    if (taskId) {
      targetTasks = tasks.filter((t) => t.id === taskId);
    }

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TBK Teman Bawa Kawan//Task Management System//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:TBK Tim Tasks & Deadlines',
    ];

    targetTasks.forEach((t) => {
      const due = new Date(t.dueDate);
      const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const dtstart = due.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:tbk-${t.id}@tbktaskmanager.id`);
      icsContent.push(`DTSTAMP:${dtstamp}`);
      icsContent.push(`DTSTART:${dtstart}`);
      icsContent.push(`DTEND:${dtstart}`);
      icsContent.push(`SUMMARY:[TBK] ${t.title}`);
      icsContent.push(
        `DESCRIPTION:Prioritas: ${t.priority.toUpperCase()}\\nPenanggung Jawab: ${t.assigneeName}${t.buddyName ? `\\nKawan Pendamping: ${t.buddyName}` : ''}\\nStatus: ${t.status.toUpperCase()}\\nKategori: ${t.category}`
      );
      icsContent.push(`STATUS:${t.status === 'done' ? 'COMPLETED' : 'CONFIRMED'}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="tbk-tasks-calendar.ics"');
    res.send(icsContent.join('\r\n'));
  });

  // Serve static files from public directory
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TBK Server running on http://localhost:${PORT}`);
  });
}

startServer();

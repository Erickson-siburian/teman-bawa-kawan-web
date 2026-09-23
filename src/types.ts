export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
  isEncrypted?: boolean;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskCategory =
  | 'content_production'
  | 'monetization_sponsor'
  | 'algorithm_growth'
  | 'collab_crosspromo'
  | 'distribution_engagement'
  | 'development'
  | 'design'
  | 'research'
  | 'marketing'
  | 'ops';

export type SocialPlatform = 'youtube' | 'tiktok' | 'instagram' | 'x_twitter' | 'podcast' | 'all';
export type ContentFormat = 'short_video' | 'long_video' | 'carousel' | 'livestream' | 'thread';

export interface Task {
  id: string;
  title: string;
  description: string;
  isEncrypted?: boolean;
  encryptedData?: EncryptedPayload;
  status: TaskStatus;
  priority: TaskPriority;
  creatorId: string;
  creatorName: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  buddyId?: string; // Teman Pendamping / Kawan TBK Saling Support
  buddyName?: string;
  buddyAvatar?: string;
  dueDate: string;
  category: TaskCategory;
  platform?: SocialPlatform;
  contentFormat?: ContentFormat;
  monetizationGoal?: string; // Target monetisasi (misal: "Sponsor Brand X", "Affiliate Review", "4.000 Jam Tayang YT")
  tags: string[];
  subtasks: Subtask[];
  comments: TaskComment[];
  completedAt?: string;
  onTime?: boolean;
  referralCodeUsed?: string;
  xpAwarded?: number;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending_sync' | 'sync_error';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'synergy' | 'punctuality' | 'mastery' | 'security' | 'monetization';
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

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  gender?: 'Laki-Laki' | 'Perempuan';
  phoneNumber?: string;
  occupation?: string;
  socialAccounts?: MemberSocialAccounts;
  creatorNiche?: string; // Niche konten pegiat medsos
  primaryPlatform?: string;
  monetizationStatus?: 'monetized' | 'in_progress' | 'target_reached';
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
  badges?: Badge[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'buddy_invite' | 'task_done' | 'level_up' | 'referral_reward' | 'sync' | 'security';
  read: boolean;
  createdAt: string;
}

export interface ReferralRecord {
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

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete' | 'comment';
  taskId: string;
  payload: any;
  timestamp: number;
  retries: number;
}

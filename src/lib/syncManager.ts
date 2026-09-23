import { SyncQueueItem, Task, TeamMember, NotificationItem } from '../types';

const STORAGE_KEY_TASKS = 'tbk_cached_tasks';
const STORAGE_KEY_TEAM = 'tbk_cached_team';
const STORAGE_KEY_NOTIFS = 'tbk_cached_notifs';
const STORAGE_KEY_OUTBOX = 'tbk_sync_outbox';

export class SyncManager {
  private static instance: SyncManager;
  private isSimulatedOffline: boolean = false;
  private outbox: SyncQueueItem[] = [];
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<(status: 'online' | 'offline' | 'syncing') => void> = new Set();
  private dataListeners: Set<(type: string, data: any) => void> = new Set();

  private constructor() {
    this.loadOutbox();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => this.handleNetworkChange());

      try {
        this.broadcastChannel = new BroadcastChannel('tbk_collab_channel');
        this.broadcastChannel.onmessage = (event) => {
          this.notifyDataListeners(event.data.type, event.data.data);
        };
      } catch (e) {
        // Fallback if BroadcastChannel not supported
      }

      this.initSSE();
    }
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  public isOnline(): boolean {
    if (this.isSimulatedOffline) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  public setSimulatedOffline(value: boolean) {
    this.isSimulatedOffline = value;
    this.notifyStatusListeners(this.isOnline() ? 'online' : 'offline');
    if (this.isOnline()) {
      this.flushOutbox();
    }
  }

  public getIsSimulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }

  public getOutboxCount(): number {
    return this.outbox.length;
  }

  private handleNetworkChange() {
    const status = this.isOnline() ? 'online' : 'offline';
    this.notifyStatusListeners(status);
    if (status === 'online') {
      this.initSSE();
      this.flushOutbox();
    } else {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    }
  }

  private initSSE() {
    if (typeof window === 'undefined' || !this.isOnline()) return;

    if (this.eventSource) {
      this.eventSource.close();
    }

    try {
      this.eventSource = new EventSource('/api/events');

      this.eventSource.addEventListener('task_created', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        this.notifyDataListeners('task_created', payload.data);
      });

      this.eventSource.addEventListener('task_updated', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        this.notifyDataListeners('task_updated', payload.data);
      });

      this.eventSource.addEventListener('task_deleted', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        this.notifyDataListeners('task_deleted', payload.data);
      });

      this.eventSource.addEventListener('team_updated', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        this.notifyDataListeners('team_updated', payload.data);
      });

      this.eventSource.addEventListener('notification_added', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        this.notifyDataListeners('notification_added', payload.data);
      });

      this.eventSource.addEventListener('sync_completed', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        this.notifyDataListeners('sync_completed', payload.data);
      });

      this.eventSource.onerror = () => {
        // SSE reconnects automatically
      };
    } catch (err) {
      // SSE error
    }
  }

  // Load Outbox Queue from local storage
  private loadOutbox() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OUTBOX);
      if (saved) {
        this.outbox = JSON.parse(saved);
      }
    } catch {
      this.outbox = [];
    }
  }

  private saveOutbox() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_OUTBOX, JSON.stringify(this.outbox));
    } catch {
      // Ignore
    }
  }

  // Queue an action for sync (used when offline or to assure persistence)
  public queueAction(action: 'create' | 'update' | 'delete' | 'comment', taskId: string, payload: any) {
    const item: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action,
      taskId,
      payload,
      timestamp: Date.now(),
      retries: 0,
    };

    this.outbox.push(item);
    this.saveOutbox();

    // Broadcast across local tabs immediately
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: `local_${action}`,
        data: payload,
      });
    }

    if (this.isOnline()) {
      this.flushOutbox();
    }
  }

  // Flush Outbox Queue to server
  public async flushOutbox(): Promise<{ success: boolean; processed: number }> {
    if (!this.isOnline() || this.outbox.length === 0) {
      return { success: true, processed: 0 };
    }

    this.notifyStatusListeners('syncing');

    try {
      const itemsToSync = [...this.outbox];
      const res = await fetch('/api/sync/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue: itemsToSync }),
      });

      if (!res.ok) throw new Error('Sync endpoint failed');

      const data = await res.json();
      if (data.success) {
        this.outbox = [];
        this.saveOutbox();
        this.notifyStatusListeners('online');
        this.notifyDataListeners('sync_completed', data);
        return { success: true, processed: data.processedCount || itemsToSync.length };
      }
      throw new Error('Sync rejected');
    } catch (err) {
      console.warn('Sync failed, will retry later:', err);
      this.notifyStatusListeners(this.isOnline() ? 'online' : 'offline');
      return { success: false, processed: 0 };
    }
  }

  // Local Storage Helpers
  public getCachedTasks(): Task[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEY_TASKS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public setCachedTasks(tasks: Task[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch {
      // Ignore
    }
  }

  public getCachedTeam(): TeamMember[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEY_TEAM);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public setCachedTeam(team: TeamMember[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(team));
    } catch {
      // Ignore
    }
  }

  public getCachedNotifs(): NotificationItem[] | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEY_NOTIFS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public setCachedNotifs(notifs: NotificationItem[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
    } catch {
      // Ignore
    }
  }

  // Listeners
  public onStatusChange(callback: (status: 'online' | 'offline' | 'syncing') => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public onDataEvent(callback: (type: string, data: any) => void) {
    this.dataListeners.add(callback);
    return () => this.dataListeners.delete(callback);
  }

  private notifyStatusListeners(status: 'online' | 'offline' | 'syncing') {
    this.listeners.forEach((cb) => cb(status));
  }

  private notifyDataListeners(type: string, data: any) {
    this.dataListeners.forEach((cb) => cb(type, data));
  }
}

export const syncManager = SyncManager.getInstance();

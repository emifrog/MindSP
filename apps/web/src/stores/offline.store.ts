import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

interface OfflineState {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  lastSyncAt: Date | null;
  syncInProgress: boolean;
  
  // Actions
  setOnlineStatus: (isOnline: boolean) => void;
  addPendingAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>) => void;
  markActionSynced: (actionId: string) => void;
  clearSyncedActions: () => void;
  setSyncInProgress: (inProgress: boolean) => void;
  updateLastSync: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    immer((set) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingActions: [],
      lastSyncAt: null,
      syncInProgress: false,
      
      setOnlineStatus: (isOnline) => set((state) => {
        state.isOnline = isOnline;
      }),
      
      addPendingAction: (action) => set((state) => {
        state.pendingActions.push({
          ...action,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          synced: false,
        });
      }),
      
      markActionSynced: (actionId) => set((state) => {
        const action = state.pendingActions.find(a => a.id === actionId);
        if (action) {
          action.synced = true;
        }
      }),
      
      clearSyncedActions: () => set((state) => {
        state.pendingActions = state.pendingActions.filter(a => !a.synced);
      }),
      
      setSyncInProgress: (inProgress) => set((state) => {
        state.syncInProgress = inProgress;
      }),
      
      updateLastSync: () => set((state) => {
        state.lastSyncAt = new Date();
      }),
    })),
    {
      name: 'mindsp-offline',
      partialize: (state) => ({
        pendingActions: state.pendingActions,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
);
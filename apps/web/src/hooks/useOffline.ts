import { useEffect } from 'react';
import { useOfflineStore } from '../stores/offline.store';

export function useOffline() {
  const { 
    isOnline, 
    setOnlineStatus, 
    pendingActions,
    syncInProgress,
    setSyncInProgress,
    clearSyncedActions,
    updateLastSync,
  } = useOfflineStore();
  
  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      // Trigger sync when coming back online
      if (pendingActions.length > 0) {
        syncPendingActions();
      }
    };
    
    const handleOffline = () => {
      setOnlineStatus(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingActions]);
  
  const syncPendingActions = async () => {
    if (syncInProgress || pendingActions.length === 0) return;
    
    setSyncInProgress(true);
    
    try {
      // Sync each pending action
      for (const action of pendingActions.filter(a => !a.synced)) {
        try {
          await syncAction(action);
          useOfflineStore.getState().markActionSynced(action.id);
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
        }
      }
      
      clearSyncedActions();
      updateLastSync();
    } finally {
      setSyncInProgress(false);
    }
  };
  
  const syncAction = async (action: any) => {
    const endpoint = `/api/${action.resource}`;
    const method = action.type === 'CREATE' ? 'POST' 
                 : action.type === 'UPDATE' ? 'PUT' 
                 : 'DELETE';
    
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action.data),
    });
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
    
    return response.json();
  };
  
  return {
    isOnline,
    pendingActions: pendingActions.filter(a => !a.synced),
    syncInProgress,
    syncPendingActions,
  };
}
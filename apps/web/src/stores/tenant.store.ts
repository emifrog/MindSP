import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Tenant } from '@prisma/client';

interface TenantState {
  tenant: Tenant | null;
  features: string[];
  settings: Record<string, any>;
  
  // Actions
  setTenant: (tenant: Tenant) => void;
  updateSettings: (settings: Record<string, any>) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    immer((set) => ({
      tenant: null,
      features: [],
      settings: {},
      
      setTenant: (tenant) => set((state) => {
        state.tenant = tenant;
        state.features = tenant.features || [];
        state.settings = tenant.settings as Record<string, any> || {};
      }),
      
      updateSettings: (settings) => set((state) => {
        state.settings = { ...state.settings, ...settings };
        if (state.tenant) {
          state.tenant.settings = state.settings;
        }
      }),
      
      clearTenant: () => set((state) => {
        state.tenant = null;
        state.features = [];
        state.settings = {};
      }),
    })),
    {
      name: 'mindsp-tenant',
    }
  )
);
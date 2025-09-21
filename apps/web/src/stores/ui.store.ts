import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Mobile
  mobileMenuOpen: boolean;
  
  // Modals
  modals: Record<string, boolean>;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Loading
  globalLoading: boolean;
  loadingMessage: string | null;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    sidebarOpen: true,
    sidebarCollapsed: false,
    mobileMenuOpen: false,
    modals: {},
    theme: 'system',
    globalLoading: false,
    loadingMessage: null,
    
    toggleSidebar: () => set((state) => {
      state.sidebarOpen = !state.sidebarOpen;
    }),
    
    setSidebarOpen: (open) => set((state) => {
      state.sidebarOpen = open;
    }),
    
    toggleSidebarCollapsed: () => set((state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    }),
    
    setMobileMenuOpen: (open) => set((state) => {
      state.mobileMenuOpen = open;
    }),
    
    openModal: (modalId) => set((state) => {
      state.modals[modalId] = true;
    }),
    
    closeModal: (modalId) => set((state) => {
      state.modals[modalId] = false;
    }),
    
    setTheme: (theme) => set((state) => {
      state.theme = theme;
      
      // Apply theme to DOM
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    }),
    
    setGlobalLoading: (loading, message) => set((state) => {
      state.globalLoading = loading;
      state.loadingMessage = message || null;
    }),
  }))
);
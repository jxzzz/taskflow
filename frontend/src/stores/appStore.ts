import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';
export type Language = 'zh-CN' | 'en';

interface AppState {
  sidebarCollapsed: boolean;
  theme: ThemeMode;
  language: Language;

  toggleSidebar: () => void;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  theme: 'light',
  language: 'zh-CN',

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
}));

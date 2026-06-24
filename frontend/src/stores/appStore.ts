import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';
export type ColorScheme = 'pastel-warm' | 'pastel-cool' | 'pastel-mint' | 'pastel-rose';
export type Language = 'zh-CN' | 'en';

interface AppState {
  sidebarCollapsed: boolean;
  theme: ThemeMode;
  colorScheme: ColorScheme;
  language: Language;

  toggleSidebar: () => void;
  setTheme: (theme: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setLanguage: (lang: Language) => void;
}

/** Color scheme presets — background & accent tones */
export const COLOR_SCHEMES: Record<ColorScheme, { label: string; bgLayout: string; accentRgb: string }> = {
  'pastel-warm': {
    label: '暖色调',
    bgLayout: '#f6f4f0',
    accentRgb: '155, 151, 212',  // lavender
  },
  'pastel-cool': {
    label: '冷色调',
    bgLayout: '#f0f3f6',
    accentRgb: '153, 188, 219',  // sky blue
  },
  'pastel-mint': {
    label: '薄荷绿',
    bgLayout: '#f2f6f0',
    accentRgb: '155, 188, 158',  // sage green
  },
  'pastel-rose': {
    label: '玫瑰粉',
    bgLayout: '#f8f4f4',
    accentRgb: '200, 150, 150',  // dusty rose
  },
};

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  theme: 'light',
  colorScheme: 'pastel-warm',
  language: 'zh-CN',

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setTheme: (theme) => set({ theme }),
  setColorScheme: (colorScheme) => set({ colorScheme }),
  setLanguage: (language) => set({ language }),
}));

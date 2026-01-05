import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: storage.getBoolean('theme.isDark') ?? false,

  toggleTheme: () => {
    set((state) => {
      const newValue = !state.isDark;
      storage.set('theme.isDark', newValue);
      return { isDark: newValue };
    });
  },

  setTheme: (isDark: boolean) => {
    storage.set('theme.isDark', isDark);
    set({ isDark });
  },
}));

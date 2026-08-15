import { create } from "zustand";
import { persist } from "zustand/middleware";

const THEME_STORAGE_KEY = "retrom-theme";
const THEME_STORE_VERSION = 1;

export type Theme = "dark" | "light";
export type ThemeContext = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const useTheme = create<ThemeContext>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme: Theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      version: THEME_STORE_VERSION,
      partialize: ({ theme }) => ({ theme }),
      onRehydrateStorage: (current) => {
        console.debug(
          "[ThemeStore] Rehydrating theme store. Current non-hydrated state:",
          current,
        );

        return (state) => {
          console.debug(
            "[ThemeStore] Rehydrated theme store. New state:",
            state,
          );
          if (state) {
            applyTheme(state.theme);
          }
        };
      },
    },
  ),
);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

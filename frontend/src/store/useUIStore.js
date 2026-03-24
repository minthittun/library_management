import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      darkMode: false,
      density: 'comfortable',
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleDensity: () =>
        set((state) => ({
          density: state.density === 'comfortable' ? 'compact' : 'comfortable',
        })),
      toggleDarkMode: () => set((state) => {
        const newMode = !state.darkMode;
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: newMode };
      }),
      initDarkMode: () => set((state) => {
        if (state.darkMode) {
          document.documentElement.classList.add('dark');
        }
        return {};
      }),
    }),
    { name: 'ui-storage' }
  )
);

export default useUIStore;

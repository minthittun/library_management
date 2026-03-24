import { create } from "zustand";

const useModalStore = create((set) => ({
  isOpen: false,
  type: "default",
  title: "",
  message: "",
  onConfirm: null,
  onClose: null,

  showAlert: (title, message, type = "default") => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        type,
        title,
        message,
        onConfirm: resolve,
        onClose: () => {
          set({ isOpen: false });
          resolve(false);
        },
      });
    });
  },

  showConfirm: (title, message) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        type: "confirm",
        title,
        message,
        onConfirm: () => {
          set({ isOpen: false });
          resolve(true);
        },
        onClose: () => {
          set({ isOpen: false });
          resolve(false);
        },
      });
    });
  },

  close: () => set({ isOpen: false }),
}));

export default useModalStore;

import { create } from 'zustand';
import { authAPI } from '../api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  currentLibrary: localStorage.getItem('currentLibrary') || null,
  
  login: async (username, password) => {
    try {
      const res = await authAPI.login({ username, password });
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      const libraryToSet = user.role === 'superadmin'
        ? null
        : (user.library?._id || user.library || null);
      
      if (libraryToSet) {
        localStorage.setItem('currentLibrary', libraryToSet);
      }
      
      set({ 
        user, 
        token, 
        isAuthenticated: true,
        currentLibrary: libraryToSet
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentLibrary');
    set({ user: null, token: null, isAuthenticated: false, currentLibrary: null });
  },
  
  setCurrentLibrary: (libraryId) => {
    localStorage.setItem('currentLibrary', libraryId);
    set({ currentLibrary: libraryId });
  },
  
  isSuperAdmin: () => {
    return get().user?.role === 'superadmin';
  },
  
  isAdmin: () => {
    return get().user?.role === 'admin';
  },
  
  getLibraries: () => {
    const library = get().user?.library;
    return library ? [library] : [];
  },
}));

export default useAuthStore;

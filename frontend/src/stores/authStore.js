import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authAPI.login({ email, password });
          const { token, user } = res.data.data;
          localStorage.setItem('satish_token', token);
          set({ user, token, isLoading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed.';
          set({ isLoading: false, error: msg });
          return { success: false, error: msg };
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authAPI.register({ name, email, password });
          const { token, user } = res.data.data;
          localStorage.setItem('satish_token', token);
          set({ user, token, isLoading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed.';
          set({ isLoading: false, error: msg });
          return { success: false, error: msg };
        }
      },

      logout: () => {
        localStorage.removeItem('satish_token');
        set({ user: null, token: null, error: null });
      },

      isAdmin: () => {
        const state = useAuthStore.getState();
        return state.user?.role === 'admin';
      },
    }),
    { name: 'satish_auth' }
  )
);

export default useAuthStore;

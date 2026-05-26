// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "https://moviechamp256-nodejs-api-production.up.railway.app/api/v1";

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Set up axios interceptor to include the token in requests
api.interceptors.request.use(
  (config) => {
    // Get token from store
    const state = useAuthStore.getState();
    
    if (state.accessToken) {
      config.headers.Authorization = `Bearer ${state.accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Set up axios interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const state = useAuthStore.getState();
        
        // Only attempt refresh if we have a refresh token
        if (state.refreshToken) {
          const response = await axios.post(`${BASE_API_URL}/refresh-token`, {
            refreshToken: state.refreshToken
          });
          
          const { accessToken } = response.data;
          
          // Update token in store
          state.setTokens(accessToken, state.refreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout
        useAuthStore.getState().logout();
      }
    }
    
    return Promise.reject(error);
  }
);

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  username?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      initialize: async () => {
        try {
          set({ isLoading: true });
          
          // Get current state
          const { accessToken } = get();
          
          // If we have an access token, try to get user data
          if (accessToken) {
            const response = await api.get("/me", {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });
            
            set({
              user: response.data.user,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          // If request fails, clear auth state
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (credentials) => {
        set({ isLoading: true });
        
        try {
          const response = await api.post("/login", credentials);
          const { user, accessToken, refreshToken } = response.data.data;
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        
        try {
          const response = await api.post("/register", userData);
          const { user, accessToken, refreshToken } = response.data.data;
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          const { accessToken } = get();
          
          if (accessToken) {
            await api.post("/logout", {}, {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });
          }
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      // Only persist these fields
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
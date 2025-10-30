import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Web storage fallback
const storage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  profile: {
    id?: number;
    user_id?: number;
    username?: string;
    display_name?: string;
    total_points?: number;
  } | null;

  setTokens: (access: string, refresh: string) => void;
  setProfile: (p: AuthState["profile"]) => void;
  loadFromStorage: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  profile: null,

  setTokens: (access, refresh) => {
    set({ accessToken: access, refreshToken: refresh });
    if (refresh) {
      storage.setItemAsync("refreshToken", refresh).catch(() => {});
    }
  },

  setProfile: (p) => {
    set({ profile: p });
  },

  loadFromStorage: async () => {
    const storedRefresh = await storage.getItemAsync("refreshToken");
    if (storedRefresh) {
      set({ refreshToken: storedRefresh });
    }
  },

  logout: async () => {
    await storage.deleteItemAsync("refreshToken");
    set({ accessToken: null, refreshToken: null, profile: null });
  },
}));

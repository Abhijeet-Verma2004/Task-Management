"use client";

import { create } from "zustand";
import { me } from "@/services/auth";
import { User } from "@/types";

type AuthState = {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setSession: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  setSession: (user, token) => {
    localStorage.setItem("ttm-token", token);
    set({ user, token, hydrated: true });
  },
  logout: () => {
    localStorage.removeItem("ttm-token");
    set({ user: null, token: null, hydrated: true });
  },
  hydrate: async () => {
    const token = localStorage.getItem("ttm-token");
    if (!token) return set({ hydrated: true });
    try {
      const user = await me();
      set({ user, token, hydrated: true });
    } catch {
      localStorage.removeItem("ttm-token");
      set({ user: null, token: null, hydrated: true });
    }
  }
}));

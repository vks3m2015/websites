"use client";

import { AuthResponse } from "./api";

const STORAGE_KEY = "wellness_session";

export type StoredSession = {
  userId: string;
  name: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
};

export function saveSession(auth: AuthResponse) {
  const session: StoredSession = {
    userId: auth.userId,
    name: auth.name,
    roles: auth.roles,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { UserProfile } from "./types";
export { CURRENCIES } from "./currencies";

const STORAGE_KEY = "slate-profile";

interface ProfileContextValue {
  profile: UserProfile | null;
  hydrated: boolean;
  setProfile: (p: UserProfile) => void;
  clearProfile: () => void;
  currencySymbol: string;
  locale: string;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile: UserProfile | null) {
  if (profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfileState(loadProfile());
    setHydrated(true);
  }, []);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    saveProfile(p);
  }, []);

  const clearProfile = useCallback(() => {
    setProfileState(null);
    saveProfile(null);
  }, []);

  const currencySymbol = profile?.currencySymbol ?? "PHP";
  const locale = profile?.locale ?? "en-PH";

  return (
    <ProfileContext.Provider
      value={{ profile, hydrated, setProfile, clearProfile, currencySymbol, locale }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}

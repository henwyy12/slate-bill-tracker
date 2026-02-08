"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { UserProfile } from "./types";
import { supabase } from "./supabase";
import { useAuth } from "./use-auth";
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

function saveProfileLocal(profile: UserProfile | null) {
  if (profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load profile — from Supabase if signed in, localStorage otherwise
  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            const p: UserProfile = {
              name: data.name,
              country: data.country ?? "",
              currencySymbol: data.currency_symbol ?? "PHP",
              locale: data.locale ?? "en-PH",
              email: user.email,
            };
            setProfileState(p);
            saveProfileLocal(p);
          } else {
            // No remote profile — use local if exists
            const local = loadProfile();
            if (local) {
              setProfileState(local);
              // Push local profile to Supabase
              supabase.from("profiles").upsert({
                id: user.id,
                name: local.name,
                country: local.country,
                currency_symbol: local.currencySymbol,
                locale: local.locale,
              });
            }
          }
          setHydrated(true);
        });
    } else {
      setProfileState(loadProfile());
      setHydrated(true);
    }
  }, [user]);

  const setProfile = useCallback(
    (p: UserProfile) => {
      setProfileState(p);
      saveProfileLocal(p);

      if (user) {
        supabase.from("profiles").upsert({
          id: user.id,
          name: p.name,
          country: p.country,
          currency_symbol: p.currencySymbol,
          locale: p.locale,
        });
      }
    },
    [user]
  );

  const clearProfile = useCallback(() => {
    setProfileState(null);
    saveProfileLocal(null);
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

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
import { toast } from "sonner";
export { CURRENCIES } from "./currencies";

const STORAGE_KEY = "slate-profile";

export const FREE_BILL_LIMIT = 1; // TODO: change back to 8 before shipping

interface ProfileContextValue {
  profile: UserProfile | null;
  hydrated: boolean;
  setProfile: (p: UserProfile) => void;
  clearProfile: () => void;
  currencySymbol: string;
  locale: string;
  isPro: boolean;
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
  // isPro is ONLY set from Supabase — never from localStorage
  const [isPro, setIsPro] = useState(false);

  // Load profile — from Supabase if signed in, localStorage otherwise
  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (error && error.code !== "PGRST116") {
            toast.error("Failed to load profile");
          }
          if (data) {
            const p: UserProfile = {
              name: data.name,
              country: data.country ?? "",
              currencySymbol: data.currency_symbol ?? "PHP",
              locale: data.locale ?? "en-PH",
            };
            setProfileState(p);
            saveProfileLocal(p);
            // isPro only comes from server
            setIsPro(data.is_pro ?? false);
          } else {
            // No remote profile — use local if exists
            const local = loadProfile();
            if (local) {
              setProfileState(local);
              // Push local profile to Supabase (isPro defaults to false)
              supabase.from("profiles").upsert({
                id: user.id,
                name: local.name,
                country: local.country,
                currency_symbol: local.currencySymbol,
                locale: local.locale,
                is_pro: false,
              }).then(({ error: upsertError }) => {
                if (upsertError) toast.error("Failed to sync profile");
              });
            }
            setIsPro(false);
          }
          setHydrated(true);
        });
    } else {
      setProfileState(loadProfile());
      // Not signed in = never pro
      setIsPro(false);
      setHydrated(true);
    }
  }, [user]);

  const setProfile = useCallback(
    (p: UserProfile) => {
      setProfileState(p);
      saveProfileLocal(p);

      if (user) {
        // Never send is_pro from client — server controls that
        supabase.from("profiles").upsert({
          id: user.id,
          name: p.name,
          country: p.country,
          currency_symbol: p.currencySymbol,
          locale: p.locale,
        }).then(({ error }) => {
          if (error) toast.error("Failed to save profile");
        });
      }
    },
    [user]
  );

  const clearProfile = useCallback(() => {
    setProfileState(null);
    saveProfileLocal(null);
    setIsPro(false);
  }, []);

  const currencySymbol = profile?.currencySymbol ?? "PHP";
  const locale = profile?.locale ?? "en-PH";

  return (
    <ProfileContext.Provider
      value={{ profile, hydrated, setProfile, clearProfile, currencySymbol, locale, isPro }}
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

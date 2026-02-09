"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, LogOut, Search } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { useProfile, CURRENCIES } from "@/lib/use-profile";
import { supabase } from "@/lib/supabase";
import type { Currency } from "@/lib/currencies";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";

type EditingField = "name" | "currency" | null;

export default function SettingsPage() {
  const router = useRouter();
  const { user, signInWithGoogle, signOut } = useAuth();
  const { profile, setProfile } = useProfile();

  const [editing, setEditing] = useState<EditingField>(null);
  const [editValue, setEditValue] = useState("");
  const [currencyDrawerOpen, setCurrencyDrawerOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");

  const filteredCurrencies = useMemo(() => {
    if (!currencySearch.trim()) return CURRENCIES;
    const q = currencySearch.toLowerCase();
    return CURRENCIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );
  }, [currencySearch]);

  const currentCountry = CURRENCIES.find((c) => c.code === profile?.country) ?? CURRENCIES[0];

  function startEdit(field: "name") {
    setEditValue(profile?.name ?? "");
    setEditing(field);
  }

  function cancelEdit() {
    setEditing(null);
    setEditValue("");
  }

  function saveEdit() {
    if (!profile) return;

    if (editing === "name") {
      if (!editValue.trim()) {
        toast.error("Name is required");
        return;
      }
      setProfile({ ...profile, name: editValue.trim() });
      toast.success("Name updated");
    }

    setEditing(null);
    setEditValue("");
  }

  function handleSelectCurrency(country: Currency) {
    if (!profile) return;
    setProfile({
      ...profile,
      country: country.code,
      currencySymbol: country.symbol,
      locale: country.locale,
    });
    setCurrencyDrawerOpen(false);
    setCurrencySearch("");
    toast.success("Currency updated");
  }

  return (
    <div className="animate-slide-up min-h-[100dvh] bg-background">
      {/* Header */}
      <div className="flex items-center px-2 pt-12 pb-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-secondary"
        >
          <ChevronLeft className="size-5" />
        </button>
      </div>

      <div className="px-5">
        <h1 className="text-3xl font-heading">Personal info</h1>
      </div>

      {/* Fields */}
      <div className="mt-6">
        {/* Name */}
        <div className="border-b border-border px-5 py-5">
          {editing === "name" ? (
            <div>
              <p className="text-sm font-medium">Name</p>
              <Input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); }}
                className="mt-2"
              />
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={saveEdit}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="mt-0.5 text-sm">{profile?.name}</p>
              </div>
              <button
                type="button"
                onClick={() => startEdit("name")}
                className="text-sm font-semibold underline underline-offset-2"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Currency */}
        <div className="border-b border-border px-5 py-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="mt-0.5 text-sm">
                {currentCountry.name} ({currentCountry.symbol})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrencyDrawerOpen(true)}
              className="text-sm font-semibold underline underline-offset-2"
            >
              Edit
            </button>
          </div>
        </div>
        {/* Account / Sync */}
        <div className="border-b border-border px-5 py-5">
          {user ? (
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Account</p>
                <p className="mt-0.5 select-text text-sm">{user.email}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Bills synced to cloud</p>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors"
              >
                <LogOut className="size-3.5" />
                Sign out
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">Account</p>
              <p className="mt-0.5 text-sm text-muted-foreground/60">
                Sign in to sync bills across devices
              </p>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-medium text-background transition-transform active:scale-[0.98]"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>
          )}
        </div>

        {/* Reset */}
        <div className="px-5 py-5">
          <button
            type="button"
            onClick={async () => {
              if (!confirm("This will permanently delete all your data. Continue?")) return;
              if (user) {
                await Promise.all([
                  supabase.from("bills").delete().eq("user_id", user.id),
                  supabase.from("profiles").delete().eq("id", user.id),
                ]);
              }
              localStorage.clear();
              router.replace("/onboarding");
            }}
            className="text-sm text-destructive/60 transition-colors active:text-destructive"
          >
            Reset all data
          </button>
        </div>
      </div>

      {/* Currency drawer */}
      <Drawer open={currencyDrawerOpen} onOpenChange={(open) => { setCurrencyDrawerOpen(open); if (!open) setCurrencySearch(""); }}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="font-semibold [font-family:inherit]">
              Select Currency
            </DrawerTitle>
          </DrawerHeader>
          <div className="relative mx-4 mb-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search country or currency"
              value={currencySearch}
              onChange={(e) => setCurrencySearch(e.target.value)}
              className="w-full rounded-xl bg-secondary/50 py-3 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground/50 focus:bg-secondary transition-colors"
            />
          </div>
          <div className="max-h-[50vh] overflow-y-auto px-4 pb-10">
            <div className="space-y-1.5">
              {filteredCurrencies.map((country) => {
                const isActive = currentCountry.code === country.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelectCurrency(country)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-foreground text-background"
                        : "bg-secondary/50 text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span>{country.name}</span>
                    <span className={`min-w-[3ch] text-right ${isActive ? "text-background/60" : "text-muted-foreground"}`}>
                      {country.symbol}
                    </span>
                  </button>
                );
              })}
              {filteredCurrencies.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No results for &ldquo;{currencySearch}&rdquo;
                </p>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

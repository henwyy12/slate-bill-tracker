"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import { useProfile, CURRENCIES } from "@/lib/use-profile";
import type { Currency } from "@/lib/currencies";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";

type EditingField = "name" | "email" | "currency" | null;

export default function SettingsPage() {
  const router = useRouter();
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

  function startEdit(field: "name" | "email") {
    setEditValue(field === "name" ? (profile?.name ?? "") : (profile?.email ?? ""));
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
    } else if (editing === "email") {
      setProfile({ ...profile, email: editValue.trim() || undefined });
      toast.success("Email updated");
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

        {/* Email */}
        <div className="border-b border-border px-5 py-5">
          {editing === "email" ? (
            <div>
              <p className="text-sm font-medium">Email</p>
              <Input
                autoFocus
                type="email"
                placeholder="you@example.com"
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
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="mt-0.5 text-sm">
                  {profile?.email || <span className="text-muted-foreground">Not provided</span>}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEdit("email")}
                className="text-sm font-semibold underline underline-offset-2"
              >
                {profile?.email ? "Edit" : "Add"}
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
          <div className="max-h-[50vh] overflow-y-auto px-4 pb-6">
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

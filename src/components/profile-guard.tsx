"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/use-profile";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { profile, hydrated } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !profile) {
      router.replace("/onboarding");
    }
  }, [hydrated, profile, router]);

  if (!hydrated || !profile) return null;

  return <>{children}</>;
}

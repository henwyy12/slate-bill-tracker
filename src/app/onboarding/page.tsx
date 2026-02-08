"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ChevronLeft, Search } from "lucide-react";
import { useProfile, CURRENCIES } from "@/lib/use-profile";
import type { Currency } from "@/lib/currencies";
import { getGreeting } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

type Step = "name" | "country" | "welcome";

const WELCOME_MESSAGES = [
  "Setting up your experience",
  "Almost there",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Currency | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return CURRENCIES;
    const q = search.toLowerCase();
    return CURRENCIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );
  }, [search]);

  // Already onboarded — go home (but not during welcome step)
  useEffect(() => {
    if (profile && step !== "welcome") router.replace("/");
  }, [profile, router, step]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    setShowBackToTop(e.currentTarget.scrollTop > 300);
  }

  // Welcome message sequence
  useEffect(() => {
    if (step !== "welcome") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < WELCOME_MESSAGES.length; i++) {
      timers.push(setTimeout(() => setMessageIndex(i), i * 2800));
    }
    timers.push(
      setTimeout(() => setMessageIndex(WELCOME_MESSAGES.length), WELCOME_MESSAGES.length * 2800)
    );
    timers.push(
      setTimeout(() => setShowButton(true), WELCOME_MESSAGES.length * 2800 + 800)
    );
    return () => timers.forEach(clearTimeout);
  }, [step]);

  if (profile && step !== "welcome") return null;

  function handleNameContinue() {
    if (!name.trim()) return;
    setStep("country");
  }

  function handleConfirmCountry() {
    if (!selected) return;
    setProfile({
      name: name.trim(),
      country: selected.code,
      currencySymbol: selected.symbol,
      locale: selected.locale,
    });
    setStep("welcome");
  }

  function scrollToTop() {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  const greeting = getGreeting();

  return (
    <div className="mx-auto min-h-[100dvh] max-w-md bg-background">
      <AnimatePresence mode="wait">
        {step === "name" ? (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex min-h-[100dvh] flex-col px-6"
          >
            <div className="flex-1 flex flex-col justify-center">
              <h1 className="font-heading text-4xl">
                What should we{"\n"}call you?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ll use this to personalize your experience.
              </p>
              <input
                type="text"
                autoFocus
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameContinue();
                }}
                className="mt-8 border-b-2 border-input bg-transparent pb-3 text-2xl font-medium outline-none placeholder:text-muted-foreground/30 focus:border-foreground transition-colors"
              />
            </div>
            <div className="pb-10">
              <button
                onClick={handleNameContinue}
                disabled={!name.trim()}
                className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-30"
              >
                Continue
              </button>
            </div>
          </motion.div>

        ) : step === "country" ? (
          <motion.div
            key="country"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex h-[100dvh] flex-col"
          >
            {/* Fixed header */}
            <div className="shrink-0 px-6 pt-12" ref={topRef}>
              <button
                onClick={() => setStep("name")}
                className="mb-4 flex items-center text-sm text-muted-foreground transition-colors active:opacity-60"
              >
                <ChevronLeft className="size-4" />
                Back
              </button>
              <h1 className="font-heading text-4xl">
                Where are you{"\n"}from, {name.trim()}?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ll set your currency based on this.
              </p>
            </div>

            {/* Scrollable list */}
            <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto" style={{ paddingBottom: selected ? 120 : 60 }}>
              {/* Sticky search */}
              <div className="sticky top-0 z-10 bg-background px-6 pb-2 pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search country or currency"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl bg-secondary/50 py-3 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground/50 focus:bg-secondary transition-colors"
                  />
                </div>
              </div>

              <div className="mt-2 space-y-2 px-6">
                {filteredCurrencies.map((country) => {
                  const isSelected = selected?.code === country.code;
                  return (
                    <button
                      key={country.code}
                      onClick={() => setSelected(country)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-foreground text-background"
                          : "bg-secondary/50 hover:bg-secondary"
                      }`}
                    >
                      <span>{country.name}</span>
                      <span className={`min-w-[3ch] text-right ${isSelected ? "text-background/60" : "text-muted-foreground"}`}>
                        {country.symbol}
                      </span>
                    </button>
                  );
                })}
                {filteredCurrencies.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No results for &ldquo;{search}&rdquo;
                  </p>
                )}
              </div>

              <div className="h-6" />
            </div>

            {/* Back to top */}
            <AnimatePresence>
              {showBackToTop && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={scrollToTop}
                  className="fixed right-5 bottom-6 z-20 flex size-10 items-center justify-center rounded-full bg-foreground shadow-md transition-colors active:opacity-80"
                >
                  <ArrowUp className="size-4 text-background" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Confirmation bar */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  exit={{ y: 100 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md"
                >
                  <div className="bg-background px-6 pb-10 pt-4">
                    <p className="mb-3 text-center text-sm text-muted-foreground">
                      {selected.name} ({selected.symbol})
                    </p>
                    <button
                      onClick={handleConfirmCountry}
                      className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]"
                    >
                      Yes, that&apos;s right
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        ) : (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6"
          >
            {/* Card → List → Flower animation (fades out when welcome text appears) */}
            <AnimatePresence>
              {messageIndex < WELCOME_MESSAGES.length && (
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2"
                  style={{ width: 160, height: 100, marginTop: -110 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  {/* Card shell */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 bg-stone-400"
                    style={{ x: "-50%", y: "-50%", transformOrigin: "center center" }}
                    animate={{
                      width: [120, 120, 36],
                      height: [72, 72, 3],
                      borderRadius: [14, 14, 2],
                      opacity: [0.35, 0.35, 0],
                    }}
                    transition={{ duration: 2.4, times: [0, 0.5, 1], ease: "easeInOut" }}
                  />

                  {/* Card inner details */}
                  {[
                    { w: 50, yOff: -16 },
                    { w: 36, yOff: -6 },
                    { w: 28, yOff: 8 },
                  ].map((line, i) => (
                    <motion.div
                      key={`detail-${i}`}
                      className="absolute left-1/2 top-1/2 h-[2.5px] rounded-full bg-stone-400"
                      style={{ transformOrigin: "center center" }}
                      animate={{
                        width: [line.w, line.w, 0],
                        x: ["-60%", "-60%", "-50%"],
                        y: [line.yOff, line.yOff, 0],
                        opacity: [0.3, 0.3, 0],
                      }}
                      transition={{ duration: 2, times: [0, 0.5, 1], ease: "easeInOut" }}
                    />
                  ))}

                  {/* 6 petal bars: list → flower */}
                  {Array.from({ length: 6 }).map((_, i) => {
                    const listY = (i - 2.5) * 6;
                    const flowerRotation = i * 30;
                    return (
                      <motion.div
                        key={`petal-${i}`}
                        className="absolute left-1/2 top-1/2 h-[2.5px] rounded-full bg-stone-400"
                        style={{ marginLeft: -20, marginTop: -1.25, transformOrigin: "center center" }}
                        animate={{
                          width: [0, 0, 36, 44],
                          y: [0, 0, listY, 0],
                          rotate: [0, 0, 0, flowerRotation],
                          opacity: [0, 0, 0.6, 0.35],
                        }}
                        transition={{
                          duration: 4.5,
                          times: [0, 0.38, 0.48, 1],
                          delay: i * 0.03,
                          ease: "easeInOut",
                        }}
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col items-center">
              <AnimatePresence mode="wait">
                {messageIndex < WELCOME_MESSAGES.length ? (
                  <motion.p
                    key={messageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="text-sm text-muted-foreground"
                  >
                    {WELCOME_MESSAGES[messageIndex]}...
                  </motion.p>
                ) : (
                  <motion.div
                    key="final"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center"
                  >
                    <h1 className="font-heading text-4xl">
                      Welcome to Slate
                    </h1>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {greeting}, {name.trim()}
                    </p>
                    <p className="mt-1.5 text-sm text-muted-foreground/60">
                      Start listing your bills.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {showButton && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="fixed inset-x-0 bottom-0 mx-auto max-w-md px-6 pb-10"
                >
                  <button
                    onClick={() => router.push("/")}
                    className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]"
                  >
                    Let&apos;s go
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

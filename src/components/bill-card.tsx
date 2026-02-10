"use client";

import { lazy, Suspense, useState } from "react";
import type { Bill } from "@/lib/types";
import { useBills } from "@/lib/use-bills";
import { cn, formatAmount, formatShortDate, todayISO } from "@/lib/utils";
import { useProfile } from "@/lib/use-profile";
import { toast } from "sonner";
import { Check, Trash2, RotateCw, Pencil } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const BillEditForm = lazy(() =>
  import("@/components/bill-edit-form").then((m) => ({
    default: m.BillEditForm,
  })),
);

const PAID_QUIPS = [
  "🎉 One down, you got this!",
  "✅ Bill slayed",
  "💪 Look at you being responsible",
  "🔥 Money moves",
  "🫡 Paid and accounted for",
  "💸 Gone but not forgotten",
  "🏆 Bill destroyer",
  "🧾 Receipt energy",
  "👏 Adulting level: expert",
  "🥂 Cheers to fewer bills",
  "💅 Paid like a boss",
  "🚀 One less thing to worry about",
  "🎯 Bullseye, bill paid",
  "⭐ Financial glow-up",
  "🫶 Your wallet thanks you",
  "🧹 Clean sweep",
  "💰 Smart money right here",
  "😮‍💨 Relief unlocked",
  "🙌 Debt? Don't know her",
  "🐐 GOAT behavior",
];

const UNPAID_QUIPS = [
  "😬 Back to the pile it goes",
  "🫠 Plot twist: still owe it",
  "💀 Bill resurrection",
  "🔄 The return of the bill",
  "😅 Undo vibes",
  "🫣 Pretend that didn't happen",
  "🪃 It came back",
  "🧟 Zombie bill",
  "👀 The bill remembers",
  "🎬 Bill 2: The Sequel",
  "😭 Back from the dead",
  "🫥 Like it never happened",
  "🤡 Clown moment",
  "📉 Financial plot twist",
  "🙃 Well that was fun while it lasted",
  "💔 Paid status revoked",
  "🐛 That was a bug, right?",
  "🌀 Deja vu",
  "🪦 Unrest in peace",
  "😤 The audacity of this bill",
];

function pickRandom(arr: readonly string[]) {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function isOverdue(bill: Bill): boolean {
  return !bill.isPaid && bill.dueDate < todayISO();
}

export function BillCard({ bill }: { bill: Bill }) {
  const { togglePaid, deleteBill } = useBills();
  const { currencySymbol } = useProfile();
  const overdue = isOverdue(bill);

  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  // Swipe-to-delete
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-100, -50], [1, 0]);

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x < -100) {
      animate(x, -72, { type: "spring", stiffness: 300, damping: 30 });
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  }

  function resetSwipe() {
    animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
  }

  function openDetail() {
    setEditing(false);
    setDetailOpen(true);
  }

  function handleConfirmDelete() {
    deleteBill(bill.id);
    setConfirmOpen(false);
  }

  function formatDisplayDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <>
      <div className="relative">
        {/* Delete button behind the card */}
        <motion.div
          className="absolute inset-y-1 right-1 flex w-16 items-center justify-center"
          style={{ opacity: deleteOpacity }}
        >
          <button
            onClick={() => {
              resetSwipe();
              setConfirmOpen(true);
            }}
            className="flex size-full items-center justify-center rounded-xl bg-destructive text-white"
          >
            <Trash2 className="size-5" />
          </button>
        </motion.div>

        {/* Swipeable card */}
        <motion.div
          style={{ x }}
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: -72, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className={cn(
            "relative rounded-2xl bg-card border border-border p-4",
            overdue && "border-l-2 border-l-destructive",
          )}
        >
          <div className="flex items-start gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const wasPaid = bill.isPaid;
                const { spawned } = togglePaid(bill.id);
                const message = spawned
                  ? `🔄 Next bill created for ${formatShortDate(spawned.dueDate)}`
                  : pickRandom(wasPaid ? UNPAID_QUIPS : PAID_QUIPS);
                toast(message, {
                  duration: 3000,
                  style: {
                    background: "var(--foreground)",
                    color: "var(--background)",
                  },
                });
              }}
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                bill.isPaid
                  ? "border-accent bg-accent text-white"
                  : "border-input hover:border-foreground/50",
              )}
            >
              {bill.isPaid && <Check className="size-3" />}
            </button>

            <div onClick={openDetail} className="min-w-0 flex-1 cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <p
                  className={cn(
                    "text-sm font-medium",
                    bill.isPaid && "line-through text-muted-foreground",
                  )}
                >
                  {bill.name}
                </p>
                <p
                  className={cn(
                    "shrink-0 text-base font-heading",
                    bill.isPaid && "text-muted-foreground",
                  )}
                >
                  {currencySymbol} {formatAmount(bill.amount)}
                </p>
              </div>

              <span className="mt-1 inline-flex items-center gap-1 rounded-lg bg-background px-2 py-0.5 text-xs text-muted-foreground">
                {bill.category.emoji} {bill.category.label}
              </span>

              {bill.notes && (
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground/70">
                  {bill.notes}
                </p>
              )}

              <p
                className={cn(
                  "mt-2 text-sm",
                  overdue
                    ? "text-destructive font-medium"
                    : bill.isPaid
                      ? "text-accent font-medium"
                      : "text-muted-foreground",
                )}
              >
                {bill.isPaid
                  ? "Paid"
                  : overdue
                    ? `Overdue · ${formatShortDate(bill.dueDate)}`
                    : `Due ${formatShortDate(bill.dueDate)}`}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detail / Edit Drawer — only mounts when opened */}
      {detailOpen && (
        <Drawer
          open={detailOpen}
          onOpenChange={(open) => {
            setDetailOpen(open);
            if (!open) setEditing(false);
          }}
        >
          <DrawerContent>
            {!editing ? (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <DrawerHeader className="pb-0">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-3xl">
                    {bill.category.emoji}
                  </div>
                  <DrawerTitle className="mt-2 text-center text-lg font-heading">
                    {bill.name}
                  </DrawerTitle>
                  <DrawerDescription className="text-center">
                    {bill.category.label}
                  </DrawerDescription>
                </DrawerHeader>

                <div className="px-6 pb-10 pt-2">
                  <p className="text-center font-heading text-4xl">
                    {currencySymbol} {formatAmount(bill.amount)}
                  </p>

                  <div className="mt-5 space-y-3 rounded-xl bg-secondary/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Due date
                      </span>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          overdue && "text-destructive",
                          bill.isPaid && "text-accent",
                        )}
                      >
                        {formatDisplayDate(
                          new Date(bill.dueDate + "T00:00:00"),
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          overdue && "text-destructive",
                          bill.isPaid && "text-accent",
                        )}
                      >
                        {bill.isPaid
                          ? "Paid"
                          : overdue
                            ? "Overdue"
                            : "Unpaid"}
                      </span>
                    </div>
                    {bill.isRecurring && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Recurring
                        </span>
                        <span className="flex items-center gap-1 text-sm font-medium">
                          <RotateCw className="size-3" /> Yes
                        </span>
                      </div>
                    )}
                  </div>

                  {bill.notes && (
                    <div className="mt-3 rounded-xl bg-secondary/40 p-4">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        Notes
                      </p>
                      <p className="text-sm whitespace-pre-wrap">
                        {bill.notes}
                      </p>
                    </div>
                  )}
                </div>

                {!bill.isPaid && (
                  <DrawerFooter>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setEditing(true)}
                      className="w-full gap-2"
                    >
                      <Pencil className="size-4" />
                      Edit Bill
                    </Button>
                  </DrawerFooter>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-12">
                      <div className="size-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
                    </div>
                  }
                >
                  <BillEditForm
                    bill={bill}
                    onDone={() => {
                      setEditing(false);
                      setDetailOpen(false);
                      toast.success("Bill saved");
                    }}
                  />
                </Suspense>
              </motion.div>
            )}
          </DrawerContent>
        </Drawer>
      )}

      {/* Delete Confirmation — only mounts when opened */}
      {confirmOpen && (
        <Drawer open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-center font-semibold [font-family:inherit]">
                Delete this bill?
              </DrawerTitle>
              <DrawerDescription className="text-center">
                &ldquo;{bill.name}&rdquo; for {currencySymbol} {formatAmount(bill.amount)} will
                be permanently removed.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button
                size="lg"
                variant="destructive"
                onClick={handleConfirmDelete}
                className="w-full"
              >
                Delete
              </Button>
              <DrawerClose asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={resetSwipe}
                >
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

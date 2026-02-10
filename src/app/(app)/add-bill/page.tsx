"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { BILL_TYPES, getNotesPlaceholder } from "@/lib/data";
import { EMOJIS, EMOJI_CATEGORIES } from "@/lib/emoji-data";
import { useBills } from "@/lib/use-bills";
import { useProfile, FREE_BILL_LIMIT } from "@/lib/use-profile";
import type { BillTag } from "@/lib/types";
import { toast } from "sonner";

export default function AddBillPage() {
  const router = useRouter();
  const { addBill, bills } = useBills();
  const { currencySymbol, isPro } = useProfile();

  // Redirect to upgrade if at free limit
  useEffect(() => {
    if (!isPro && bills.length >= FREE_BILL_LIMIT) {
      router.replace("/upgrade");
    }
  }, [isPro, bills.length, router]);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [billType, setBillType] = useState<BillTag | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState("");
  const [billTypeDrawerOpen, setBillTypeDrawerOpen] = useState(false);
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [pastDueDrawerOpen, setPastDueDrawerOpen] = useState(false);

  // Custom bill type
  const [customDrawerOpen, setCustomDrawerOpen] = useState(false);
  const [customEmoji, setCustomEmoji] = useState("");
  const [customName, setCustomName] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const emojiGridRef = useRef<HTMLDivElement>(null);

  const filteredEmojis = useMemo(() => {
    if (!emojiSearch.trim()) return EMOJIS;
    const q = emojiSearch.toLowerCase();
    return EMOJIS.filter(
      (e) => e.name.includes(q) || e.category.toLowerCase().includes(q),
    );
  }, [emojiSearch]);

  function handleSelectBillType(type: BillTag) {
    setBillType(type);
    setBillTypeDrawerOpen(false);
  }

  function handleOpenCustom() {
    setBillTypeDrawerOpen(false);
    setCustomEmoji("");
    setCustomName("");
    setEmojiPickerOpen(false);
    setEmojiSearch("");
    // small delay so the first drawer closes before the second opens
    setTimeout(() => setCustomDrawerOpen(true), 200);
  }

  function handleSaveCustom() {
    if (!customEmoji || !customName.trim()) return;
    setBillType({ label: customName.trim(), emoji: customEmoji });
    setCustomDrawerOpen(false);
  }

  function handleSelectDate(date: Date | undefined) {
    setDueDate(date);
    if (date) setDateDrawerOpen(false);
  }

  function formatDisplayDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function buildBill() {
    const dueDateStr = dueDate!.toISOString().split("T")[0] as string;
    return {
      name: name.trim(),
      amount: parseFloat(amount),
      dueDate: dueDateStr,
      category: billType!,
      isPaid: false,
      isRecurring,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };
  }

  function isDueDatePast() {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !amount || !dueDate || !billType) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isDueDatePast()) {
      setPastDueDrawerOpen(true);
      return;
    }

    addBill(buildBill());
    toast.success("Bill added successfully");
    router.push("/");
  }

  function handleAddAsUnpaid() {
    addBill(buildBill());
    setPastDueDrawerOpen(false);
    toast.success("Bill added successfully");
    router.push("/");
  }

  function handleAddAsPaid() {
    addBill({ ...buildBill(), isPaid: true, paidAt: new Date().toISOString() });
    setPastDueDrawerOpen(false);
    toast.success("Bill added as paid");
    router.push("/");
  }

  return (
    <div className="animate-slide-up min-h-[100dvh] bg-background">
      {/* Header */}
      <div className="flex items-center px-2 pt-12 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-secondary"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-semibold [font-family:inherit]">Add Bill</h1>
        <div className="w-9" />
      </div>

      <form onSubmit={handleSubmit} className="pb-10">
        {/* Amount — hero */}
        <div className="flex flex-col items-center px-5 pb-6">
          <p className="mb-2 text-sm text-muted-foreground">Amount</p>
          <div className="flex items-baseline">
            <span className="text-2xl font-heading text-muted-foreground/60">{currencySymbol}</span>
            <input
              id="bill-amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={(() => {
                if (!amount) return "";
                const [int, dec] = amount.split(".");
                const formatted = int ? Number(int).toLocaleString("en") : "0";
                return dec !== undefined ? `${formatted}.${dec}` : formatted;
              })()}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9.]/g, "");
                // only allow one decimal point
                const dotIdx = raw.indexOf(".");
                const cleaned =
                  dotIdx !== -1
                    ? raw.slice(0, dotIdx + 1) + raw.slice(dotIdx + 1).replace(/\./g, "")
                    : raw;
                // limit to 2 decimal places
                const [, dec] = cleaned.split(".");
                if (dec && dec.length > 2) return;
                setAmount(cleaned);
              }}
              onBlur={() => {
                if (!amount) return;
                const num = parseFloat(amount);
                if (!isNaN(num)) setAmount(num.toFixed(2));
              }}
              className="max-w-[240px] bg-transparent text-center text-5xl font-heading font-semibold tracking-tight outline-none placeholder:text-muted-foreground/25"
            />
          </div>
        </div>

        <div className="space-y-5 px-5">
        {/* Bill Name */}
        <div className="space-y-2">
          <Label htmlFor="bill-name">Bill Name</Label>
          <Input
            id="bill-name"
            placeholder="e.g. Netflix, Meralco"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Due Date — Drawer with Calendar */}
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Drawer open={dateDrawerOpen} onOpenChange={setDateDrawerOpen}>
            <DrawerTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-4 py-3.5 text-sm transition-colors hover:bg-secondary/50"
              >
                {dueDate ? (
                  <span>{formatDisplayDate(dueDate)}</span>
                ) : (
                  <span className="text-muted-foreground">Select date</span>
                )}
                <CalendarDays className="size-4 text-muted-foreground" />
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className="font-semibold [font-family:inherit]">
                  Due Date
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col items-center px-4 pb-10" data-vaul-no-drag>
                <Calendar
                  mode="single"
                  required
                  selected={dueDate}
                  onSelect={handleSelectDate}
                  defaultMonth={dueDate}
                  className="w-full bg-transparent [--cell-size:--spacing(11)]"
                  classNames={{
                    month_caption:
                      "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
                    weekday:
                      "text-muted-foreground flex-1 font-normal text-sm select-none",
                  }}
                  formatters={{
                    formatWeekdayName: (date) =>
                      date.toLocaleDateString("en-US", { weekday: "short" }),
                  }}
                />
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="mt-2 w-full py-3 text-center text-sm text-destructive"
                  >
                    Cancel
                  </button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {/* Bill Type — Drawer selector */}
        <div className="space-y-2">
          <Label>Bill Type</Label>
          <Drawer
            open={billTypeDrawerOpen}
            onOpenChange={setBillTypeDrawerOpen}
          >
            <DrawerTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-4 py-3.5 text-sm transition-colors hover:bg-secondary/50"
              >
                {billType ? (
                  <span className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-base">
                      {billType.emoji}
                    </span>
                    {billType.label}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Select bill type
                  </span>
                )}
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className="font-semibold [font-family:inherit]">
                  Select Bill Type
                </DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-10">
                <div className="max-h-[50vh] space-y-1.5 overflow-y-auto" data-vaul-no-drag>
                  {BILL_TYPES.map((type) => {
                    const isActive = billType?.label === type.label;
                    return (
                      <button
                        key={type.label}
                        type="button"
                        onClick={() => handleSelectBillType(type)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-foreground text-background"
                            : "bg-secondary/50 text-foreground hover:bg-secondary"
                        }`}
                      >
                        <span
                          className={`flex size-9 items-center justify-center rounded-full text-base ${
                            isActive ? "bg-background/15" : "bg-background"
                          }`}
                        >
                          {type.emoji}
                        </span>
                        {type.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom option */}
                <button
                  type="button"
                  onClick={handleOpenCustom}
                  className="mt-1.5 flex w-full items-center gap-3 rounded-xl bg-secondary/50 px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-background">
                    <Plus className="size-4" />
                  </span>
                  Custom
                </button>

                <DrawerClose asChild>
                  <button
                    type="button"
                    className="mt-4 w-full py-3 text-center text-sm text-destructive"
                  >
                    Cancel
                  </button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Custom Bill Type Drawer */}
          <Drawer open={customDrawerOpen} onOpenChange={setCustomDrawerOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className="font-semibold [font-family:inherit]">
                  Custom Bill Type
                </DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-10">
                {/* Emoji picker toggle */}
                <div className="mb-4 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setEmojiPickerOpen((o) => !o);
                      setEmojiSearch("");
                    }}
                    className="flex size-16 items-center justify-center rounded-2xl border-2 border-dashed border-input text-3xl transition-colors hover:bg-secondary/50"
                  >
                    {customEmoji || (
                      <span className="text-base text-muted-foreground">😀</span>
                    )}
                  </button>
                  <span className="mt-1.5 text-xs text-muted-foreground">
                    {customEmoji ? "Tap to change" : "Pick an emoji"}
                  </span>
                </div>

                {/* Inline emoji grid */}
                {emojiPickerOpen && (
                  <div className="mb-4 rounded-xl border border-border bg-secondary/30 p-3">
                    {/* Search */}
                    <div className="relative mb-3">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search emoji..."
                        value={emojiSearch}
                        onChange={(e) => setEmojiSearch(e.target.value)}
                        className="w-full rounded-lg bg-background py-2 pl-8.5 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
                      />
                    </div>

                    {/* Grid */}
                    <div
                      ref={emojiGridRef}
                      className="max-h-52 overflow-y-auto"
                      data-vaul-no-drag
                    >
                      {emojiSearch.trim() ? (
                        // Flat filtered results
                        filteredEmojis.length > 0 ? (
                          <div className="grid grid-cols-8 gap-1">
                            {filteredEmojis.map((e) => (
                              <button
                                key={e.emoji + e.name}
                                type="button"
                                title={e.name}
                                onClick={() => {
                                  setCustomEmoji(e.emoji);
                                  setEmojiPickerOpen(false);
                                }}
                                className="flex size-9 items-center justify-center rounded-lg text-xl transition-colors hover:bg-background"
                              >
                                {e.emoji}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="py-4 text-center text-xs text-muted-foreground">
                            No emojis found
                          </p>
                        )
                      ) : (
                        // Categorized
                        EMOJI_CATEGORIES.map((cat) => {
                          const items = EMOJIS.filter(
                            (e) => e.category === cat,
                          );
                          if (items.length === 0) return null;
                          return (
                            <div key={cat} className="mb-2">
                              <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                                {cat}
                              </p>
                              <div className="grid grid-cols-8 gap-1">
                                {items.map((e) => (
                                  <button
                                    key={e.emoji + e.name}
                                    type="button"
                                    title={e.name}
                                    onClick={() => {
                                      setCustomEmoji(e.emoji);
                                      setEmojiPickerOpen(false);
                                    }}
                                    className="flex size-9 items-center justify-center rounded-lg text-xl transition-colors hover:bg-background"
                                  >
                                    {e.emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Custom name input */}
                <div className="mb-5 space-y-2">
                  <Label htmlFor="custom-type-name">Type Name</Label>
                  <Input
                    id="custom-type-name"
                    placeholder="e.g. Gym, Parking, Tuition"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>

                {/* Save */}
                <Button
                  type="button"
                  className="w-full"
                  disabled={!customEmoji || !customName.trim()}
                  onClick={handleSaveCustom}
                >
                  Add
                </Button>

                <button
                  type="button"
                  onClick={() => setCustomDrawerOpen(false)}
                  className="mt-3 w-full py-3 text-center text-sm text-destructive"
                >
                  Cancel
                </button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {/* Recurring */}
        <div className="flex items-center gap-3">
          <Switch
            id="recurring"
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
          />
          <Label htmlFor="recurring" className="text-sm">
            Recurring bill
          </Label>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">
            Notes{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Textarea
            id="notes"
            placeholder={billType ? getNotesPlaceholder(billType.label) : "Any reminders about this bill..."}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" size="lg">
          Add Bill
        </Button>
        </div>
      </form>

      {/* Past-due confirmation drawer */}
      {pastDueDrawerOpen && (
        <Drawer open={pastDueDrawerOpen} onOpenChange={setPastDueDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-center font-semibold [font-family:inherit]">
                This bill is past due
              </DrawerTitle>
              <p className="text-center text-sm text-muted-foreground">
                Has this bill already been paid?
              </p>
            </DrawerHeader>
            <div className="px-4 pb-10 space-y-3">
              <Button size="lg" className="w-full" onClick={handleAddAsPaid}>
                Yes, mark as paid
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={handleAddAsUnpaid}
              >
                No, keep as unpaid
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}

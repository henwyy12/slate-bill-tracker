"use client";

import { useMemo, useRef, useState } from "react";
import type { Bill, BillTag } from "@/lib/types";
import { useBills } from "@/lib/use-bills";
import { BILL_TYPES } from "@/lib/data";
import { EMOJIS, EMOJI_CATEGORIES } from "@/lib/emoji-data";
import { useProfile } from "@/lib/use-profile";
import { CalendarDays, ChevronRight, Search, Plus } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";

interface BillEditFormProps {
  bill: Bill;
  onDone: () => void;
}

export function BillEditForm({ bill, onDone }: BillEditFormProps) {
  const { updateBill } = useBills();
  const { currencySymbol, locale } = useProfile();

  const [editName, setEditName] = useState(bill.name);
  const [editAmount, setEditAmount] = useState(bill.amount.toFixed(2));
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(
    new Date(bill.dueDate + "T00:00:00"),
  );
  const [editBillType, setEditBillType] = useState<BillTag>(bill.category);
  const [editRecurring, setEditRecurring] = useState(bill.isRecurring);
  const [editNotes, setEditNotes] = useState(bill.notes || "");

  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);
  const [typeDrawerOpen, setTypeDrawerOpen] = useState(false);
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

  function handleSave() {
    if (!editName.trim() || !editAmount || !editDueDate) return;
    const dueDateStr = editDueDate.toISOString().split("T")[0] as string;
    updateBill(bill.id, {
      name: editName.trim(),
      amount: parseFloat(editAmount),
      dueDate: dueDateStr,
      category: editBillType,
      isRecurring: editRecurring,
      ...(editNotes.trim()
        ? { notes: editNotes.trim() }
        : { notes: undefined }),
    });
    onDone();
  }

  function handleSelectType(type: BillTag) {
    setEditBillType(type);
    setTypeDrawerOpen(false);
  }

  function handleOpenCustom() {
    setTypeDrawerOpen(false);
    setCustomEmoji("");
    setCustomName("");
    setEmojiPickerOpen(false);
    setEmojiSearch("");
    setTimeout(() => setCustomDrawerOpen(true), 200);
  }

  function handleSaveCustom() {
    if (!customEmoji || !customName.trim()) return;
    setEditBillType({ label: customName.trim(), emoji: customEmoji });
    setCustomDrawerOpen(false);
  }

  function handleSelectDate(date: Date | undefined) {
    setEditDueDate(date);
    if (date) setDateDrawerOpen(false);
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
      <DrawerHeader>
        <DrawerTitle className="text-center font-semibold [font-family:inherit]">
          Edit Bill
        </DrawerTitle>
      </DrawerHeader>

      <div className="space-y-5 px-5 pb-2">
        {/* Amount */}
        <div className="flex flex-col items-center">
          <p className="mb-2 text-sm text-muted-foreground">Amount</p>
          <div className="flex items-baseline">
            <span className="text-2xl font-heading text-muted-foreground/60">
              {currencySymbol}
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={(() => {
                if (!editAmount) return "";
                const [int, dec] = editAmount.split(".");
                const formatted = int
                  ? Number(int).toLocaleString(locale)
                  : "0";
                return dec !== undefined ? `${formatted}.${dec}` : formatted;
              })()}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9.]/g, "");
                const dotIdx = raw.indexOf(".");
                const cleaned =
                  dotIdx !== -1
                    ? raw.slice(0, dotIdx + 1) +
                      raw.slice(dotIdx + 1).replace(/\./g, "")
                    : raw;
                const [, dec] = cleaned.split(".");
                if (dec && dec.length > 2) return;
                setEditAmount(cleaned);
              }}
              onBlur={() => {
                if (!editAmount) return;
                const num = parseFloat(editAmount);
                if (!isNaN(num)) setEditAmount(num.toFixed(2));
              }}
              className="max-w-[200px] bg-transparent text-center text-4xl font-heading font-semibold tracking-tight outline-none placeholder:text-muted-foreground/25"
            />
          </div>
        </div>

        {/* Bill Name */}
        <div className="space-y-2">
          <Label>Bill Name</Label>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="e.g. Netflix, Meralco"
          />
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Drawer open={dateDrawerOpen} onOpenChange={setDateDrawerOpen}>
            <button
              type="button"
              onClick={() => setDateDrawerOpen(true)}
              className="flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-4 py-2.5 text-sm transition-colors hover:bg-secondary/50"
            >
              {editDueDate ? (
                <span>{formatDisplayDate(editDueDate)}</span>
              ) : (
                <span className="text-muted-foreground">Select date</span>
              )}
              <CalendarDays className="size-4 text-muted-foreground" />
            </button>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className="font-semibold [font-family:inherit]">
                  Due Date
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col items-center px-4 pb-6">
                <Calendar
                  mode="single"
                  selected={editDueDate}
                  onSelect={handleSelectDate}
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
                    className="mt-2 w-full py-2 text-center text-sm text-destructive"
                  >
                    Cancel
                  </button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {/* Bill Type */}
        <div className="space-y-2">
          <Label>Bill Type</Label>
          <Drawer open={typeDrawerOpen} onOpenChange={setTypeDrawerOpen}>
            <button
              type="button"
              onClick={() => setTypeDrawerOpen(true)}
              className="flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-4 py-2.5 text-sm transition-colors hover:bg-secondary/50"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-base">
                  {editBillType.emoji}
                </span>
                {editBillType.label}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className="font-semibold [font-family:inherit]">
                  Select Bill Type
                </DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-6">
                <div className="max-h-[50vh] space-y-1.5 overflow-y-auto">
                  {BILL_TYPES.map((type) => {
                    const isActive = editBillType.label === type.label;
                    return (
                      <button
                        key={type.label}
                        type="button"
                        onClick={() => handleSelectType(type)}
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
                    className="mt-4 w-full py-2 text-center text-sm text-destructive"
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
              <div className="px-4 pb-6">
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
                      <span className="text-base text-muted-foreground">
                        😀
                      </span>
                    )}
                  </button>
                  <span className="mt-1.5 text-xs text-muted-foreground">
                    {customEmoji ? "Tap to change" : "Pick an emoji"}
                  </span>
                </div>
                {emojiPickerOpen && (
                  <div className="mb-4 rounded-xl border border-border bg-secondary/30 p-3">
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
                    <div
                      ref={emojiGridRef}
                      className="max-h-52 overflow-y-auto"
                    >
                      {emojiSearch.trim() ? (
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
                <div className="mb-5 space-y-2">
                  <Label htmlFor="edit-custom-type-name">Type Name</Label>
                  <Input
                    id="edit-custom-type-name"
                    placeholder="e.g. Gym, Parking, Tuition"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>
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
                  className="mt-3 w-full py-2 text-center text-sm text-destructive"
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
            id={`edit-recurring-${bill.id}`}
            checked={editRecurring}
            onCheckedChange={setEditRecurring}
          />
          <Label htmlFor={`edit-recurring-${bill.id}`} className="text-sm">
            Recurring bill
          </Label>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>
            Notes{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Textarea
            placeholder="Any reminders about this bill..."
            rows={3}
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
          />
        </div>
      </div>

      <DrawerFooter>
        <Button onClick={handleSave} className="w-full">
          Save Changes
        </Button>
        <Button variant="outline" onClick={onDone} className="w-full">
          Cancel
        </Button>
      </DrawerFooter>
    </>
  );
}

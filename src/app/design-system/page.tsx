"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

const colorSwatches = [
  { name: "Background", value: "#f5f5f4", variable: "--background", cssClass: "bg-background" },
  { name: "Card", value: "#ffffff", variable: "--card", cssClass: "bg-card" },
  { name: "Secondary", value: "#eeecec", variable: "--secondary", cssClass: "bg-secondary" },
  { name: "Muted BG", value: "#e8e5e0", variable: "--muted", cssClass: "bg-muted" },
  { name: "Foreground", value: "#333334", variable: "--foreground", cssClass: "bg-foreground" },
  { name: "Primary", value: "#1a1a1a", variable: "--primary", cssClass: "bg-primary" },
  { name: "Muted Text", value: "#78756f", variable: "--muted-foreground", cssClass: "bg-muted-foreground" },
  { name: "Accent", value: "#2b5e49", variable: "--accent", cssClass: "bg-accent" },
  { name: "Border", value: "rgba(51,51,52,0.15)", variable: "--border", cssClass: "bg-border" },
];

const invoices = [
  { id: "INV-001", status: "Paid", method: "Credit Card", amount: "$250.00" },
  { id: "INV-002", status: "Pending", method: "PayPal", amount: "$150.00" },
  { id: "INV-003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
  { id: "INV-004", status: "Paid", method: "Credit Card", amount: "$450.00" },
  { id: "INV-005", status: "Paid", method: "PayPal", amount: "$550.00" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <h2 className="text-3xl tracking-tight">{title}</h2>
      <Separator />
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const [switchChecked, setSwitchChecked] = useState(false);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <h1 className="text-5xl tracking-tight">Slate Design System</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              A warm stone and charcoal component library built with shadcn/ui
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-16 px-6 py-12">
          {/* ── Typography ─────────────────────────────── */}
          <Section title="Typography">
            <div className="space-y-4">
              <h1 className="text-5xl">Heading One — <em>Instrument Serif</em></h1>
              <h2 className="text-4xl">Heading Two</h2>
              <h3 className="text-3xl">Heading Three — <em>with italic</em></h3>
              <h4 className="text-2xl">Heading Four</h4>
              <p className="text-base leading-7">
                Body text uses Geist Mono at the regular weight. This paragraph demonstrates the default
                body color <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">#333334</code> against
                the warm stone background. The typographic scale balances readability with
                the elegant serif headings.
              </p>
              <p className="text-sm text-muted-foreground">
                This is muted helper text using the muted-foreground token (#78756f).
              </p>
              <p>
                <a href="#" className="text-accent underline underline-offset-4 hover:text-accent/80">
                  This is a link styled with the accent color
                </a>
              </p>
            </div>
          </Section>

          {/* ── Colors ─────────────────────────────────── */}
          <Section title="Color Palette">
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
              {colorSwatches.map((swatch) => (
                <div key={swatch.name} className="space-y-2 text-center">
                  <div
                    className={`mx-auto h-16 w-16 rounded-lg border border-border ${swatch.cssClass}`}
                  />
                  <div className="text-sm font-medium">{swatch.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {swatch.value}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Buttons ────────────────────────────────── */}
          <Section title="Buttons">
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-lg">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="xs">Extra Small</Button>
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-lg">Disabled</h3>
                <div className="flex flex-wrap gap-3">
                  <Button disabled>Primary</Button>
                  <Button variant="accent" disabled>Accent</Button>
                  <Button variant="outline" disabled>Outline</Button>
                </div>
              </div>
            </div>
          </Section>

          {/* ── Badges ─────────────────────────────────── */}
          <Section title="Badges">
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="accent">Accent</Badge>
            </div>
          </Section>

          {/* ── Cards ──────────────────────────────────── */}
          <Section title="Cards">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Basic card */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Card</CardTitle>
                  <CardDescription>
                    A simple card with a title and description.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Cards use the <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">#ffffff</code> background
                    to lift off the page.
                  </p>
                </CardContent>
              </Card>

              {/* Card with form */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Update your display name.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Save Changes</Button>
                </CardFooter>
              </Card>

              {/* Accent card */}
              <Card className="border-accent/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Revenue</CardTitle>
                    <Badge variant="accent">+12.5%</Badge>
                  </div>
                  <CardDescription>Monthly recurring revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-heading">$48,290</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    vs $42,920 last month
                  </p>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── Form Inputs ────────────────────────────── */}
          <Section title="Form Inputs">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="select-demo">Country</Label>
                    <Select>
                      <SelectTrigger id="select-demo">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" placeholder="Tell us about yourself..." />
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the terms and conditions
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="notifications"
                      checked={switchChecked}
                      onCheckedChange={setSwitchChecked}
                    />
                    <Label htmlFor="notifications" className="text-sm">
                      Enable notifications
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* ── Data Display ───────────────────────────── */}
          <Section title="Data Display">
            <div className="space-y-8">
              {/* Avatar group */}
              <div>
                <h3 className="mb-3 text-lg">Avatars</h3>
                <div className="flex -space-x-3">
                  {["AC", "BK", "CL", "DM", "EN"].map((initials) => (
                    <Avatar
                      key={initials}
                      className="border-2 border-background"
                    >
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div>
                <h3 className="mb-3 text-lg">Invoices</h3>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Invoice</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.id}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                inv.status === "Paid"
                                  ? "accent"
                                  : inv.status === "Pending"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{inv.method}</TableCell>
                          <TableCell className="text-right font-mono">
                            {inv.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </div>
          </Section>

          {/* ── Feedback ───────────────────────────────── */}
          <Section title="Feedback">
            <div className="grid gap-4 md:grid-cols-2">
              <Alert>
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  This is a default alert with important information.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Something went wrong. Please try again later.
                </AlertDescription>
              </Alert>
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  toast.success("Changes saved", {
                    description: "Your settings have been updated successfully.",
                  })
                }
              >
                Show Success Toast
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.error("Something went wrong", {
                    description: "Please try again later.",
                  })
                }
              >
                Show Error Toast
              </Button>
            </div>
          </Section>

          {/* ── Overlays ───────────────────────────────── */}
          <Section title="Overlays">
            <div className="flex flex-wrap gap-3">
              {/* Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Action</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to proceed? This action cannot be
                      undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="accent">Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Open Menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Drawer */}
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline">Open Drawer</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Edit Profile</DrawerTitle>
                    <DrawerDescription>
                      Make changes to your profile here. Click save when you&apos;re done.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="drawer-name">Name</Label>
                      <Input id="drawer-name" placeholder="Your name" className="bg-white/50 border-foreground/15" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="drawer-email">Email</Label>
                      <Input id="drawer-email" type="email" placeholder="you@example.com" className="bg-white/50 border-foreground/15" />
                    </div>
                  </div>
                  <DrawerFooter>
                    <Button>Save Changes</Button>
                    <DrawerClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              {/* Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover for Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a tooltip</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Section>

          {/* ── Tabs ───────────────────────────────────── */}
          <Section title="Tabs">
            <Card>
              <Tabs defaultValue="overview" className="p-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4 space-y-2">
                  <h3 className="text-xl">Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    Welcome to your dashboard. Here you can see a summary of
                    your recent activity and key metrics at a glance.
                  </p>
                </TabsContent>
                <TabsContent value="analytics" className="mt-4 space-y-2">
                  <h3 className="text-xl">Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your performance metrics. Revenue is up 12.5% compared
                    to last month with a steady growth trajectory.
                  </p>
                </TabsContent>
                <TabsContent value="settings" className="mt-4 space-y-2">
                  <h3 className="text-xl">Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your account preferences, notification settings, and
                    privacy controls from this panel.
                  </p>
                </TabsContent>
              </Tabs>
            </Card>
          </Section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-muted-foreground">
            Slate Design System — built with Next.js, Tailwind CSS &amp; shadcn/ui
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

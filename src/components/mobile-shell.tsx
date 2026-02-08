export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-[100dvh] max-w-md bg-background">
      <div className="pb-16">{children}</div>
    </div>
  );
}

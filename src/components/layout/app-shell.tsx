"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Pill,
  Calculator,
  Wind,
  Siren,
  ListChecks,
  NotebookPen,
  Settings,
  Search,
  Sun,
  Moon,
  Activity,
  Stethoscope,
  GitCompareArrows,
  HeartPulse,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "./search-dialog";
import { InstallPrompt } from "./install-prompt";
import { EmergencyButton } from "./emergency-button";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/drugs", label: "Drug Handbook", icon: Pill },
  { href: "/calculators", label: "Calculators", icon: Calculator },
  { href: "/case", label: "Case Mode", icon: Stethoscope },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/airway", label: "Airway", icon: Wind },
  { href: "/icu", label: "ICU", icon: HeartPulse },
  { href: "/regional", label: "Regional Anesthesia", icon: Target },
  { href: "/crisis", label: "Crisis Management", icon: Siren },
  { href: "/checklists", label: "Protocols & Checklists", icon: ListChecks },
  { href: "/notes", label: "Notes & Favorites", icon: NotebookPen },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Bottom nav on mobile shows the 5 most load-bearing destinations.
const MOBILE_NAV_HREFS = ["/", "/drugs", "/calculators", "/compare", "/checklists"];
const MOBILE_NAV_ITEMS = MOBILE_NAV_HREFS.map((href) => NAV_ITEMS.find((item) => item.href === href)!);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  return (
    <div className="min-h-dvh flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border/70 glass-card rounded-none">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-border/70">
          <Activity className="h-5 w-5 text-primary" />
          <span className="font-display font-semibold tracking-tight">Anesthesia Resident Assistant</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <InstallPrompt variant="sidebar" />
        </div>
      </aside>

      <div className="flex-1 md:pl-64 flex flex-col min-h-dvh">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 h-16 px-4 md:px-6 border-b border-border/70 glass-card rounded-none">
          <div className="md:hidden flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold text-sm">ARA</span>
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            className="ml-auto md:ml-0 flex-1 md:max-w-sm flex items-center gap-2 rounded-md border border-border bg-secondary/60 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search drugs, protocols, calculators…</span>
            <span className="sm:hidden">Search…</span>
            <kbd className="hidden md:inline ml-auto text-[10px] rounded border border-border px-1.5 py-0.5">⌘K</kbd>
          </button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 glass-card rounded-none border-t border-border/70 grid grid-cols-5">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium min-h-[56px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <EmergencyButton />
    </div>
  );
}

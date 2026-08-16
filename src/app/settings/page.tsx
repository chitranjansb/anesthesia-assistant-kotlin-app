"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Laptop, UploadCloud, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InstallPrompt } from "@/components/layout/install-prompt";
import { importGuidelineBundle } from "@/lib/db";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [importStatus, setImportStatus] = React.useState<{ ok: boolean; message: string } | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => setMounted(true), []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const counts = {
        drugs: Array.isArray(json.drugs) ? json.drugs.length : 0,
        protocols: Array.isArray(json.protocols) ? json.protocols.length : 0,
        crisisAlgorithms: Array.isArray(json.crisisAlgorithms) ? json.crisisAlgorithms.length : 0,
        checklists: Array.isArray(json.checklists) ? json.checklists.length : 0,
        regionalBlocks: Array.isArray(json.regionalBlocks) ? json.regionalBlocks.length : 0,
      };
      if (Object.values(counts).every((c) => c === 0)) {
        setImportStatus({ ok: false, message: "No recognised keys found (expected drugs / protocols / crisisAlgorithms / checklists / regionalBlocks arrays)." });
        return;
      }
      await importGuidelineBundle(json);
      setImportStatus({
        ok: true,
        message: `Imported ${counts.drugs} drugs, ${counts.protocols} protocols, ${counts.crisisAlgorithms} crisis algorithms, ${counts.checklists} checklists, ${counts.regionalBlocks} regional blocks. Reload any open page to see the update.`,
      });
    } catch (err) {
      setImportStatus({ ok: false, message: `Could not import file: ${err instanceof Error ? err.message : "invalid JSON"}` });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Appearance, installation, and guideline data management.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Light and dark mode, or follow the system setting.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm transition-colors",
                  mounted && theme === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"
                )}
              >
                <opt.icon className="h-5 w-5" />
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Install</CardTitle>
          <CardDescription>Add this app to your home screen for one-tap, offline access.</CardDescription>
        </CardHeader>
        <CardContent>
          <InstallPrompt variant="banner" />
          <p className="text-xs text-muted-foreground mt-2">
            If no install button appears, your browser may already consider the app installed, or may require
            using its menu → &ldquo;Add to Home screen&rdquo;.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guideline data import</CardTitle>
          <CardDescription>
            This is the &ldquo;update without changing code&rdquo; pathway: import a JSON bundle matching the
            app&apos;s data schema (see <code className="text-xs">src/lib/types.ts</code> in the project source) and it
            overrides the bundled seed entries by id, stored locally in this browser&apos;s IndexedDB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input ref={fileRef} type="file" accept="application/json" onChange={handleFile} className="hidden" id="import-file" />
          <Button asChild variant="outline" className="gap-2">
            <label htmlFor="import-file" className="cursor-pointer">
              <UploadCloud className="h-4 w-4" /> Choose JSON bundle…
            </label>
          </Button>
          {importStatus && (
            <div className={cn("flex items-start gap-2 rounded-md p-3 text-sm", importStatus.ok ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400" : "bg-critical/10 text-critical")}>
              {importStatus.ok ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 mt-0.5 shrink-0" />}
              <span>{importStatus.message}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Importing data here does not itself make it clinically verified — that judgement is a clinician
            reviewer&apos;s, reflected in each record&apos;s <code className="text-xs">verificationStatus</code> field.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Anesthesia Resident Assistant — offline-first clinical reference PWA.</p>
          <p>For educational and clinical reference only. Clinical decisions remain the responsibility of the treating physician.</p>
        </CardContent>
      </Card>
    </div>
  );
}

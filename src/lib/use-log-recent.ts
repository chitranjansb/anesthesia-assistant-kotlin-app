"use client";

import * as React from "react";
import { addRecent } from "@/lib/db";
import type { SearchableKind } from "@/lib/types";

// Logs a recent-item view once per mount (client-side only).
export function useLogRecent(kind: SearchableKind, refId: string) {
  React.useEffect(() => {
    addRecent(kind, refId).catch(() => {});
  }, [kind, refId]);
}

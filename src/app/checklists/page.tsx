"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DisclaimerBanner } from "@/components/shared/disclaimer-banner";
import { ProtocolCard } from "@/components/shared/protocol-card";
import { InteractiveChecklist } from "@/components/shared/interactive-checklist";
import { getAllProtocols, getAllChecklists } from "@/lib/data";
import type { Protocol, Checklist } from "@/lib/types";

export default function ChecklistsPage() {
  const [protocols, setProtocols] = React.useState<Protocol[]>([]);
  const [checklists, setChecklists] = React.useState<Checklist[]>([]);

  React.useEffect(() => {
    getAllProtocols().then(setProtocols);
    getAllChecklists().then(setChecklists);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Protocols & Checklists</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Searchable protocol summaries and interactive, checkable safety checklists.
        </p>
      </div>

      <DisclaimerBanner compact />

      <Tabs defaultValue="checklists">
        <TabsList>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
          <TabsTrigger value="protocols">Protocol Library</TabsTrigger>
        </TabsList>

        <TabsContent value="checklists" className="space-y-4">
          {checklists.map((c) => (
            <InteractiveChecklist key={c.id} checklist={c} />
          ))}
        </TabsContent>

        <TabsContent value="protocols" className="space-y-4">
          {protocols.map((p) => (
            <ProtocolCard key={p.id} protocol={p} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

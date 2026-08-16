"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Trash2, Star, Pill, FileText, Siren, ListChecks, Calculator, Wind, Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getNotes, saveNote, deleteNote, getFavorites } from "@/lib/db";
import type { NoteRecord, FavoriteRecord, SearchableKind } from "@/lib/types";

const KIND_ICON: Record<SearchableKind, typeof Pill> = {
  drug: Pill,
  protocol: FileText,
  crisis: Siren,
  checklist: ListChecks,
  calculator: Calculator,
  airway: Wind,
  "regional-block": Target,
};

const KIND_HREF: Record<SearchableKind, (id: string) => string> = {
  drug: (id) => `/drugs#${id}`,
  protocol: (id) => `/checklists#${id}`,
  crisis: (id) => `/crisis#${id}`,
  checklist: (id) => `/checklists#${id}`,
  calculator: (id) => `/calculators#${id}`,
  airway: (id) => `/airway#${id}`,
  "regional-block": (id) => `/regional#${id}`,
};

export default function NotesPage() {
  const [notes, setNotes] = React.useState<NoteRecord[]>([]);
  const [favorites, setFavorites] = React.useState<FavoriteRecord[]>([]);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");

  function refresh() {
    getNotes().then(setNotes);
    getFavorites().then(setFavorites);
  }

  React.useEffect(refresh, []);

  async function handleAdd() {
    if (!title.trim() && !body.trim()) return;
    const now = Date.now();
    await saveNote({ id: `note-${now}`, title: title.trim() || "Untitled note", body: body.trim(), createdAt: now, updatedAt: now });
    setTitle("");
    setBody("");
    refresh();
  }

  async function handleDelete(id: string) {
    await deleteNote(id);
    refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Notes & Favorites</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Stored only on this device (IndexedDB) — nothing here is sent anywhere.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Consultant's spinal dose preference" />
          </div>
          <div>
            <Label>Note</Label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Write your note…"
            />
          </div>
          <Button onClick={handleAdd} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add note
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Your notes</h2>
        {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
        {notes.map((n) => (
          <Card key={n.id}>
            <CardContent className="p-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-sm">{n.title}</p>
                {n.body && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{n.body}</p>}
                <p className="text-[11px] text-muted-foreground mt-2">{new Date(n.updatedAt).toLocaleString()}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)} aria-label="Delete note">
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" /> Favorites
        </h2>
        {favorites.length === 0 && <p className="text-sm text-muted-foreground">Tap the star on any drug or item to save it here.</p>}
        <div className="space-y-2">
          {favorites.map((f) => {
            const Icon = KIND_ICON[f.kind];
            return (
              <Link key={f.id} href={KIND_HREF[f.kind](f.refId)}>
                <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2.5 hover:bg-secondary transition-colors">
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm flex-1">{f.refId}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{f.kind}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

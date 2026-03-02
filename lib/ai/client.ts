"use client";

import type { AnalyzeResult, ConversationScope, EntryModule } from "@/types/psyche";
import { settingsStore } from "@/lib/storage/localStore";

export async function analyzeEntry(input: {
  module: EntryModule;
  text: string;
  imageBase64?: string | null;
  imageMimeType?: string | null;
  pdfBase64?: string | null;
  pdfMimeType?: string | null;
  audioBase64?: string | null;
  audioMimeType?: string | null;
}): Promise<AnalyzeResult> {
  const s = settingsStore.get();
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(s.userApiKey ? { "x-psychemirror-user-key": s.userApiKey } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "analyze failed");
  }
  return (await res.json()) as AnalyzeResult;
}

export async function chatWithMentor(input: {
  scope: ConversationScope;
  scopeRefId: string;
  module?: EntryModule | null;
  message: string;
  context?: string;
  range?: "day" | "week" | "all";
}): Promise<{ reply: string }> {
  const s = settingsStore.get();
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(s.userApiKey ? { "x-psychemirror-user-key": s.userApiKey } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "chat failed");
  }
  return (await res.json()) as { reply: string };
}


"use client";

import { useEffect, useState } from "react";
import type { Entry } from "@/types/psyche";
import { entriesStore } from "@/lib/storage/localStore";
import { EntryComposer } from "@/components/entries/EntryComposer";
import { EntryList } from "@/components/entries/EntryList";
import { ChatPanel } from "@/components/chat/ChatPanel";

export default function InspirationPage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    setEntries(entriesStore.listByModule("Inspiration"));
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 space-y-4">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="text-[20px] font-semibold text-slate-50" style={{ fontFamily: "var(--font-display)" }}>
          Inspiration · 灵感涌现
        </div>
        <div className="mt-1 text-[12px] text-slate-300">
          越快越好：一句话或一段语音，先把火花留住，再谈结构化。
        </div>
      </header>

      <EntryComposer
        module="Inspiration"
        onCreated={() => setEntries(entriesStore.listByModule("Inspiration"))}
      />
      <EntryList entries={entries} />
      <ChatPanel scope="module" scopeRefId="Inspiration" module="Inspiration" />
    </main>
  );
}


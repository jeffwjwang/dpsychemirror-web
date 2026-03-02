"use client";

import { useEffect, useState } from "react";
import type { Entry } from "@/types/psyche";
import { entriesStore } from "@/lib/storage/localStore";
import { EntryComposer } from "@/components/entries/EntryComposer";
import { EntryList } from "@/components/entries/EntryList";
import { ChatPanel } from "@/components/chat/ChatPanel";

export default function DailyPage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    setEntries(entriesStore.listByModule("Daily"));
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 space-y-4">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="text-[20px] font-semibold text-slate-50" style={{ fontFamily: "var(--font-display)" }}>
          Daily · 日常琐事
        </div>
        <div className="mt-1 text-[12px] text-slate-300">
          语音或文字都可以。你记录的不是事件，而是你如何与世界相遇。
        </div>
      </header>

      <EntryComposer
        module="Daily"
        onCreated={() => setEntries(entriesStore.listByModule("Daily"))}
      />
      <EntryList entries={entries} />
      <ChatPanel scope="module" scopeRefId="Daily" module="Daily" />
    </main>
  );
}


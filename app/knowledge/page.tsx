"use client";

import { useEffect, useState } from "react";
import type { Entry } from "@/types/psyche";
import { entriesStore } from "@/lib/storage/localStore";
import { EntryComposer } from "@/components/entries/EntryComposer";
import { EntryList } from "@/components/entries/EntryList";
import { ChatPanel } from "@/components/chat/ChatPanel";

export default function KnowledgePage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    setEntries(entriesStore.listByModule("Knowledge"));
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 space-y-4">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="text-[20px] font-semibold text-slate-50" style={{ fontFamily: "var(--font-display)" }}>
          Knowledge · 知识收藏
        </div>
        <div className="mt-1 text-[12px] text-slate-300">
          多图 / PDF / 文字 / 语音。这里不是“存资料”，而是为未来的你建一座认知宫殿。
        </div>
      </header>

      <EntryComposer
        module="Knowledge"
        onCreated={() => setEntries(entriesStore.listByModule("Knowledge"))}
      />
      <EntryList entries={entries} />
      <ChatPanel scope="module" scopeRefId="Knowledge" module="Knowledge" />
    </main>
  );
}


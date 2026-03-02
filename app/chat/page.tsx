"use client";

import { useEffect, useState } from "react";
import type { Entry } from "@/types/psyche";
import { entriesStore } from "@/lib/storage/localStore";
import { EntryComposer } from "@/components/entries/EntryComposer";
import { EntryList } from "@/components/entries/EntryList";
import { ChatPanel } from "@/components/chat/ChatPanel";

export default function ChatDetectivePage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    setEntries(entriesStore.listByModule("Chat"));
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 space-y-4">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div
          className="text-[20px] font-semibold text-slate-50"
          style={{ fontFamily: "var(--font-display)" }}
        >
          社交神探 · Chat
        </div>
        <div className="mt-1 text-[12px] text-slate-300">
          上传聊天截图（可多张）+ 你的主观感受。导师会追踪你的社交脚本与防御机制。
        </div>
      </header>

      <EntryComposer
        module="Chat"
        onCreated={() => setEntries(entriesStore.listByModule("Chat"))}
      />
      <EntryList entries={entries} />
      <ChatPanel scope="module" scopeRefId="Chat" module="Chat" />
    </main>
  );
}


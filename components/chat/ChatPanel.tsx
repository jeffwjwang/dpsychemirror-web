"use client";

import { useEffect, useMemo, useState } from "react";
import type { ConversationScope, Entry, EntryModule } from "@/types/psyche";
import { chatWithMentor } from "@/lib/ai/client";
import { chatStore, entriesStore } from "@/lib/storage/localStore";

type Range = "day" | "week" | "all";

function rangeLabel(r: Range) {
  if (r === "day") return "今日";
  if (r === "week") return "本周";
  return "全部";
}

function startOfLocalDayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfLocalWeekISO() {
  const d = new Date();
  const day = d.getDay();
  const diffToMon = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMon);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function buildContext(scope: ConversationScope, module?: EntryModule | null, entry?: Entry | null, range: Range = "all") {
  if (scope === "entry" && entry) {
    return `记录标题：${entry.title}\n记录原文：${entry.text}\n已有分析：${JSON.stringify(entry.analysis_v1, null, 2)}`;
  }

  if (scope === "module" && module) {
    const list = entriesStore.listByModule(module).slice(0, 20);
    if (!list.length) return "该模块目前没有记录。";
    return `模块【${module}】最近记录（截断摘要）：\n${list
      .map((e) => `- [${e.createdAt}] ${e.title} | ${e.analysis_v1?.summary || ""}`)
      .join("\n")}`;
  }

  const all = entriesStore.listAll();
  const startISO =
    range === "day" ? startOfLocalDayISO() : range === "week" ? startOfLocalWeekISO() : null;
  const filtered = startISO ? all.filter((e) => e.createdAt >= startISO) : all;
  if (!filtered.length) return "全局目前没有记录。";
  return `全局【${rangeLabel(range)}】部分记录：\n${filtered
    .slice(0, 50)
    .map((e) => `- [${e.module}] ${e.createdAt} ${e.title}`)
    .join("\n")}`;
}

export function ChatPanel({
  scope,
  scopeRefId,
  module,
  entryId,
}: {
  scope: ConversationScope;
  scopeRefId: string;
  module?: EntryModule | null;
  entryId?: string | null;
}) {
  const [range, setRange] = useState<Range>("all");
  const conv = useMemo(() => chatStore.getOrCreateConversation(scope, scopeRefId), [scope, scopeRefId]);
  const [messages, setMessages] = useState(() => chatStore.listMessages(conv.id));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMessages(chatStore.listMessages(conv.id));
  }, [conv.id]);

  const entry = entryId ? entriesStore.get(entryId) ?? null : null;

  async function send(text: string) {
    const content = text.trim();
    if (!content) return;
    setBusy(true);
    setInput("");
    chatStore.appendMessage(conv.id, "user", content);
    setMessages(chatStore.listMessages(conv.id));

    try {
      const context = buildContext(scope, module ?? null, entry, range);
      const res = await chatWithMentor({
        scope,
        scopeRefId,
        module: module ?? null,
        message: content,
        context,
        range,
      });
      chatStore.appendMessage(conv.id, "assistant", res.reply);
      setMessages(chatStore.listMessages(conv.id));
    } finally {
      setBusy(false);
    }
  }

  async function generateDigest() {
    await send(`请生成【${rangeLabel(range)}】综述：一句话主题 + 三条洞察 + 一条职场风险预警 + 一条最小可行动作。`);
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[14px] font-semibold text-slate-50">灵魂导师 · 对话</div>
          <div className="mt-1 text-[12px] text-slate-300">
            当前范围：{scope === "global" ? "全局" : scope === "module" ? "模块" : "这条记录"}
            {scope === "global" ? `（${rangeLabel(range)}）` : ""}
          </div>
        </div>
        {scope === "global" && (
          <button
            type="button"
            className="rounded-2xl bg-cyan-300 px-3 py-2 text-[11px] font-semibold text-slate-950"
            onClick={generateDigest}
            disabled={busy}
          >
            生成综述
          </button>
        )}
      </div>

      {scope === "global" && (
        <div className="mt-3 flex gap-2">
          {(["day", "week", "all"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-slate-100"
              style={{ opacity: range === r ? 1 : 0.6 }}
              onClick={() => setRange(r)}
            >
              {rangeLabel(r)}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-3 text-[12px] text-slate-200">
        {messages.length === 0 ? (
          <div className="text-slate-300">暂无对话。你可以先问一句你真正关心的问题。</div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={[
                "max-w-[92%] rounded-2xl px-3 py-2 whitespace-pre-wrap",
                m.role === "user"
                  ? "ml-auto bg-cyan-300 text-slate-950"
                  : "mr-auto bg-white/10 text-slate-100",
              ].join(" ")}
            >
              {m.content}
            </div>
          ))
        )}
      </div>

      <form
        className="mt-3 flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <textarea
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-[12px] text-slate-100 outline-none"
          rows={2}
          placeholder="向灵魂导师发问…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400">{busy ? "导师思考中…" : "可追问动机/防御/风险/下一步。"}</div>
          <button
            type="submit"
            className="rounded-2xl bg-cyan-300 px-4 py-2 text-[12px] font-semibold text-slate-950 disabled:opacity-60"
            disabled={busy}
          >
            发送
          </button>
        </div>
      </form>
    </section>
  );
}


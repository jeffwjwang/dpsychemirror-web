"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { blobsStore, entriesStore } from "@/lib/storage/localStore";
import { ChatPanel } from "@/components/chat/ChatPanel";

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function EntryDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const entry = id ? entriesStore.get(id) : undefined;
  const blobs = useMemo(() => (id ? blobsStore.listByEntry(id) : []), [id]);

  if (!entry) {
    return (
      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-[12px] text-slate-300 backdrop-blur-xl">
          找不到这条记录（可能已被删除）。
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 space-y-4">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-slate-100"
            onClick={() => router.back()}
          >
            返回
          </button>
          <div className="flex-1">
            <div className="text-[18px] font-semibold text-slate-50">{entry.title}</div>
            <div className="mt-1 text-[12px] text-slate-300">
              {entry.module} · {fmt(entry.createdAt)}
            </div>
          </div>
          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-red-200"
            onClick={() => {
              if (!confirm("确认删除这条记录？")) return;
              entriesStore.delete(entry.id);
              router.push(`/${entry.module === "Daily" ? "daily" : entry.module.toLowerCase()}`);
            }}
          >
            删除
          </button>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="text-[12px] font-semibold text-slate-50">原文</div>
        <div className="mt-2 whitespace-pre-wrap text-[12px] text-slate-200">
          {entry.text || "（空文本）"}
        </div>
      </section>

      {!!entry.tags_v1?.length && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-[12px] font-semibold text-slate-50">标签</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {entry.tags_v1.map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="text-[12px] font-semibold text-slate-50">AI 分析</div>
        <div className="mt-2 text-[12px] text-slate-200 whitespace-pre-wrap">
          {entry.analysis_v1?.summary || "（暂无摘要）"}
        </div>
        <div className="mt-3 grid gap-2 text-[12px] text-slate-200">
          <div>
            <span className="text-slate-400">动机：</span>
            {entry.analysis_v1?.psychological_report?.motive || "—"}
          </div>
          <div>
            <span className="text-slate-400">渴望：</span>
            {entry.analysis_v1?.psychological_report?.desire || "—"}
          </div>
          <div>
            <span className="text-slate-400">情绪：</span>
            valence {Number(entry.analysis_v1?.psychological_report?.emotion?.valence ?? 0).toFixed(2)} · arousal{" "}
            {Number(entry.analysis_v1?.psychological_report?.emotion?.arousal ?? 0.5).toFixed(2)}
          </div>
          <div>
            <span className="text-slate-400">MBTI：</span>
            {entry.analysis_v1?.mbti_snapshot || "—"}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="text-[12px] font-semibold text-slate-50">Mermaid 代码（下一步会渲染）</div>
        <pre className="mt-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-3 text-[11px] text-slate-200">
          {entry.analysis_v1?.visual_data || "（暂无 Mermaid）"}
        </pre>
      </section>

      {blobs.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-[12px] font-semibold text-slate-50">附件</div>
          <div className="mt-2 space-y-2 text-[12px] text-slate-200">
            {blobs.map((b) => (
              <div key={b.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-[11px] text-slate-300">{b.kind.toUpperCase()} · {b.name}</div>
                <div className="mt-1 text-[11px] text-slate-400">{b.mimeType} · {Math.round(b.size / 1024)} KB</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <ChatPanel scope="entry" scopeRefId={entry.id} module={entry.module} entryId={entry.id} />
    </main>
  );
}


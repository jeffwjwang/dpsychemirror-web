"use client";

import Link from "next/link";
import type { Entry } from "@/types/psyche";

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function EntryList({ entries }: { entries: Entry[] }) {
  if (!entries.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-[12px] text-slate-300 backdrop-blur-xl">
        暂无记录。先创建一条，让系统开始“看见你”。
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <Link
          key={e.id}
          href={`/entry/${e.id}`}
          className="block rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[14px] font-semibold text-slate-50">{e.title}</div>
              <div className="mt-1 text-[12px] text-slate-300 line-clamp-2">
                {e.analysis_v1?.summary || "（暂无摘要）"}
              </div>
              {!!e.tags_v1?.length && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {e.tags_v1.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right text-[10px] text-slate-400">
              {fmtTime(e.createdAt)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}


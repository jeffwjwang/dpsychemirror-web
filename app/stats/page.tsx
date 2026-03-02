"use client";

import { useEffect, useMemo, useState } from "react";
import type { Entry } from "@/types/psyche";
import { entriesStore } from "@/lib/storage/localStore";

export default function StatsPage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    setEntries(entriesStore.listAll());
  }, []);

  const stats = useMemo(() => {
    const byModule = { Daily: 0, Knowledge: 0, Inspiration: 0, Chat: 0 } as Record<string, number>;
    let sumV = 0;
    let sumA = 0;
    let n = 0;
    for (const e of entries) {
      byModule[e.module] = (byModule[e.module] || 0) + 1;
      const emo = e.analysis_v1?.psychological_report?.emotion;
      if (emo && Number.isFinite(emo.valence) && Number.isFinite(emo.arousal)) {
        sumV += emo.valence;
        sumA += emo.arousal;
        n += 1;
      }
    }
    return {
      total: entries.length,
      byModule,
      avgV: n ? sumV / n : 0,
      avgA: n ? sumA / n : 0,
      max: Math.max(1, ...Object.values(byModule)),
    };
  }, [entries]);

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 space-y-4">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="text-[20px] font-semibold text-slate-50" style={{ fontFamily: "var(--font-display)" }}>
          统计报表
        </div>
        <div className="mt-1 text-[12px] text-slate-300">
          这是第一版概览：总量、模块分布、平均情绪刻度。后续会加入天/周曲线与异常点检测。
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="text-[12px] text-slate-300">总记录数</div>
        <div className="mt-1 text-[28px] font-semibold text-slate-50">{stats.total}</div>
        <div className="mt-2 text-[12px] text-slate-300">
          平均情绪价度 valence：{stats.avgV.toFixed(2)} · 平均唤醒度 arousal：{stats.avgA.toFixed(2)}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="text-[12px] font-semibold text-slate-50">模块分布</div>
        <div className="mt-3 space-y-2">
          {Object.entries(stats.byModule).map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between text-[12px] text-slate-200">
                <span>{k}</span>
                <span>{v}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-300/70"
                  style={{ width: `${(v / stats.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}


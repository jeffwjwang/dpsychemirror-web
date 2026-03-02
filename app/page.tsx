"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiKeySheet } from "@/components/settings/ApiKeySheet";
import { ChatPanel } from "@/components/chat/ChatPanel";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 space-y-4">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[22px] font-semibold tracking-tight text-slate-50" style={{ fontFamily: "var(--font-display)" }}>
              PsycheMirror
            </div>
            <div className="mt-1 text-[12px] text-slate-300">
              灵魂之镜 · 四维留痕 → 潜意识解码 → 数字自体
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-slate-100"
            >
              API Key
            </button>
            <Link
              href="/stats"
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-slate-100"
            >
              统计
            </Link>
          </div>
        </div>
        <div className="mt-3 text-[12px] text-slate-300">
          这里将显示你的“动态心理状态”总览（今日/本周/全部）。下一步我们会把全局综述助手放在首页。
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <Link
          href="/daily"
          className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
        >
          <div className="text-[12px] text-slate-300">Daily · 琐事</div>
          <div className="mt-1 text-[16px] font-semibold text-slate-50">
            记录每天的点点滴滴
          </div>
          <div className="mt-2 text-[12px] text-slate-300">
            语音/文字/可选图片
          </div>
        </Link>
        <Link
          href="/knowledge"
          className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
        >
          <div className="text-[12px] text-slate-300">Knowledge · 收藏</div>
          <div className="mt-1 text-[16px] font-semibold text-slate-50">
            构建你的认知资产
          </div>
          <div className="mt-2 text-[12px] text-slate-300">
            多图/PDF/语音/文字
          </div>
        </Link>
        <Link
          href="/inspiration"
          className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
        >
          <div className="text-[12px] text-slate-300">Inspiration · 灵感</div>
          <div className="mt-1 text-[16px] font-semibold text-slate-50">
            捕捉突发念头
          </div>
          <div className="mt-2 text-[12px] text-slate-300">语音/文字</div>
        </Link>
        <Link
          href="/chat"
          className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
        >
          <div className="text-[12px] text-slate-300">Chat · 社交神探</div>
          <div className="mt-1 text-[16px] font-semibold text-slate-50">
            解析互动脚本
          </div>
          <div className="mt-2 text-[12px] text-slate-300">
            聊天截图（多图）
          </div>
        </Link>
      </section>

      <div className="pt-1">
        <div className="mb-2 text-[12px] text-slate-300">
          全局对话（Mock 或 Gemini）：你可以让导师基于“今日/本周/全部”做综述与风险提示。
        </div>
        <ChatPanel scope="global" scopeRefId="global" />
      </div>

      <ApiKeySheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}

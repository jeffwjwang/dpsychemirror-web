"use client";

import { useEffect, useState } from "react";
import { settingsStore } from "@/lib/storage/localStore";

export function ApiKeySheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [key, setKey] = useState("");

  useEffect(() => {
    if (!open) return;
    setKey(settingsStore.get().userApiKey || "");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/90 p-4 backdrop-blur-xl">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/15" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[14px] font-semibold text-slate-50">
              Gemini API Key
            </div>
            <div className="mt-1 text-[12px] text-slate-300">
              可留空启用 Mock。填写后将用于调用 `/api/analyze` 与 `/api/chat`（更接近真实体验）。
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              className="rounded-2xl bg-cyan-300 px-4 py-2 text-[12px] font-semibold text-slate-950"
              onClick={() => {
                settingsStore.set({ userApiKey: key.trim() });
                onClose();
              }}
            >
              保存
            </button>
            <button
              type="button"
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-100"
              onClick={onClose}
            >
              关闭
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-2">
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-[12px] text-slate-100 outline-none"
            placeholder="例如：AIza..."
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
          />
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-red-200"
              onClick={() => {
                settingsStore.set({ userApiKey: "" });
                setKey("");
              }}
            >
              清除（Mock）
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


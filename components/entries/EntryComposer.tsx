"use client";

import { useMemo, useRef, useState } from "react";
import type { BlobRecord, Entry, EntryModule } from "@/types/psyche";
import { analyzeEntry } from "@/lib/ai/client";
import { blobsStore, entriesStore } from "@/lib/storage/localStore";
import { uuid } from "@/lib/utils/uuid";

function moduleHint(module: EntryModule) {
  if (module === "Knowledge") return "多图 / PDF / 语音 / 文字都可以。先收集，再结构化。";
  if (module === "Chat") return "上传聊天截图（可多张）+ 简短注释。";
  if (module === "Inspiration") return "尽量快：语音或一句话，先把火花留住。";
  return "记录当下发生了什么，以及你真正的反应。";
}

async function fileToBase64(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
  return dataUrl.split(",")[1] || "";
}

function isoDayId(iso: string) {
  return iso.slice(0, 10);
}

export function EntryComposer({ module, onCreated }: { module: EntryModule; onCreated?: (e: Entry) => void }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [audio, setAudio] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const attachmentCount = useMemo(
    () => images.length + pdfs.length + (audio ? 1 : 0),
    [images.length, pdfs.length, audio]
  );

  async function toggleRecording() {
    if (recording) {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") {
        mr.stop();
      }
      setRecording(false);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("当前浏览器不支持录音，请改用上传音频文件。");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      setAudio(null);
      setRecording(true);
      setStatus("录音中… 再次点击结束。");

      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "voice.webm", { type: blob.type });
        setAudio(file);
        setStatus("录音已保存，可提交。");
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
    } catch (e) {
      console.error(e);
      setStatus("录音失败：请检查麦克风权限。");
      setRecording(false);
    }
  }

  async function onSubmit() {
    if (!text.trim() && attachmentCount === 0) return;
    setBusy(true);
    setStatus("正在解析…");

    try {
      const createdAt = new Date().toISOString();
      const id = uuid();

      const firstImage = images[0] || null;
      const imageBase64 = firstImage ? await fileToBase64(firstImage) : null;
      const firstPdf = pdfs[0] || null;
      const pdfBase64 = firstPdf ? await fileToBase64(firstPdf) : null;
      const audioFile = audio;
      const audioBase64 = audioFile ? await fileToBase64(audioFile) : null;

      const analysis = await analyzeEntry({
        module,
        text: text.trim(),
        imageBase64,
        imageMimeType: firstImage?.type || null,
        pdfBase64,
        pdfMimeType: firstPdf?.type || null,
        audioBase64,
        audioMimeType: audioFile?.type || null,
      });

      const analysis_v1 = {
        summary: analysis.summary,
        psychological_report: {
          motive: analysis.motivational_fingerprint?.motive || "",
          desire: analysis.motivational_fingerprint?.desire || "",
          emotion: {
            valence: Number(analysis.emotional_score?.valence ?? 0),
            arousal: Number(analysis.emotional_score?.arousal ?? 0.5),
          },
        },
        mbti_snapshot: analysis.mbti_snapshot || "",
        visual_data: analysis.visual_data || "",
      };

      const recursive_layer = {
        day_id: isoDayId(createdAt),
        week_id: `${createdAt.slice(0, 4)}-W?`,
        is_anomaly:
          Math.abs(analysis_v1.psychological_report.emotion.valence) > 0.7 ||
          analysis_v1.psychological_report.emotion.arousal > 0.8,
      };

      const entry: Entry = {
        id,
        module,
        title: (title || analysis.title || text.trim().slice(0, 18) || `${module} 记录`).trim(),
        tags_v1: Array.isArray(analysis.tags) ? analysis.tags.slice(0, 12) : [],
        text: text.trim(),
        createdAt,
        analysis_v1,
        recursive_layer,
        attachments_v1: {
          images: images.length,
          pdfs: pdfs.length,
          audio: audio ? 1 : 0,
        },
      };

      const blobs: BlobRecord[] = [];
      for (let i = 0; i < images.length; i++) {
        const f = images[i];
        blobs.push({
          id: uuid(),
          entryId: id,
          kind: "image",
          mimeType: f.type || "image/png",
          name: f.name || `image-${i + 1}.png`,
          size: f.size || 0,
          dataBase64: await fileToBase64(f),
          createdAt,
          order: i,
        });
      }
      for (let i = 0; i < pdfs.length; i++) {
        const f = pdfs[i];
        blobs.push({
          id: uuid(),
          entryId: id,
          kind: "pdf",
          mimeType: f.type || "application/pdf",
          name: f.name || `doc-${i + 1}.pdf`,
          size: f.size || 0,
          dataBase64: await fileToBase64(f),
          createdAt,
          order: i,
        });
      }
      if (audio) {
        blobs.push({
          id: uuid(),
          entryId: id,
          kind: "audio",
          mimeType: audio.type || "audio/webm",
          name: audio.name || "voice",
          size: audio.size || 0,
          dataBase64: await fileToBase64(audio),
          createdAt,
          order: 0,
        });
      }

      entriesStore.upsert(entry);
      if (blobs.length) blobsStore.addMany(blobs);

      setTitle("");
      setText("");
      setImages([]);
      setPdfs([]);
      setAudio(null);
      setStatus("已保存。");
      onCreated?.(entry);
    } catch (e) {
      setStatus("失败：请检查网络或 API Key。");
      console.error(e);
    } finally {
      setBusy(false);
      setTimeout(() => setStatus(""), 1500);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[14px] font-semibold text-slate-50">新建记录</div>
          <div className="mt-1 text-[12px] text-slate-300">{moduleHint(module)}</div>
        </div>
        <div className="text-[11px] text-slate-300">附件：{attachmentCount}</div>
      </div>

      <div className="mt-3 grid gap-2">
        <input
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-[12px] text-slate-100 outline-none"
          placeholder="可选：标题（留空由 AI 生成）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-[12px] text-slate-100 outline-none"
          rows={4}
          placeholder="写下发生了什么、你怎么想、你真正想要什么…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-2">
          <label className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center text-[11px] text-slate-100">
            图片（多选）
            <input
              className="hidden"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files || []))}
            />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center text-[11px] text-slate-100">
            PDF（多选）
            <input
              className="hidden"
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => setPdfs(Array.from(e.target.files || []))}
            />
          </label>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center text-[11px] text-slate-100 flex flex-col items-center justify-center gap-1">
            <button
              type="button"
              className="w-full rounded-2xl bg-cyan-300/90 px-3 py-1.5 text-[11px] font-semibold text-slate-950 disabled:opacity-60"
              onClick={toggleRecording}
              disabled={busy}
            >
              {recording ? "停止录音" : "点击录音"}
            </button>
            <div className="text-[10px] text-slate-300">
              {audio
                ? "已附加一段语音"
                : recording
                ? "录音中… 再点一次结束"
                : "可选：快速说完当下感受"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400">{status || "提交后会自动深度解析。"}</div>
          <button
            className="rounded-2xl bg-cyan-300 px-4 py-2 text-[12px] font-semibold text-slate-950 disabled:opacity-60"
            disabled={busy}
            type="button"
            onClick={onSubmit}
          >
            {busy ? "解析中…" : "记录并解析"}
          </button>
        </div>
      </div>
    </section>
  );
}


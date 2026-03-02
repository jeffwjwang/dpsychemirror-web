import { NextResponse } from "next/server";
import type { ConversationScope, EntryModule } from "@/types/psyche";

function mockReply(message: string) {
  return `我先用一个离线（Mock）视角回应你：\n\n你问的是「${message}」。\n我更在意的是：你似乎在用“想清楚”来对抗不确定。它很聪明，但代价是你会越来越累。\n\n把问题缩小到一个可以执行的动作：你现在最想“被承认”的那一点是什么？你准备怎么让它被看见？`;
}

async function callGemini(args: {
  apiKey: string;
  scope: ConversationScope;
  scopeRefId: string;
  module?: EntryModule | null;
  message: string;
  context?: string;
  range?: "day" | "week" | "all";
}): Promise<string> {
  const model = "gemini-3-flash-preview";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    args.apiKey
  )}`;

  const systemInstruction =
    "你是一个精通动力心理学与职场进化的“灵魂导师”。睿智、坦诚、具启发性；不要复述上下文；不要空泛鸡汤。";

  const scopeDesc =
    args.scope === "entry"
      ? "当前范围：只聚焦这条记录切片，深挖动机/防御/情绪背后的结构。"
      : args.scope === "module"
      ? `当前范围：只关注模块【${args.module ?? "未知"}】中的记录，找重复模式与关键变量。`
      : `当前范围：全局总览（${args.range ?? "all"}），跨模块总结主题、风险与可行动作。`;

  const prompt = `
${systemInstruction}
${scopeDesc}

你掌握的上下文（仅用于理解，不要逐条复述）：
${args.context || "(无)"}

用户问：
「${args.message}」

请直接作答，输出中文，必要时用 1-3 个追问引导用户更诚实地看见自己。`;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.() || "（空回复）";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      scope: ConversationScope;
      scopeRefId: string;
      module?: EntryModule | null;
      message: string;
      context?: string;
      range?: "day" | "week" | "all";
    };

    const headerKey = req.headers.get("x-psychemirror-user-key")?.trim();
    const envKey = process.env.GEMINI_API_KEY?.trim();
    const apiKey = headerKey || envKey || "";

    if (!apiKey) {
      return NextResponse.json({ reply: mockReply(body.message || "") });
    }

    const reply = await callGemini({
      apiKey,
      scope: body.scope || "global",
      scopeRefId: body.scopeRefId || "global",
      module: body.module ?? null,
      message: body.message || "",
      context: body.context,
      range: body.range,
    });

    return NextResponse.json({ reply });
  } catch (e) {
    return new NextResponse(
      typeof e === "object" && e && "message" in e ? String((e as any).message) : "chat error",
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import type { AnalyzeResult, EntryModule } from "@/types/psyche";

function mockAnalyze(text: string, module: EntryModule): AnalyzeResult {
  const snippet = (text || "").trim().slice(0, 40);
  const title =
    snippet.length > 0 ? snippet.replace(/\s+/g, " ").slice(0, 18) : `${module} 记录`;

  const summary =
    snippet.length > 0
      ? `你把「${snippet}${text.length > 40 ? "..." : ""}」固定下来，背后是一种想把局面重新握回手里的冲动。`
      : "你选择记录，但暂时没有给出文字。这种“留下空白”的动作，也可能是一种自我保护。";

  return {
    title,
    summary,
    tags: ["掌控感", "被看见", module === "Daily" ? "日常压力" : "自我叙事"],
    motivational_fingerprint: {
      motive: "在不确定环境中寻找确定性。",
      desire: "想证明自己不是被动被环境推着走。",
      narrative:
        "你在用记录重写自己的故事，而不是复述事件。你想被理解，但又担心被轻易定义。",
    },
    emotional_score: {
      valence: module === "Daily" ? 0.05 : module === "Inspiration" ? 0.6 : 0.25,
      arousal: module === "Knowledge" ? 0.35 : 0.7,
      label: module === "Inspiration" ? "兴奋" : module === "Daily" ? "轻微焦虑" : "中性紧绷",
    },
    mbti_snapshot:
      module === "Knowledge"
        ? "INTJ / INTP 倾向：偏好抽象结构与长期规划。"
        : module === "Inspiration"
        ? "ENFP / ENTP 倾向：能量外溢、点子驱动。"
        : "INFJ / ISFJ 倾向：对关系与评价较敏感。",
    visual_data: `graph TD
  Event["事件/输入"] --> Self["当下感受"]
  Self --> Motive["深层动机：掌控与被看见"]
  Motive --> Defense["防御：理性化/轻描淡写"]
  Motive --> Future["理想自体：稳定与可预期"]
  Defense -.可能代价.-> Future`,
  };
}

async function callGemini(args: {
  apiKey: string;
  module: EntryModule;
  text: string;
}): Promise<AnalyzeResult> {
  const model = "gemini-3-flash-preview";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    args.apiKey
  )}`;

  const systemInstruction =
    "你是一个精通动力心理学与职场进化的“灵魂导师”。严禁复述表面内容，必须挖掘潜意识欲望、社交防御机制与认知偏好。";

  const prompt = `
请基于用户输入，在【${args.module}】维度下，输出严格 JSON（禁止 Markdown/解释性文字）。

字段：
- title: 20字以内，一眼识别记录
- summary: 80字以内，聚焦“真正诉求”
- tags: 3-8个中文标签数组（动力心理学视角）
- motivational_fingerprint: { motive, desire, narrative }
- emotional_score: { valence(-1..1), arousal(0..1), label }
- mbti_snapshot: 认知偏好片段 + 解释
- visual_data: Mermaid graph TD，串联事件/动机/情绪/防御/理想自体

仅返回 JSON 对象。
`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: systemInstruction }, { text: prompt }, { text: `用户原文：${args.text || "(空)"}` }],
      },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const data = await res.json();
  const rawText: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.() ?? "";

  let cleaned = rawText;
  const codeBlock = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlock) cleaned = codeBlock[1];

  const parsed = JSON.parse(cleaned) as AnalyzeResult;
  return parsed;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      module: EntryModule;
      text: string;
    };

    const module = body?.module || "Daily";
    const text = body?.text || "";

    const headerKey = req.headers.get("x-psychemirror-user-key")?.trim();
    const envKey = process.env.GEMINI_API_KEY?.trim();
    const apiKey = headerKey || envKey || "";

    if (!apiKey) {
      return NextResponse.json(mockAnalyze(text, module));
    }

    const result = await callGemini({ apiKey, module, text });
    return NextResponse.json(result);
  } catch (e) {
    return new NextResponse(
      typeof e === "object" && e && "message" in e ? String((e as any).message) : "analyze error",
      { status: 500 }
    );
  }
}


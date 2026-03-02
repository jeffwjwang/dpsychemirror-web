export type EntryModule = "Daily" | "Knowledge" | "Inspiration" | "Chat";

export type MotivationalFingerprint = {
  motive: string;
  desire: string;
  narrative: string;
};

export type EmotionalScore = {
  valence: number; // -1..1
  arousal: number; // 0..1
  label?: string;
};

export type AnalyzeResult = {
  title: string;
  summary: string;
  tags: string[];
  motivational_fingerprint: MotivationalFingerprint;
  emotional_score: EmotionalScore;
  mbti_snapshot: string;
  visual_data: string; // Mermaid
};

export type AnalysisV1 = {
  summary: string;
  psychological_report: {
    motive: string;
    desire: string;
    emotion: {
      valence: number;
      arousal: number;
    };
  };
  mbti_snapshot: string;
  visual_data: string;
};

export type RecursiveLayer = {
  day_id: string;
  week_id: string;
  is_anomaly: boolean;
};

export type AttachmentKind = "image" | "pdf" | "audio";

export type BlobRecord = {
  id: string;
  entryId: string;
  kind: AttachmentKind;
  mimeType: string;
  name: string;
  size: number;
  dataBase64: string;
  createdAt: string;
  order: number;
};

export type Entry = {
  id: string;
  module: EntryModule;
  title: string;
  tags_v1: string[];
  text: string;
  createdAt: string;
  analysis_v1: AnalysisV1;
  recursive_layer: RecursiveLayer;
  attachments_v1: {
    images: number;
    pdfs: number;
    audio: number;
  };
};

export type ConversationScope = "global" | "module" | "entry";
export type MessageRole = "user" | "assistant";

export type Conversation = {
  id: string;
  scope: ConversationScope;
  scopeRefId: string;
  createdAt: string;
};

export type Message = {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
};


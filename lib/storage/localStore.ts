"use client";

import type {
  BlobRecord,
  Conversation,
  ConversationScope,
  Entry,
  EntryModule,
  Message,
  MessageRole,
} from "@/types/psyche";
import { uuid } from "@/lib/utils/uuid";

const KEYS = {
  entries: "psychemirror_entries_v1",
  blobs: "psychemirror_blobs_v1",
  conversations: "psychemirror_conversations_v1",
  messages: "psychemirror_messages_v1",
  settings: "psychemirror_settings_v1",
} as const;

type Settings = {
  userApiKey?: string;
};

const IS_BROWSER = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function readJson<T>(key: string, fallback: T): T {
  if (!IS_BROWSER) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!IS_BROWSER) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors in non-browser or quota issues
  }
}

export const settingsStore = {
  get(): Settings {
    return readJson<Settings>(KEYS.settings, {});
  },
  set(next: Settings) {
    writeJson(KEYS.settings, next);
  },
};

export const entriesStore = {
  listAll(): Entry[] {
    const all = readJson<Entry[]>(KEYS.entries, []);
    return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },
  listByModule(module: EntryModule): Entry[] {
    return this.listAll().filter((e) => e.module === module);
  },
  get(id: string): Entry | undefined {
    return readJson<Entry[]>(KEYS.entries, []).find((e) => e.id === id);
  },
  upsert(entry: Entry) {
    const all = readJson<Entry[]>(KEYS.entries, []);
    const idx = all.findIndex((e) => e.id === entry.id);
    if (idx >= 0) all[idx] = entry;
    else all.push(entry);
    writeJson(KEYS.entries, all);
  },
  delete(id: string) {
    const all = readJson<Entry[]>(KEYS.entries, []).filter((e) => e.id !== id);
    writeJson(KEYS.entries, all);

    // also delete blobs + entry conversation/messages
    const blobs = readJson<BlobRecord[]>(KEYS.blobs, []).filter((b) => b.entryId !== id);
    writeJson(KEYS.blobs, blobs);

    const conversations = readJson<Conversation[]>(KEYS.conversations, []);
    const conv = conversations.find((c) => c.scope === "entry" && c.scopeRefId === id);
    if (conv) {
      writeJson(
        KEYS.conversations,
        conversations.filter((c) => c.id !== conv.id)
      );
      const msgs = readJson<Message[]>(KEYS.messages, []).filter(
        (m) => m.conversationId !== conv.id
      );
      writeJson(KEYS.messages, msgs);
    }
  },
  clearAll() {
    writeJson(KEYS.entries, []);
    writeJson(KEYS.blobs, []);
    writeJson(KEYS.conversations, []);
    writeJson(KEYS.messages, []);
  },
};

export const blobsStore = {
  listByEntry(entryId: string): BlobRecord[] {
    return readJson<BlobRecord[]>(KEYS.blobs, [])
      .filter((b) => b.entryId === entryId)
      .sort((a, b) => a.order - b.order);
  },
  addMany(records: BlobRecord[]) {
    const all = readJson<BlobRecord[]>(KEYS.blobs, []);
    all.push(...records);
    writeJson(KEYS.blobs, all);
  },
};

export const chatStore = {
  getOrCreateConversation(scope: ConversationScope, scopeRefId: string): Conversation {
    const all = readJson<Conversation[]>(KEYS.conversations, []);
    const existing = all.find((c) => c.scope === scope && c.scopeRefId === scopeRefId);
    if (existing) return existing;
    const conv: Conversation = {
      id: uuid(),
      scope,
      scopeRefId,
      createdAt: new Date().toISOString(),
    };
    all.push(conv);
    writeJson(KEYS.conversations, all);
    return conv;
  },
  listMessages(conversationId: string): Message[] {
    const all = readJson<Message[]>(KEYS.messages, []);
    return all
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  },
  appendMessage(conversationId: string, role: MessageRole, content: string): Message {
    const all = readJson<Message[]>(KEYS.messages, []);
    const msg: Message = {
      id: uuid(),
      conversationId,
      role,
      content,
      createdAt: new Date().toISOString(),
    };
    all.push(msg);
    writeJson(KEYS.messages, all);
    return msg;
  },
};


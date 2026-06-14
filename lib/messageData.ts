import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { ensureDatabaseSchema, hasDatabase, query } from "@/lib/db";
import { mockMessages } from "@/lib/mockMessages";
import type { Message } from "@/types/message";

const dataDir = path.join(process.cwd(), "data");
const messagesPath = path.join(dataDir, "messages.json");

function requiresDatabase() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1" || process.env.REQUIRE_DATABASE === "true";
}

export async function readMessages() {
  if (hasDatabase()) {
    try {
      await ensureDatabaseSchema();
      const result = await query<{ data: Message }>("select data from app_messages order by created_at desc");
      return result?.rows.map((row) => row.data) ?? mockMessages;
    } catch {
      return mockMessages;
    }
  }

  try {
    const content = await readFile(messagesPath, "utf-8");
    const parsed = JSON.parse(content) as unknown;
    return Array.isArray(parsed) ? parsed as Message[] : mockMessages;
  } catch {
    return mockMessages;
  }
}

export async function writeMessage(message: Message) {
  if (!hasDatabase() && requiresDatabase()) {
    throw new Error("DATABASE_URL is required for durable message storage on this deployment.");
  }

  const messages = [message, ...(await readMessages()).filter((item) => item.id !== message.id)];

  if (hasDatabase()) {
    await ensureDatabaseSchema();
    await query(
      `insert into app_messages (id, email, status, data, updated_at)
       values ($1, $2, $3, $4::jsonb, now())
       on conflict (id) do update set
         email = excluded.email,
         status = excluded.status,
         data = excluded.data,
         updated_at = now()`,
      [message.id, message.email, message.status, JSON.stringify(message)]
    );
    return messages;
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(messagesPath, JSON.stringify(messages, null, 2), "utf-8");
  return messages;
}

export async function updateMessage(id: string, updates: Pick<Message, "status">) {
  if (!hasDatabase() && requiresDatabase()) {
    throw new Error("DATABASE_URL is required for durable message storage on this deployment.");
  }

  const messages = await readMessages();
  const existing = messages.find((message) => message.id === id);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  const next = messages.map((message) => message.id === id ? updated : message);

  if (hasDatabase()) {
    await ensureDatabaseSchema();
    await query(
      `update app_messages
       set status = $2, data = $3::jsonb, updated_at = now()
       where id = $1`,
      [id, updated.status, JSON.stringify(updated)]
    );
    return updated;
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(messagesPath, JSON.stringify(next, null, 2), "utf-8");
  return updated;
}

export async function deleteMessage(id: string) {
  if (!hasDatabase() && requiresDatabase()) {
    throw new Error("DATABASE_URL is required for durable message deletion on this deployment.");
  }

  const messages = await readMessages();
  const exists = messages.some((message) => message.id === id);
  if (!exists) return false;

  if (hasDatabase()) {
    await ensureDatabaseSchema();
    await query("delete from app_messages where id = $1", [id]);
    return true;
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(messagesPath, JSON.stringify(messages.filter((message) => message.id !== id), null, 2), "utf-8");
  return true;
}

import { promises as fs } from "fs";
import path from "path";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

const FILE = path.join(process.cwd(), "data", "contact-messages.json");
const MAX_MESSAGES = 500;

async function readAll(): Promise<ContactMessage[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ContactMessage[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(messages: ContactMessage[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(messages, null, 2));
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const messages = await readAll();
  return messages.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<ContactMessage> {
  const entry: ContactMessage = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    message: input.message,
    createdAt: new Date().toISOString(),
  };
  const messages = await readAll();
  messages.push(entry);
  await writeAll(messages.slice(-MAX_MESSAGES));
  return entry;
}

export async function deleteContactMessage(id: string) {
  const messages = await readAll();
  await writeAll(messages.filter((item) => item.id !== id));
}

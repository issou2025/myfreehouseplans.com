import { jsonError, jsonSuccess } from "@/lib/apiResponse";
import { deleteMessage, readMessages, updateMessage, writeMessage } from "@/lib/messageData";
import { cleanMultilineText, cleanText, getClientKey, isEmail, isSafeRelativeOrHttpUrl, rateLimit, readJsonBody } from "@/lib/security";
import type { Message } from "@/types/message";

export const runtime = "nodejs";

export async function GET() {
  const messages = await readMessages();
  return jsonSuccess("Messages loaded.", { messages });
}

export async function POST(request: Request) {
  try {
    if (!rateLimit(`message:${getClientKey(request)}`, 8, 60_000)) {
      return jsonError("Too many requests. Please wait a minute and try again.", 429);
    }

    let body: Partial<Message> & {
      bedrooms?: string;
      plotSize?: string;
      budgetLevel?: string;
      fileNeeds?: string;
      preferredStyle?: string;
      website?: string;
    };
    try {
      body = await readJsonBody<typeof body>(request, 64 * 1024);
    } catch {
      return jsonError("Invalid JSON body.", 400);
    }

    const name = cleanText(body.name, 120);
    const email = cleanText(body.email, 254).toLowerCase();
    const attachmentUrl = cleanText(body.attachmentUrl, 500);
    const errors: Record<string, string> = {};

    if (cleanText(body.website, 200)) {
      return jsonSuccess("Message received.", { message: null }, 201);
    }
    if (!name) errors.name = "Name is required.";
    if (!email || !isEmail(email)) errors.email = "A valid email address is required.";
    if (attachmentUrl && !isSafeRelativeOrHttpUrl(attachmentUrl)) errors.attachmentUrl = "Attachment URL is not allowed.";
    if (Object.keys(errors).length) return jsonError("Validation failed.", 400, errors);

    const messageText = [
      cleanMultilineText(body.message, 3000),
      body.plotSize ? `Plot size: ${cleanText(body.plotSize, 80)}` : "",
      body.bedrooms ? `Bedrooms: ${cleanText(body.bedrooms, 80)}` : "",
      body.preferredStyle ? `Preferred style: ${cleanText(body.preferredStyle, 120)}` : "",
      body.budgetLevel ? `Budget: ${cleanText(body.budgetLevel, 80)}` : "",
      body.fileNeeds ? `Files needed: ${cleanText(body.fileNeeds, 120)}` : "",
      attachmentUrl ? `Attachment: ${attachmentUrl}` : ""
    ].filter(Boolean).join("\n");

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      name,
      email,
      country: cleanText(body.country, 120) || "Not specified",
      subject: cleanText(body.subject, 160) || "Custom plan request",
      planConcerned: cleanText(body.planConcerned, 180) || "Custom request",
      message: messageText || "No message provided.",
      attachmentUrl: attachmentUrl || undefined,
      attachmentName: cleanText(body.attachmentName, 180) || undefined,
      status: "New",
      type: "Custom plan request",
      date: new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date())
    };

    await writeMessage(newMessage);

    return jsonSuccess("Message received.", { message: newMessage }, 201);
  } catch {
    return jsonError("Unable to save your message right now.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await readJsonBody<{ id?: string; status?: Message["status"] }>(request, 8 * 1024);
    const id = cleanText(body.id, 120);
    const statuses: Message["status"][] = ["New", "Read", "Replied", "Archived"];
    if (!id) return jsonError("Message id is required.", 400);
    if (!body.status || !statuses.includes(body.status)) return jsonError("A valid message status is required.", 400);

    const message = await updateMessage(id, { status: body.status });
    if (!message) return jsonError("Message not found.", 404);
    return jsonSuccess("Message status updated.", { message });
  } catch {
    return jsonError("Unable to update this message right now.", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await readJsonBody<{ id?: string }>(request, 8 * 1024);
    const id = cleanText(body.id, 120);
    if (!id) return jsonError("Message id is required.", 400);
    if (!(await deleteMessage(id))) return jsonError("Message not found.", 404);
    return jsonSuccess("Message deleted.", { id });
  } catch {
    return jsonError("Unable to delete this message right now.", 500);
  }
}

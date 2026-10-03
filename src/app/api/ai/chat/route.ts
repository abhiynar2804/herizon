import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gemini, GEMINI_MODEL, FALLBACK_MODEL } from "@/lib/ai/gemini";

const chatSchema = z.object({
  sessionId: z.string().cuid().optional(),
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message is too long."),
});

function isGeminiServiceUnavailable(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const details = error as {
    status?: unknown;
    code?: unknown;
    message?: unknown;
  };
  const message =
    typeof details.message === "string" ? details.message.toLowerCase() : "";

  return (
    details.status === 503 ||
    details.status === "503" ||
    details.code === 503 ||
    details.code === "503" ||
    message.includes("503") ||
    message.includes("high demand") ||
    message.includes("service unavailable")
  );
}

const SYSTEM_INSTRUCTION = `
You are Herizon AI, a women's health and wellness educational assistant.

Your role is to provide general, educational information about women's health,
menstrual health, wellness, nutrition, fitness, and common health concerns.

Response Style & Format:
- Provide clear, well-structured, and fully completed answers.
- Avoid cutting off mid-explanation. Keep summaries helpful yet concise.
- Keep Content Below 2000 Characters: If your response exceeds 2000 characters, summarize the content.

Important safety rules:
- Do not diagnose diseases or medical conditions.
- Do not claim certainty about a user's medical condition.
- Do not prescribe medication or provide prescription dosages.
- Do not present yourself as a doctor.
- Do not replace professional medical advice.
- For serious, severe, worsening, or concerning symptoms, recommend seeking
  appropriate professional medical care.
- Keep responses clear, respectful, and easy to understand.
`;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message ?? "Invalid request.",
        },
        { status: 400 },
      );
    }

    const { sessionId, message } = parsed.data;

    let chatSession;

    if (sessionId) {
      chatSession = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: session.user.id,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
            take: 20,
          },
        },
      });

      if (!chatSession) {
        return NextResponse.json(
          { message: "Chat session not found." },
          { status: 404 },
        );
      }
    } else {
      chatSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
        },
        include: {
          messages: true,
        },
      });
    }

    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        sender: "USER",
        content: message,
      },
    });

    const history = chatSession.messages.map((item) => ({
      role: item.sender === "USER" ? "user" : "model",
      parts: [{ text: item.content }],
    }));

    history.push({
      role: "user",
      parts: [{ text: message }],
    });

    let response;

    try {
      response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: history,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.4,
          maxOutputTokens: 2804,
        },
      });
    } catch (error) {
      if (!isGeminiServiceUnavailable(error)) {
        throw error;
      }

      console.warn(
        `[Gemini API] ${GEMINI_MODEL} unavailable. Retrying with ${FALLBACK_MODEL}.`,
      );

      response = await gemini.models.generateContent({
        model: FALLBACK_MODEL,
        contents: history,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.4,
          maxOutputTokens: 2804,
        },
      });
    }

    const aiMessage = response.text?.trim();

    if (!aiMessage) {
      return NextResponse.json(
        { message: "The AI returned an empty response." },
        { status: 502 },
      );
    }

    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        sender: "AI",
        content: aiMessage,
      },
    });

    await prisma.chatSession.update({
      where: {
        id: chatSession.id,
      },
      data: {
        title: chatSession.title ?? message.slice(0, 60),
      },
    });

    return NextResponse.json({
      sessionId: chatSession.id,
      message: aiMessage,
    });
  } catch (error) {
    console.error("AI chat error:", error);

    return NextResponse.json(
      { message: "Unable to process your request right now." },
      { status: 500 },
    );
  }
}
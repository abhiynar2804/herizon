"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  sender: "USER" | "AI";
  content: string;
  createdAt: string;
};

type ChatSession = {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AIPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      setPageLoading(true);
      setError("");

      const response = await fetch("/api/ai/sessions");

      if (!response.ok) {
        throw new Error("Unable to load conversations.");
      }

      const data = await response.json();
      setSessions(data.sessions ?? []);

      if (data.sessions?.length > 0) {
        await loadSession(data.sessions[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversations."
      );
    } finally {
      setPageLoading(false);
    }
  }

  async function loadSession(sessionId: string) {
    try {
      setError("");

      const response = await fetch(
        `/api/ai/sessions/${sessionId}`
      );

      if (!response.ok) {
        throw new Error("Unable to load conversation.");
      }

      const data = await response.json();

      setActiveSession(sessionId);
      setMessages(data.session.messages ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversation."
      );
    }
  }

  async function createSession() {
    try {
      setError("");

      const response = await fetch("/api/ai/sessions", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to create conversation.");
      }

      const data = await response.json();

      const newSession = data.session as ChatSession;

      setSessions((current) => [
        newSession,
        ...current,
      ]);

      setActiveSession(newSession.id);
      setMessages([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create conversation."
      );
    }
  }

  async function sendMessage() {
    const message = input.trim();

    if (!message || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: activeSession ?? undefined,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? "Unable to send message."
        );
      }

      setInput("");

      await loadSession(data.sessionId);

      const sessionsResponse = await fetch(
        "/api/ai/sessions"
      );

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions ?? []);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send message."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteSession(sessionId: string) {
    try {
      const response = await fetch(
        `/api/ai/sessions/${sessionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete conversation.");
      }

      const remaining = sessions.filter(
        (session) => session.id !== sessionId
      );

      setSessions(remaining);

      if (activeSession === sessionId) {
        setActiveSession(null);
        setMessages([]);

        if (remaining.length > 0) {
          await loadSession(remaining[0].id);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete conversation."
      );
    }
  }

  if (pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading Herizon AI...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-white">
      <aside className="w-72 border-r p-4">
        <button
          onClick={createSession}
          className="mb-4 w-full rounded-lg bg-pink-600 px-4 py-2 text-white"
        >
          + New Conversation
        </button>

        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center gap-2 rounded-lg p-2 ${
                activeSession === session.id
                  ? "bg-pink-50"
                  : ""
              }`}
            >
              <button
                onClick={() => loadSession(session.id)}
                className="flex-1 truncate text-left"
              >
                {session.title || "New Conversation"}
              </button>

              <button
                onClick={() => deleteSession(session.id)}
                className="text-sm text-red-500"
                aria-label="Delete conversation"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex flex-1 flex-col">
        <header className="border-b p-4">
          <h1 className="text-xl font-semibold">
            Herizon AI
          </h1>

          <p className="text-sm text-gray-500">
            General women's health information and
            educational guidance.
          </p>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="text-lg font-medium">
                  How can I help?
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Ask a general women's health question.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "USER"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3 ${
                    message.sender === "USER"
                      ? "bg-pink-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {error && (
          <div className="border-t px-6 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="border-t p-4">
          <div className="mx-auto flex max-w-4xl gap-2">
            <input
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              maxLength={2000}
              placeholder="Ask Herizon AI..."
              className="flex-1 rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-pink-300"
              disabled={loading}
            />

            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-pink-600 px-5 py-3 text-white disabled:opacity-50"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>

          <p className="mx-auto mt-2 max-w-4xl text-xs text-gray-500">
            Herizon AI provides general health information and
            does not diagnose or replace professional medical
            advice.
          </p>
        </div>
      </section>
    </main>
  );
}
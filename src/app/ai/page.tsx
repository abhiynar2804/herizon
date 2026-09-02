"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
        err instanceof Error ? err.message : "Unable to load conversations."
      );
    } finally {
      setPageLoading(false);
    }
  }

  async function loadSession(sessionId: string) {
    try {
      setError("");

      const response = await fetch(`/api/ai/sessions/${sessionId}`);

      if (!response.ok) {
        throw new Error("Unable to load conversation.");
      }

      const data = await response.json();

      setActiveSession(sessionId);
      setMessages(data.session.messages ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load conversation."
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

      setSessions((current) => [newSession, ...current]);
      setActiveSession(newSession.id);
      setMessages([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create conversation."
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
        throw new Error(data.message ?? "Unable to send message.");
      }

      setInput("");
      await loadSession(data.sessionId);

      const sessionsResponse = await fetch("/api/ai/sessions");
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions ?? []);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send message."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteSession(sessionId: string) {
    try {
      const response = await fetch(`/api/ai/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete conversation.");
      }

      const remaining = sessions.filter((session) => session.id !== sessionId);
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
        err instanceof Error ? err.message : "Unable to delete conversation."
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        <div className="flex-1 bg-white rounded-3xl shadow-xs border border-pink-100/60 flex flex-col lg:flex-row overflow-hidden min-h-[600px]">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-100 p-4 bg-gray-50/50 flex flex-col">
            <button
              onClick={createSession}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-semibold text-xs shadow-xs transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>+ New Conversation</span>
            </button>

            <div className="mt-4 flex-1 overflow-y-auto space-y-1.5 max-h-60 lg:max-h-none">
              {pageLoading ? (
                <p className="text-xs text-gray-400 p-2">Loading sessions...</p>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-gray-400 p-2">No conversations yet.</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
                      activeSession === session.id
                        ? "bg-pink-100/80 text-pink-900 font-semibold"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <button
                      onClick={() => loadSession(session.id)}
                      className="flex-1 truncate text-left"
                    >
                      {session.title || "New Consultation"}
                    </button>

                    <button
                      onClick={() => deleteSession(session.id)}
                      className="text-gray-400 hover:text-red-500 transition px-1"
                      aria-label="Delete conversation"
                    >
                      &times;
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Chat Container */}
          <section className="flex-1 flex flex-col justify-between">
            <header className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 text-white flex items-center justify-center text-sm shadow-xs">
                  🤖
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900">
                    Herizon AI Companion
                  </h1>
                  <p className="text-[11px] text-gray-400">
                    General women&apos;s health, cycle education, and hormone guidance.
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                Online &bull; Gemini Powered
              </span>
            </header>

            {/* Messages Stream */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6 max-h-[500px]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center text-2xl">
                    🌸
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      How can Herizon AI help you today?
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm">
                      Ask about cycle phases, nutrition for PCOS, PMS remedies, or sleep optimization.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md text-xs">
                    <button
                      onClick={() => {
                        setInput("What should I eat during my luteal phase?");
                      }}
                      className="p-2.5 rounded-xl bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-pink-700 text-left border border-gray-100 transition"
                    >
                      &ldquo;What should I eat during my luteal phase?&rdquo;
                    </button>
                    <button
                      onClick={() => {
                        setInput("How does stress affect cycle regularity?");
                      }}
                      className="p-2.5 rounded-xl bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-pink-700 text-left border border-gray-100 transition"
                    >
                      &ldquo;How does stress affect cycle regularity?&rdquo;
                    </button>
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
                      className={`max-w-xl rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                        message.sender === "USER"
                          ? "bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-br-none shadow-xs"
                          : "bg-gray-100/80 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {error && (
              <div className="border-t border-red-100 bg-red-50/50 px-4 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Input Bar */}
            <div className="border-t border-gray-100 p-4 bg-gray-50/30">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  maxLength={2000}
                  placeholder="Ask Herizon AI about cycle, nutrition, or wellness..."
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  disabled={loading}
                />

                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 px-5 py-2.5 text-white font-semibold text-xs disabled:opacity-50 transition shadow-xs"
                >
                  {loading ? "Thinking..." : "Send"}
                </button>
              </div>

              <p className="mt-2 text-[10px] text-gray-400 text-center">
                Herizon AI provides educational wellness guidance and is not a clinical medical substitute.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
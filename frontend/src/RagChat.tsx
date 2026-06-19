import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { askRag } from "./api/askRag";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  time: string;
};

function getTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function RagChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleAsk = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: question, time: getTime() }]);
    setInput("");
    setLoading(true);
    try {
      const res = await askRag(question);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer, sources: res.sources, time: getTime() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong",
          time: getTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f7f9fb] text-[#191c1e] flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 sticky top-0 z-50 bg-white border-b border-[#e0e3e5] h-16 shrink-0">
        <span className="font-bold text-xl text-[#00236f] tracking-tight whitespace-nowrap">
          PDF RAG Assistant
        </span>
        <div className="hidden md:flex items-center gap-5 flex-1 justify-end">
          <div className="relative w-full max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757682] text-sm">🔍</span>
            <input
              className="pl-9 pr-4 py-1.5 bg-[#f2f4f6] border-none rounded-full text-sm focus:ring-2 focus:ring-[#00236f]/20 w-full outline-none"
              placeholder="Search..."
              type="text"
            />
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1e3a8a] text-white text-xs font-semibold border border-[#c5c5d3] shrink-0">
            JD
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col h-full w-64 bg-white border-r border-[#e0e3e5] py-6 px-4 shrink-0">
          {/* New Query */}
          <div className="mb-6 px-1">
            <button
              onClick={() => setMessages([])}
              className="w-full flex items-center justify-center gap-2 bg-[#00236f] text-white py-3 px-6 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            >
              <span className="text-base leading-none">+</span>
              New Query
            </button>
          </div>

          {/* Nav links */}
          <div className="flex-1 overflow-y-auto space-y-1 px-1 chat-scroll">
            <p className="text-xs text-[#757682] px-3 mb-2 uppercase tracking-wider">Navigation</p>
            <Link
              to="/upload"
              className="flex items-center gap-3 text-[#444651] p-3 rounded-lg hover:bg-[#eceef0] transition-all"
            >
              <span className="text-base">📄</span>
              <span className="text-sm font-medium">Upload PDF</span>
            </Link>
          </div>

          {/* Bottom */}
          <div className="mt-auto border-t border-[#e0e3e5] pt-4 flex flex-col gap-1">
            <button className="flex items-center gap-3 text-[#444651] p-3 rounded-lg hover:bg-[#eceef0] transition-all w-full text-left">
              <span className="text-base">❓</span>
              <span className="text-sm font-medium">Help Center</span>
            </button>
            <button className="flex items-center gap-3 text-[#ba1a1a] p-3 rounded-lg hover:bg-[#ffdad6] transition-all w-full text-left">
              <span className="text-base">🚪</span>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Chat */}
        <main className="flex-1 flex flex-col relative bg-[#f7f9fb] min-w-0">
          {/* Mobile header */}
          <div className="md:hidden flex items-center gap-3 p-4 bg-white border-b border-[#e0e3e5]">
            <span className="font-bold text-[#00236f]">PDF RAG Assistant</span>
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 chat-scroll"
          >
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#dce1ff] flex items-center justify-center text-3xl">
                  🤖
                </div>
                <p className="text-[#444651] text-base max-w-xs">
                  Upload a PDF and ask anything about its contents.
                </p>
                <Link
                  to="/upload"
                  className="text-sm font-semibold text-[#00236f] hover:underline"
                >
                  Upload a PDF →
                </Link>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 max-w-4xl mx-auto w-full message-appear ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-[#1e3a8a] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">AI</span>
                  </div>
                )}

                <div
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  } max-w-[80%] min-w-0`}
                >
                  {msg.role === "user" ? (
                    <>
                      <div className="bg-[#00236f] text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-sm text-sm break-words">
                        {msg.content}
                      </div>
                      <span className="text-xs text-[#757682] mt-1">{msg.time}</span>
                    </>
                  ) : (
                    <>
                      <div className="bg-white border border-[#c5c5d3] px-4 py-3 rounded-2xl rounded-tl-none shadow-sm text-[#191c1e] text-sm space-y-3">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="bg-[#f2f4f6] p-3 rounded-lg border-l-4 border-[#00236f]">
                            <p className="text-xs text-[#00236f] font-semibold mb-1">
                              📎 Source Reference
                            </p>
                            <ul className="text-xs text-[#444651] italic space-y-0.5">
                              {msg.sources.map((src, i) => (
                                <li key={i}>{src.split("/").pop()}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-[#757682] mt-1">{msg.time}</span>
                    </>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[#d0e1fb] flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-[#00236f]">JD</span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start gap-3 max-w-4xl mx-auto w-full message-appear">
                <div className="w-8 h-8 rounded-full bg-[#1e3a8a] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
                <div className="bg-white border border-[#c5c5d3] px-4 py-4 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-[#00236f] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#00236f] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-[#00236f] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 md:p-6 bg-[#f7f9fb]/80 backdrop-blur-md sticky bottom-0 z-40">
            <div className="max-w-4xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                className="relative flex items-center bg-white border border-[#c5c5d3] rounded-xl shadow-lg focus-within:border-[#00236f]/50 transition-all pr-3"
              >
                <Link
                  to="/upload"
                  className="p-3 text-[#757682] hover:text-[#00236f] transition-colors shrink-0"
                  title="Upload PDF"
                >
                  <span className="text-lg">📎</span>
                </Link>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your PDF..."
                  className="flex-1 py-3 bg-transparent border-none focus:ring-0 text-sm text-[#191c1e] placeholder:text-[#757682] min-w-0 outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-[#00236f] text-white h-10 w-10 flex items-center justify-center rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed text-lg"
                >
                  ➤
                </button>
              </form>

              <div className="flex justify-center gap-6 mt-3">
                <button
                  onClick={() => setMessages([])}
                  className="text-xs text-[#757682] hover:text-[#00236f] flex items-center gap-1 transition-colors"
                >
                  🕐 Clear History
                </button>
                <button
                  onClick={() => {
                    const text = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
                    const blob = new Blob([text], { type: "text/plain" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "chat-export.txt";
                    a.click();
                  }}
                  className="text-xs text-[#757682] hover:text-[#00236f] flex items-center gap-1 transition-colors"
                >
                  ⬇ Export Chat
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

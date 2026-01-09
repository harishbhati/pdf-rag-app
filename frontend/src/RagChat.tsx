import { useState } from "react";
import { askRag } from "./api/askRag";
import ReactMarkdown from "react-markdown";
type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

export default function RagChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!input.trim()) return;

    const userQuestion = input;

    // 1️⃣ Push user message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userQuestion },
    ]);

    // 2️⃣ Clear input immediately
    setInput("");
    setLoading(true);

    try {
      const res = await askRag(userQuestion);

      // 3️⃣ Push assistant message
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant",
          content: res.answer,
          sources: res.sources 
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
console.log("message", messages)
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-360 bg-white rounded-xl shadow-md p-6">

        <h2 className="text-2xl font-semibold text-center mb-4">
          PDF Question Answering
        </h2>

        {/* Chat Area */}
        <div className="border rounded-lg p-4 h-[calc(100dvh-190px)] overflow-y-auto space-y-3 mb-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg text-sm max-w-[80%]
                  ${
                    msg.role === "user"
                      ? "bg-[#b6887e] text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
              >
                {msg.role === "assistant" ? (
                  <>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                     {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span className="font-semibold">Source:</span>
                        <ul className="list-disc ml-4">
                          {msg.sources.map((src, i) => (
                            <li key={i}>
                              {src.split("/").pop()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                  
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {loading && <p className="text-sm text-gray-500">Thinking...</p>}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the PDF..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-gray-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-[#C42704] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#C42704] transition"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { uploadPdf } from "./api/uploadPdf";

type Status = { type: "success" | "error"; text: string } | null;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PdfUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = (f: File | undefined | null) => {
    setStatus(null);
    if (!f) return;
    if (f.type !== "application/pdf") {
      setStatus({ type: "error", text: "Only PDF files are supported." });
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file || loading) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await uploadPdf(file);
      setStatus({ type: "success", text: `${res.message} — ${res.chunks} chunks indexed.` });
      setFile(null);
    } catch (err) {
      setStatus({ type: "error", text: err instanceof Error ? err.message : "Upload failed." });
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
          <div className="mb-6 px-1">
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 bg-[#00236f] text-white py-3 px-6 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            >
              ← Back to Chat
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 px-1 chat-scroll">
            <p className="text-xs text-[#757682] px-3 mb-2 uppercase tracking-wider">Navigation</p>
            <Link
              to="/"
              className="flex items-center gap-3 text-[#444651] p-3 rounded-lg hover:bg-[#eceef0] transition-all"
            >
              <span className="text-base">💬</span>
              <span className="text-sm font-medium">Chat</span>
            </Link>
            <Link
              to="/upload"
              className="flex items-center gap-3 bg-[#d0e1fb] text-[#00236f] p-3 rounded-lg transition-all"
            >
              <span className="text-base">📄</span>
              <span className="text-sm font-medium">Upload PDF</span>
            </Link>
          </div>

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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#f7f9fb] p-6 md:p-10">
          <div className="max-w-2xl mx-auto">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#00236f] mb-1">Upload PDF</h1>
              <p className="text-sm text-[#444651]">
                Upload a PDF document to index it and start asking questions about its contents.
              </p>
            </div>

            {/* Upload Card */}
            <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm overflow-hidden">
              {/* Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className={`m-6 border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-[#00236f] bg-[#dce1ff]/30"
                    : "border-[#c5c5d3] hover:border-[#00236f] hover:bg-[#f7f9fb]"
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-[#dce1ff] flex items-center justify-center mb-4 text-3xl">
                  📄
                </div>
                <p className="text-sm font-semibold text-[#191c1e] mb-1">
                  Drag &amp; drop your PDF here
                </p>
                <p className="text-xs text-[#757682]">
                  or{" "}
                  <span className="text-[#00236f] font-semibold underline underline-offset-2">
                    click to browse
                  </span>
                </p>
                <p className="text-xs text-[#757682] mt-3">Supports PDF files up to 10 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>

              {/* Selected File Preview */}
              {file && (
                <div className="mx-6 mb-6 flex items-center gap-3 bg-[#f2f4f6] border border-[#e0e3e5] rounded-xl px-4 py-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1e3a8a] flex items-center justify-center shrink-0 text-white text-xs font-bold">
                    PDF
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#191c1e] truncate">{file.name}</p>
                    <p className="text-xs text-[#757682]">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    onClick={() => { setFile(null); setStatus(null); }}
                    className="text-[#757682] hover:text-[#ba1a1a] text-lg leading-none shrink-0 transition-colors"
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Status Message */}
              {status && (
                <div
                  className={`mx-6 mb-6 flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
                    status.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#93000a]"
                  }`}
                >
                  <span className="shrink-0 text-base">
                    {status.type === "success" ? "✅" : "⚠️"}
                  </span>
                  <p>{status.text}</p>
                </div>
              )}

              {/* Actions */}
              <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#00236f] text-white py-3 px-6 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading &amp; Indexing...
                    </>
                  ) : (
                    <>
                      ⬆ Upload &amp; Index
                    </>
                  )}
                </button>
                {status?.type === "success" && (
                  <button
                    onClick={() => navigate("/")}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#d0e1fb] text-[#00236f] py-3 px-6 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                  >
                    💬 Go to Chat →
                  </button>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6">
              <p className="text-xs font-semibold text-[#00236f] uppercase tracking-wider mb-3">
                Tips
              </p>
              <ul className="space-y-2 text-sm text-[#444651]">
                <li className="flex items-start gap-2">
                  <span className="text-[#00236f] shrink-0">•</span>
                  Text-based PDFs work best — scanned images may not extract correctly.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00236f] shrink-0">•</span>
                  You can upload multiple PDFs one at a time and ask questions across all of them.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00236f] shrink-0">•</span>
                  Indexing may take a few seconds depending on the document length.
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

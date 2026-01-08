import { useState } from "react";
import { uploadPdf } from "./api/uploadPdf";

export default function PdfUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setMessage(null);

    try {
      console.log("uploaded file",file);
      const res = await uploadPdf(file);
      setMessage(` ${res.message} (${res.chunks} chunks indexed)`);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="w-full max-w-360 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-2">
          Upload PDF
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="flex-1 text-sm border rounded-lg px-3 py-2 bg-white"
          />

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-[#C42704] text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {message && (
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

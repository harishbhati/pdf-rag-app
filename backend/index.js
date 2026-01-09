// server.js
import dotenv from "dotenv";
dotenv.config();
process.env.TRANSFORMERS_CACHE = "./.cache";
process.env.HF_HOME = "./.cache";
import express from "express";
import cors from "cors";
import { Pinecone } from "@pinecone-database/pinecone";
import { pipeline } from "@xenova/transformers";
import Groq from "groq-sdk";
import { indexTheDocument } from "./ingest.js";
import multer from "multer";
import path from "path";
import fs from "fs"

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Groq (LLM only)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Pinecone
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

// Load embedding model once (FREE)
// 🔹 Load embedding model once
let embedder;
async function loadEmbedder() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedder;
}
// ----------------------------
// Upload File
// ----------------------------
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const originalFileName = req.file.originalname;

    console.log("📥 Uploaded file:", filePath);
    console.log("uploaded file name", originalFileName)

    const ids = await indexTheDocument(filePath, originalFileName);

    res.json({
      success: true,
      message: "PDF indexed successfully",
      chunks: ids.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// Ask Question
// ----------------------------
app.post("/api/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Question is required" });

  try {
    // 1️⃣ Create embedding locally (FREE)

    const embed = await loadEmbedder();
    const embedding = await embed(question, {
      pooling: "mean",
      normalize: true,
    });

    const queryVector = Array.from(embedding.data);

    // 2️⃣ Query Pinecone
    const queryResponse = await index.query({
      vector: queryVector,
      topK: 2,
      includeMetadata: true,
    });
    const context = queryResponse.matches
      .map(m => m.metadata?.text)
      .join("\n");

    // 3️⃣ Ask Groq LLM
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "Answer strictly using the provided context."
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion:\n${question}`
        }
      ],
      temperature: 0.2
    });

    const answer = completion.choices[0].message.content;

    res.json({
      answer,
      sources: [
      ...new Set(
        queryResponse.matches.map(
          (m) => m.metadata?.source
        )
      ),
    ],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0",() => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

/**
 * Implementation
 * stage 1:
 * 1. Load the document - pdf, text - Done
 * 2. Chunk the document - Done
 * 3. Generate vector embeddings - Done
 * 4. Store the vector embeddings - Vector database - Done
 * 
 * Stage 2: Using the chatbot
 * 1. Setup LLM
 * 2. Add retrieva step
 * 3. pass input + relevant information to LLM
**/
import "dotenv/config";
process.env.TRANSFORMERS_CACHE = "./.cache";
process.env.HF_HOME = "./.cache";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone } from "@pinecone-database/pinecone";
import { randomUUID } from "crypto";
import { pipeline } from "@xenova/transformers";

// Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

// Load FREE local embedding model (same as server.js)
// Singleton embedder
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

export const indexTheDocument = async (filePath, originalFileName) => {
  // 1️⃣ Load PDF
  const loader = new PDFLoader(filePath, { splitPages: false });
  const docs = await loader.load();

  if (!docs.length || !docs[0].pageContent) {
    throw new Error("PDF empty");
  }

  console.log("📄 PDF loaded");

  // 2️⃣ Chunk text
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const chunks = await splitter.splitText(docs[0].pageContent);
  console.log("✂️ Total chunks:", chunks.length);

  // 3️⃣ Create vectors
  const embed = await loadEmbedder();
  const vectors = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    // ✅ Create embedding (FREE)
    const embedding = await embed(chunk, {
      pooling: "mean",
      normalize: true,
    });

    vectors.push({
      id: randomUUID(),
      values: Array.from(embedding.data),
      metadata: {
        text: chunk,
        source: originalFileName,
        chunk_index: i,
      },
    });
  }

  console.log("🗄️ Indexing into Pinecone...");

  // 4️⃣ Upsert vectors
  await index.upsert( vectors );

  console.log(`✅ ${vectors.length} chunks indexed successfully`);

  return vectors.map(v => v.id);
};

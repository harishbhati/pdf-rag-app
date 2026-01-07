import { Pinecone } from "@pinecone-database/pinecone";
import "dotenv/config";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

async function deleteAllVectors() {
  await index.deleteAll();
  console.log("✅ All vectors deleted from Pinecone index");
}

deleteAllVectors();
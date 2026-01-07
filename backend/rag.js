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

// RAG logic
//load the document
import {indexTheDocument} from "./ingest.js";
const filePath = '../data/sample_policy.pdf';

indexTheDocument(filePath);
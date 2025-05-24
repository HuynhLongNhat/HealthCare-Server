

const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const path = require("path");
const fs = require("fs");

const {  model, embeddings } = require("../config/llmConfig");
const { PROMPT_TEMPLATES } = require("./promptTemplates");
const { GREETINGS, MEDICAL_KEYWORDS, THANKS_KEYWORDS } = require("../constant/constant");

// const docPath = path.join(__dirname, "../data/trieu_chung_benh_thuong_gap.pdf");
const docPath = path.join(__dirname, "../data/data.pdf");


if (!fs.existsSync(docPath)) {
  console.error("PDF file not found at:", docPath);
  throw new Error("Required PDF file not found");
}



function isGreeting(input) {
  const lower = input.trim().toLowerCase();
  return GREETINGS.some((greet) => lower.startsWith(greet));
}

function isThanks(input) {
  const lower = input.trim().toLowerCase();
  return THANKS_KEYWORDS.some((thanks) => lower.startsWith(thanks));
}


function isMedicalQuestion(question) {
  const lowerQuestion = question.toLowerCase();
  return MEDICAL_KEYWORDS.some((keyword) => lowerQuestion.includes(keyword));
}

let vectorStore;
let isVectorStoreReady = false;

async function initializeVectorStore() {
  try {
    console.log("Starting vector store initialization with Gemini...");

    const loader = new PDFLoader(docPath);
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} documents from PDF`);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`Split into ${splitDocs.length} chunks`);

    vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

    isVectorStoreReady = true;
    console.log("Vector store initialized successfully");
  } catch (err) {
    console.error("Vector store initialization failed:", err);
    throw err;
  }
}

async function getChatResponse(input, context = {}) {
  try {
    if (isGreeting(input)) {
      return formatResponse(
        "Xin chào! Mình là trợ lí AI của HealthCare. Mình có thể giúp gì cho bạn?"
      );
    }
    if (isThanks(input)) {
      return formatResponse(
        "Không có gì đâu nè! Rất vui khi được giúp đỡ bạn."
      );
    }

    if (!isMedicalQuestion(input)) {
      return {
        answer:
          "Xin lỗi, tôi chỉ có thể trả lời các câu hỏi về lĩnh vực y tế, sức khỏe.",
        metadata: {
          isMedical: false,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Gửi thẳng câu hỏi lên mô hình AI để xử lý
    const chatSession = model.startChat({ history: [] });
    const result = await chatSession.sendMessage(input);
    const response = await result.response;
    const text = response.text();
    return {
      answer : text
    };
  } catch (error) {
    console.error("Chat processing error:", error);
    return errorResponse(error);
  }
}

// 8. Hàm hỗ trợ
function formatResponse(text, docs = []) {
  return {
    answer: text,
    metadata: {
      model: "llama3:8b",
      timestamp: new Date().toISOString(),
      isMedical: true,
      sources: docs.map((doc) => ({
        page: doc.metadata?.loc?.pageNumber || "N/A",
        content: doc.pageContent.substring(0, 150) + "...",
      })),
    },
  };
}

function errorResponse(error) {
  if (error.message.includes("ECONNREFUSED")) {
    return {
      answer: "Xin lỗi, dịch vụ AI hiện không khả dụng. Vui lòng thử lại sau.",
      error: "Ollama service unavailable",
    };
  }

  if (error.message.includes("timeout")) {
    return {
      answer:
        "Yêu cầu xử lý quá thời gian chờ. Vui lòng thử lại với câu hỏi ngắn hơn.",
      error: "Request timeout",
    };
  }

  return {
    answer:
      "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
    error: error.message,
  };
}

initializeVectorStore()
  .then(() => console.log("Chat service ready with Gemini Flash"))
  .catch((err) => console.error("Initialization failed:", err));

module.exports = {
  getChatResponse,
  initializeVectorStore,
};

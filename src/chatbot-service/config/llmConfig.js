
// config/llmConfig.js - Cập nhật với Pinecone
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { Pinecone } = require("@pinecone-database/pinecone");
require('dotenv').config();

const GEMINI_API = process.env.GEMINI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || "healthcare";

// Prompt được tối ưu hóa
const SYSTEM_PROMPT = `
Bạn là một hệ thống AI y tế chuyên nghiệp, có nhiệm vụ hỗ trợ người dùng cung cấp thông tin chính xác và hữu ích về các vấn đề sức khỏe. Hãy sử dụng thông tin được cung cấp trong phần CONTEXT để tạo câu trả lời theo **dạng danh sách gạch đầu dòng** theo yêu cầu sau:

1. PHÂN TÍCH THÔNG TIN:
{context}

2. NGUYÊN TẮC TRẢ LỜI:
- Chỉ dựa vào thông tin trong context để trả lời và không đưa ra thông tin gì thêm
- Nếu thiếu dữ liệu, ghi rõ: "Cần thêm thông tin về [phần thiếu]"
- Trả lời theo cấu trúc danh sách rõ ràng

3. LƯU Ý:
- Không bịa đặt nếu không có dữ liệu trong context
`;


// Khởi tạo các service
const genAI = new GoogleGenerativeAI(GEMINI_API);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-05-20",
  generationConfig: {
    temperature: 0.2,
    maxOutputTokens: 2000,
  },
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "text-embedding-004",
  apiKey: GEMINI_API,
});

// Khởi tạo Pinecone
let pinecone = null;
let pineconeStore = null;

if (PINECONE_API_KEY) {
  pinecone = new Pinecone({
    apiKey: PINECONE_API_KEY,
  });
}

module.exports = {
  GEMINI_API,
  SYSTEM_PROMPT,
  model,
  embeddings,
  pinecone,
  pineconeStore,
  PINECONE_INDEX
};

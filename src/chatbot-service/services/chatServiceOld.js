const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const path = require("path");
const fs = require("fs");

const { SYSTEM_PROMPT, model, embeddings } = require("../config/llmConfig");

const docPath = path.join(__dirname, "../data/trieu_chung_benh_thuong_gap.pdf");

if (!fs.existsSync(docPath)) {
  console.error("PDF file not found at:", docPath);
  throw new Error("Required PDF file not found");
}

const GREETINGS = [
  "chào",
  "xin chào",
  "chào bạn",
  "chào anh",
  "chào chị",
  "chào em",
  "chào bác sĩ",
  "chào hệ thống",
  "chào mọi người",
  "chào buổi sáng",
  "chào buổi trưa",
  "chào buổi tối",
  "xin chào bạn",
  "mình chào bạn",
  "rất vui được gặp bạn",
  "hello",
  "hi",
];

const MEDICAL_KEYWORDS = [
  // Triệu chứng
  "đau đầu",
  "đau bụng",
  "sốt",
  "ho",
  "cảm",
  "cúm",
  "mệt mỏi",
  "chóng mặt",
  "buồn nôn",
  "nôn",
  "tiêu chảy",
  "táo bón",
  "dị ứng",
  "phát ban",
  "khó thở",
  "đau ngực",
  "tim đập nhanh",
  "sưng tấy",
  "mất ngủ",
  "tiểu buốt",
  "ra máu",

  // Bệnh lý
  "bệnh",
  "bệnh lý",
  "tiểu đường",
  "huyết áp cao",
  "tim mạch",
  "hen suyễn",
  "viêm phổi",
  "viêm gan",
  "ung thư",
  "HIV",
  "COVID",

  // Khám và chẩn đoán
  "triệu chứng",
  "khám",
  "chẩn đoán",
  "xét nghiệm",
  "siêu âm",
  "nội soi",
  "X-quang",
  "MRI",
  "CT Scan",
  "sinh thiết",

  // Thuốc và điều trị
  "thuốc",
  "điều trị",
  "chữa bệnh",
  "kháng sinh",
  "đơn thuốc",
  "toa thuốc",
  "phẫu thuật",
  "truyền dịch",
  "hóa trị",
  "tiêm chủng",
  "vaccine",
  "phản ứng phụ",
  "chống chỉ định",
  "dược",
  "đông y",
  "tây y",

  // Nhân sự và cơ sở y tế
  "bác sĩ",
  "y tá",
  "y tế",
  "phòng khám",
  "bệnh viện",
  "trung tâm y tế",
  "khoa nội",
  "khoa ngoại",
  "khoa nhi",
  "khoa sản",
  "bác sĩ gia đình",
  "chuyên khoa",
  "chuyên gia",

  // Dịch vụ và thủ tục
  "đặt lịch khám",
  "lấy số thứ tự",
  "tư vấn sức khỏe",
  "giấy khám sức khỏe",
  "giấy nghỉ ốm",
  "chuyển viện",
  "dịch vụ y tế tại nhà",
  "đăng ký khám bệnh",
  "cấp cứu",
  "cấp cứu 115",

  // Bảo hiểm và chi phí
  "bảo hiểm y tế",
  "thẻ BHYT",
  "bảo hiểm tư nhân",
  "viện phí",
  "chi phí khám",
  "hóa đơn bệnh viện",
  "thanh toán",

  // Sức khỏe và phòng ngừa
  "sức khỏe",
  "kiểm tra định kỳ",
  "phòng bệnh",
  "dinh dưỡng",
  "tập thể dục",
  "sức khỏe tinh thần",
  "chăm sóc thai kỳ",
  "vệ sinh cá nhân",
  "lối sống lành mạnh",
];

function isGreeting(input) {
  const lower = input.trim().toLowerCase();
  return GREETINGS.some((greet) => lower.startsWith(greet));
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
        "Xin chào! Tôi là trợ lý AI y tế của HealthCare. Bạn cần tôi hỗ trợ gì?"
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

    if (!isVectorStoreReady) {
      return formatResponse("Hệ thống đang khởi tạo. Vui lòng thử lại sau.");
    }

    // Tìm kiếm tài liệu liên quan
    const relevantDocs = await vectorStore.similaritySearch(input, 3);

    if (relevantDocs.length === 0) {
      return formatResponse("Xin lỗi. Tôi không có thông tin về vấn đề này.");
    }

    const contextText = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

    // Gọi model Gemini
    const chatSession = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT.replace("{context}", contextText) }],
        },
      ],
    });

    const result = await chatSession.sendMessage(input);
    const response = await result.response;
    const text = response.text();

    return formatResponse(text, relevantDocs);
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
      model: "gemini-2.5-flash-preview-05-20",
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

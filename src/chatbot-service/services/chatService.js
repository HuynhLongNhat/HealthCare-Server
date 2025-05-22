const { Ollama } = require('@langchain/community/llms/ollama');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { LLMChain } = require('langchain/chains');
const { BufferMemory } = require('langchain/memory');
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { OllamaEmbeddings } = require('@langchain/community/embeddings/ollama');
const path = require('path');
const fs = require('fs');

// 1. Cấu hình đường dẫn và kiểm tra file
const docPath = path.join(__dirname, '../data/trieu_chung_benh_thuong_gap.pdf');

if (!fs.existsSync(docPath)) {
  console.error('PDF file not found at:', docPath);
  throw new Error('Required PDF file not found');
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
  "hi"    
];

function isGreeting(input) {
  const lower = input.trim().toLowerCase();
  return GREETINGS.some(greet => lower.startsWith(greet));
}

// 2. Danh sách từ khóa y tế để kiểm tra
const MEDICAL_KEYWORDS = [
  // Triệu chứng
  'đau đầu', 'đau bụng', 'sốt', 'ho', 'cảm', 'cúm', 'mệt mỏi',
  'chóng mặt', 'buồn nôn', 'nôn', 'tiêu chảy', 'táo bón', 
  'dị ứng', 'phát ban', 'khó thở', 'đau ngực', 'tim đập nhanh',
  'sưng tấy', 'mất ngủ', 'tiểu buốt', 'ra máu',

  // Bệnh lý
  'bệnh', 'bệnh lý', 'tiểu đường', 'huyết áp cao', 'tim mạch',
  'hen suyễn', 'viêm phổi', 'viêm gan', 'ung thư', 'HIV', 'COVID',

  // Khám và chẩn đoán
  'triệu chứng', 'khám', 'chẩn đoán', 'xét nghiệm', 'siêu âm',
  'nội soi', 'X-quang', 'MRI', 'CT Scan', 'sinh thiết',

  // Thuốc và điều trị
  'thuốc', 'điều trị', 'chữa bệnh', 'kháng sinh', 'đơn thuốc',
  'toa thuốc', 'phẫu thuật', 'truyền dịch', 'hóa trị',
  'tiêm chủng', 'vaccine', 'phản ứng phụ', 'chống chỉ định',
  'dược', 'đông y', 'tây y',

  // Nhân sự và cơ sở y tế
  'bác sĩ', 'y tá', 'y tế', 'phòng khám', 'bệnh viện',
  'trung tâm y tế', 'khoa nội', 'khoa ngoại', 'khoa nhi', 'khoa sản',
  'bác sĩ gia đình', 'chuyên khoa', 'chuyên gia',

  // Dịch vụ và thủ tục
  'đặt lịch khám', 'lấy số thứ tự', 'tư vấn sức khỏe',
  'giấy khám sức khỏe', 'giấy nghỉ ốm', 'chuyển viện',
  'dịch vụ y tế tại nhà', 'đăng ký khám bệnh', 'cấp cứu', 'cấp cứu 115',

  // Bảo hiểm và chi phí
  'bảo hiểm y tế', 'thẻ BHYT', 'bảo hiểm tư nhân',
  'viện phí', 'chi phí khám', 'hóa đơn bệnh viện', 'thanh toán',

  // Sức khỏe và phòng ngừa
  'sức khỏe', 'kiểm tra định kỳ', 'phòng bệnh', 'dinh dưỡng',
  'tập thể dục', 'sức khỏe tinh thần', 'chăm sóc thai kỳ',
  'vệ sinh cá nhân', 'lối sống lành mạnh'
];

// 3. Hàm kiểm tra câu hỏi có thuộc lĩnh vực y tế không
function isMedicalQuestion(question) {
  const lowerQuestion = question.toLowerCase();
  return MEDICAL_KEYWORDS.some(keyword => lowerQuestion.includes(keyword));
}

// 4. Khởi tạo vector store
let vectorStore;
let isVectorStoreReady = false;

async function initializeVectorStore() {
  try {
    console.log('Starting vector store initialization...');
    
    const loader = new PDFLoader(docPath);
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} documents from PDF`);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`Split into ${splitDocs.length} chunks`);

    const embeddings = new OllamaEmbeddings({ 
      model: 'llama3:8b',
      timeout: 60000
    });

    vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings
    );
    
    isVectorStoreReady = true;
    console.log('Vector store initialized successfully');
  } catch (err) {
    console.error('Vector store initialization failed:', err);
    throw err;
  }
}

// 5. Khởi tạo model và memory
const llm = new Ollama({ 
  model: "llama3:8b",
  temperature: 0.01, 
  top_k: 10,
  top_p: 0.1,
  timeout: 120000
});

const memory = new BufferMemory({ 
  memoryKey: "chat_history",
  returnMessages: true,
  inputKey: "input",
});

// 6. Tạo prompt template
// const prompt = ChatPromptTemplate.fromMessages([
//   ["system", `Bạn là trợ lý AI chuyên về y tế cho HealthCare. Chỉ trả lời các câu hỏi liên quan đến sức khỏe, bệnh tật, triệu chứng và điều trị y tế. Nếu câu hỏi không thuộc các lĩnh vực này, hãy từ chối trả lời.

// Thông tin y tế tham khảo:
// {context}

// Câu trả lời phải bằng tiếng Việt và chỉ dựa trên thông tin y tế đáng tin cậy.`],
//   ["placeholder", "{chat_history}"],
//   ["human", "{input}"]
// ]);

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system", 
    `Bạn LÀ MỘT HỆ THỐNG TRẢ LỜI TỰ ĐỘNG CHỈ DỰA TRÊN TÀI LIỆU ĐƯỢC CUNG CẤP.
    
QUY TẮC BẮT BUỘC:
1. CHỈ được trả lời khi THÔNG TIN CÓ TRONG TÀI LIỆU SAU:
{context}

2. Nếu KHÔNG CÓ THÔNG TIN, chỉ được phép trả lời DUY NHẤT:
"Xin lỗi. Tôi không có thông tin về vấn đề này."

3. TUYỆT ĐỐI KHÔNG được bịa đặt, suy diễn hay thêm thông tin ngoài tài liệu.`
  ],
  ["human", "{input}"]
]);

// 7. Tạo chain
const chain = new LLMChain({ 
  llm, 
  prompt, 
  memory,
  inputKey: "input",
  verbose: process.env.NODE_ENV === 'development'
});

async function getChatResponse(input, context = {}) {
  try {
    if (isGreeting(input)) {
      return formatResponse("Xin chào! Tôi là trợ lý AI y tế của HealthCare. Bạn cần tôi hỗ trợ gì?");
    }

    // Kiểm tra câu hỏi y tế
    if (!isMedicalQuestion(input)) {
      return {
        answer: "Xin lỗi, tôi chỉ có thể trả lời các câu hỏi về lĩnh vực y tế, sức khỏe.",
        metadata: {
          isMedical: false,
          timestamp: new Date().toISOString()
        }
      };
    }

    // Kiểm tra vector store
    if (!isVectorStoreReady) {
      return formatResponse("Hệ thống đang khởi tạo. Vui lòng thử lại sau.");
    }

    // Tìm kiếm tài liệu liên quan
    const relevantDocs = await vectorStore.similaritySearch(input, 3);
    
    // Nếu KHÔNG có tài liệu liên quan
    if (relevantDocs.length === 0) {
      return formatResponse("Xin lỗi. Tôi không có thông tin về vấn đề này.");
    }

    // Nếu CÓ tài liệu liên quan
    const contextText = relevantDocs.map(doc => doc.pageContent).join('\n\n');
    const result = await chain.call({
      input,
      context: contextText
    });

    return formatResponse(result.text, relevantDocs);
    
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
      sources: docs.map(doc => ({
        page: doc.metadata?.loc?.pageNumber || 'N/A',
        content: doc.pageContent.substring(0, 150) + '...'
      }))
    }
  };
}

function errorResponse(error) {
  if (error.message.includes('ECONNREFUSED')) {
    return {
      answer: "Xin lỗi, dịch vụ AI hiện không khả dụng. Vui lòng thử lại sau.",
      error: "Ollama service unavailable"
    };
  }

  if (error.message.includes('timeout')) {
    return {
      answer: "Yêu cầu xử lý quá thời gian chờ. Vui lòng thử lại với câu hỏi ngắn hơn.",
      error: "Request timeout"
    };
  }

  return {
    answer: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
    error: error.message
  };
}

// 9. Khởi tạo ngay khi load module
initializeVectorStore()
  .then(() => console.log('Chat service ready'))
  .catch(err => console.error('Chat service initialization failed:', err));

module.exports = { 
  getChatResponse,
  initializeVectorStore
};
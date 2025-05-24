
// Danh sách chào hỏi mở rộng
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

// Từ khóa y tế phân loại theo nhóm
const MEDICAL_KEYWORDS = [

    "đau", "sốt", "ho", "khó thở", "buồn nôn", "nôn", 
    "tiêu chảy", "táo bón", "chóng mặt", "mệt mỏi",
    "phát ban", "sưng", "ngứa", "đau ngực", "đau bụng",
    "mất ngủ", "chán ăn", "sụt cân", "ra máu",
    "bệnh", "viêm", "ung thư", "tiểu đường", "huyết áp",
    "tim mạch", "hen suyễn", "covid", "viêm gan",
    "sỏi thận", "trầm cảm", "lo âu", "zona", "thủy đậu",
    "bác sĩ", "khám", "chuyên khoa", "khoa", 
    "phòng khám", "bệnh viện", "đặt lịch",
    "nội soi", "xét nghiệm", "siêu âm"
];

// Phân tích loại câu hỏi chi tiết hơn
export const detectQuestionType = (question) => {
  const lowerQuestion = question.toLowerCase();
  
  if (/(khám|bác sĩ|chuyên khoa|phòng khám)/i.test(lowerQuestion)) {
    return "DOCTOR_RECOMMENDATION";
  }
  
  if (/(triệu chứng|biểu hiện|dấu hiệu).*(của|bệnh)/i.test(lowerQuestion)) {
    return "SYMPTOM_ANALYSIS";
  }
  
  if (/(bệnh gì|mắc bệnh gì|chẩn đoán).*(triệu chứng|đau)/i.test(lowerQuestion)) {
    return "DISEASE_DIAGNOSIS";
  }
  
  if (/(điều trị|thuốc|chữa|phác đồ)/i.test(lowerQuestion)) {
    return "TREATMENT_INFO";
  }
  
  return "GENERAL_MEDICAL";
};

// Kiểm tra câu chào hỏi
export const isGreeting = (input) => {
  const lower = input.trim().toLowerCase();
  return GREETINGS.some(greet => lower.startsWith(greet));
};

// Kiểm tra câu hỏi y tế với độ chính xác cao hơn
export const isMedicalQuestion =(question) => {
  const lowerQuestion = question.toLowerCase();
  return MEDICAL_KEYWORDS.some((keyword) => lowerQuestion.includes(keyword));
}


// Trích xuất thông tin từ câu hỏi
export const extractMedicalInfo = (question) => {
  // Danh sách các bệnh thường gặp (có thể mở rộng)
  const COMMON_DISEASES = [
    'tăng huyết áp', 'cao huyết áp', 'tiểu đường', 'đái tháo đường',
    'viêm phổi', 'viêm gan', 'suy tim', 'đau dạ dày', 'viêm loét dạ dày',
    'hen suyễn', 'viêm phế quản', 'trào ngược dạ dày', 'sỏi thận'
  ];
  
  // Kiểm tra các bệnh thường gặp trước
  const diseaseMatch = COMMON_DISEASES.find(disease => 
    question.toLowerCase().includes(disease.toLowerCase())
  );
  
  // Nếu không tìm thấy bệnh thường gặp, dùng regex
  const disease = diseaseMatch || question.match(/bệnh\s([a-zÀ-ỹ\s]+)|triệu chứng\s(của|bệnh)\s([a-zÀ-ỹ\s]+)/i)?.[1] || 
                  question.match(/(tăng|cao|viêm|suy|đau)\s([a-zÀ-ỹ\s]+)/i)?.[0];
  
  // Trích xuất triệu chứng với pattern cải tiến
  const symptomsMatch = question.match(/(đau|sốt|ho|khó thở|buồn nôn|nôn|tiêu chảy|táo bón|chóng mặt|mệt mỏi|phát ban|sưng|ngứa|đau ngực|đau bụng|mất ngủ|chán ăn|sụt cân|ra máu|huyết áp|tim đập|chóng mặt|ù tai)+/gi);
  
  return {
    disease: disease ? disease.trim() : null,
    symptoms: symptomsMatch ? [...new Set(symptomsMatch.map(s => s.trim()))] : null
  };
};
// Định dạng câu trả lời chuẩn hóa
export const formatResponse = (response, docs = [], questionType) => {
  const sources = docs.map(doc => ({
    disease: doc.metadata?.disease || 'Không xác định',
    source: doc.metadata?.source || 'Không rõ nguồn',
    confidence: doc.metadata?.confidence || 0
  }));
  
  return {
    answer: response,
    metadata: {
      questionType,
      sources,
      timestamp: new Date().toISOString(),
      hasAnswer: !response.includes("Không có thông tin")
    }
  };
};

// Xử lý lỗi chi tiết hơn
export const errorResponse = (error) => {
  console.error("Error:", error);
  
  const errors = {
    ECONNREFUSED: "Dịch vụ AI hiện không khả dụng. Vui lòng thử lại sau.",
    ETIMEDOUT: "Yêu cầu xử lý quá thời gian chờ. Vui lòng thử lại với câu hỏi ngắn hơn.",
    NO_RESULTS: "Không tìm thấy thông tin phù hợp. Vui lòng mô tả rõ hơn triệu chứng.",
    DEFAULT: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn."
  };
  
  const errorKey = Object.keys(errors).find(key => 
    error.message.includes(key)
  );
  
  return {
    answer: errors[errorKey] || errors.DEFAULT,
    error: true,
    errorDetails: {
      message: error.message,
      code: errorKey || 'UNKNOWN'
    }
  };
};
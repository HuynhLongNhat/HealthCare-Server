// controllers/chatController.js
import chatService from "../services/chatService";

const handleChat = async (req, res) => {
  try {
    const { question } = req.body; 
    const response = await chatService.getChatResponse(question);
    res.json(response);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ 
      error: "Lỗi khi xử lý chatbot",
      answer: "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau."
    });
  }
};

module.exports = { handleChat };
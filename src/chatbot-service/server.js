// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const chatRoutes = require("./routes/chatRoutes");
require('dotenv').config();
// const vectorStoreService = require("./services/vectorStore");
const FRONTEND_URL = process.env.FRONTEND_URL;
const FRONTEND_ROOT_URL = process.env.FRONTEND_ROOT_URL;

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        FRONTEND_ROOT_URL,
       FRONTEND_URL
      ];

      // Cho phép request không có Origin (ví dụ curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// Middleware để xử lý preflight requests
app.options("*", cors());

app.use(bodyParser.json());

// vectorStoreService.initialize()
//   .then(() => console.log("Chat service ready with Gemini Flash"))
//   .catch((err) => console.error("Initialization failed:", err));

app.use("/api/chat", chatRoutes);

const PORT = process.env.CHATBOT_SERVICE_PORT || 8005;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});

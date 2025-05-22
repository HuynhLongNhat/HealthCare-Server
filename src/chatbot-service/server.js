// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  })
);

// Middleware để xử lý preflight requests
app.options("*", cors());

app.use(bodyParser.json());

app.use("/api/chat", chatRoutes);

const PORT = process.env.CHATBOT_SERVICE_PORT || 8005;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});

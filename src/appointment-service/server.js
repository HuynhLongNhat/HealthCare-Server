require("dotenv").config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import appointmentRoutes from "./routes/appointmentRoutes"
import diagnosisRoutes from "./routes/diagnosisRoutes"
import prescriptionsRoutes from "./routes/prescriptionsRoutes";
const app = express();
const APPOINTMENT_SERVICE_PORT = process.env.APPOINTMENT_SERVICE_PORT || 8003;
require('dotenv').config();
const FRONTEND_URL = process.env.FRONTEND_URL;
const FRONTEND_ROOT_URL = process.env.FRONTEND_ROOT_URL;
// Cấu hình CORS mới
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

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware để log requests (để debug)
app.use((req, res, next) => {
  next();
});

// Routes
app.use("/api/appointments", appointmentRoutes);
app.use("/api/appointments", diagnosisRoutes);
app.use("/api/appointments", prescriptionsRoutes);


// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(APPOINTMENT_SERVICE_PORT, () => {
  console.log(`Appointment service is running on port ${APPOINTMENT_SERVICE_PORT}`);
  console.log(
    `Swagger UI available at http://localhost:${APPOINTMENT_SERVICE_PORT}/api-docs`
  );
});

export default app;

require("dotenv").config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import doctorRoutes from "./routes/doctorRoutes";
require('dotenv').config();
const app = express();
const DOCTOR_SERVICE_PORT = process.env.DOCTOR_SERVICE_PORT || 8002;
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
app.use("/api/doctors", doctorRoutes);

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
app.listen(DOCTOR_SERVICE_PORT, () => {
  console.log(`Doctor service is running on port ${DOCTOR_SERVICE_PORT}`);
  console.log(
    `Swagger UI available at http://localhost:${DOCTOR_SERVICE_PORT}/api-docs`
  );
});

export default app;

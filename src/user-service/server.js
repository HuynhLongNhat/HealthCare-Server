require("dotenv").config();
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import passport from "passport";
import session from "express-session";
require("./config/passport"); 
require('dotenv').config();
const app = express();
const USER_SERVICE_PORT = process.env.USER_SERVICE_PORT  || 8001;

const FRONTEND_URL = process.env.FRONTEND_URL;
const FRONTEND_ROOT_URL = process.env.FRONTEND_ROOT_URL;
// Cấu hình CORS
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        FRONTEND_ROOT_URL,
       FRONTEND_URL,
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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Middleware để log requests (để debug)
app.use((req, res, next) => {
  next();
});

// Routes
app.use("/api/users", userRoutes); // Route cho user service
app.use("/api/auth", authRoutes); // Route cho auth service

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
app.listen(USER_SERVICE_PORT, () => {
  console.log(`User service is running on port ${USER_SERVICE_PORT}`);
  console.log(
    `Swagger UI available at http://localhost:${USER_SERVICE_PORT}/api-docs`
  );
});

export default app;
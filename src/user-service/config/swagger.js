import swaggerJsdoc from "swagger-jsdoc";
require('dotenv').config();
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Service API",
      version: "1.0.0",
      description: "API documentation for User Service",
    },
    servers: [
      {
        url: `${process.env.FRONTEND_URL}`,
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/user-service/routes/*.js"],
};

export const specs = swaggerJsdoc(options);

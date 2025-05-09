import swaggerJsdoc from "swagger-jsdoc";

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
        url: `http://localhost:${process.env.USER_SERVICE_PORT || 8001}`,
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

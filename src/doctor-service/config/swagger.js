import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Doctor Service API",
      version: "1.0.0",
      description: "API documentation for Doctor Service",
    },
    servers: [
      {
        url: `http://localhost:${process.env.DOCTOR_SERVICE_PORT || 8002}`,
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
  apis: ["./src/doctor-service/routes/*.js"],
};

export const specs = swaggerJsdoc(options);

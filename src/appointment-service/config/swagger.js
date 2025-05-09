import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Appointment Service API",
      version: "1.0.0",
      description: "API documentation for appointment Service",
    },
    servers: [
      {
        url: `http://localhost:${process.env.APPOINTMENT_SERVICE_PORT || 8003}`,
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
  apis: ["./src/appointment-service/routes/*.js"],
};

export const specs = swaggerJsdoc(options);

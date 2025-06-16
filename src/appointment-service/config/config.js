require("dotenv").config(); // Load biến môi trường từ .env

module.exports = {
  development: {
    username: process.env.APPOINTMENTSERVICE_ROOT_DB_USERNAME,
    password: process.env.APPOINTMENTSERVICE_ROOT_DB_PASSWORD,
    database: process.env.APPOINTMENTSERVICE_ROOT_DB_NAME,
    host: process.env.APPOINTMENTSERVICE_ROOT_DB_HOST,
    port: process.env.APPOINTMENTSERVICE_ROOT_DB_PORT,
    dialect: "mysql",
    logging: false,
  },
  test: {
    username: process.env.APPOINTMENTSERVICE_DB_USERNAME,
    password: process.env.APPOINTMENTSERVICE_DB_PASSWORD,
    database: process.env.APPOINTMENTSERVICE_DB_NAME,
    host: process.env.APPOINTMENTSERVICE_DB_HOST,
    port: process.env.APPOINTMENTSERVICE_DB_PORT,
    dialect: "mysql",
    logging: false,
  },
  production: {
    username: process.env.APPOINTMENTSERVICE_DB_USERNAME,
    password: process.env.APPOINTMENTSERVICE_DB_PASSWORD,
    database: process.env.APPOINTMENTSERVICE_DB_NAME,
    host: process.env.APPOINTMENTSERVICE_DB_HOST,
    port: process.env.APPOINTMENTSERVICE_DB_PORT,
    dialect: "mysql",
    logging: false,
  },
};

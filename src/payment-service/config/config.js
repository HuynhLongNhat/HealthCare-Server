require("dotenv").config(); // Load biến môi trường từ .env

module.exports = {
  development: {
    username: process.env.PAYMENTSERVICE_ROOT_DB_USERNAME,
    password: process.env.PAYMENTSERVICE_ROOT_DB_PASSWORD,
    database: process.env.PAYMENTSERVICE_ROOT_DB_NAME,
    host: process.env.PAYMENTSERVICE_ROOT_DB_HOST,
    port: process.env.PAYMENTSERVICE_ROOT_DB_PORT,
    dialect: "mysql",
    logging: false,
  },
  test: {
    username: process.env.PAYMENTSERVICE_DB_USERNAME,
    password: process.env.PAYMENTSERVICE_DB_PASSWORD,
    database: process.env.PAYMENTSERVICE_DB_NAME,
    host: process.env.PAYMENTSERVICE_DB_HOST,
    port: process.env.PAYMENTSERVICE_DB_PORT,
    dialect: "mysql",
    logging: false,
  },
  production: {
    username: process.env.PAYMENTSERVICE_DB_USERNAME,
    password: process.env.PAYMENTSERVICE_DB_PASSWORD,
    database: process.env.PAYMENTSERVICE_DB_NAME,
    host: process.env.PAYMENTSERVICE_DB_HOST,
    port: process.env.PAYMENTSERVICE_DB_PORT,
    dialect: "mysql",
    logging: false,
  },
};

require("dotenv").config(); // Load biến môi trường từ .env

module.exports = {
  development: {
    username: process.env.DOCTORSERVICE_ROOT_DB_USERNAME,
    password: process.env.DOCTORSERVICE_ROOT_DB_PASSWORD,
    database: process.env.DOCTORSERVICE_ROOT_DB_NAME,
    host: process.env.DOCTORSERVICE_ROOT_DB_HOST,
    port: process.env.DOCTORSERVICE_ROOT_DB_PORT,
    dialect: "mysql",
    logging: false,
  },
  test: {
    username: process.env.DOCTORSERVICE_DB_USERNAME,
    password: process.env.DOCTORSERVICE_DB_PASSWORD,
    database: process.env.DOCTORSERVICE_DB_NAME,
    host: process.env.DOCTORSERVICE_DB_HOST,
    port: process.env.DOCTORSERVICE_DB_PORT,
    dialect: "mysql",
    logging: false,
  },
  production: {
    username: process.env.DOCTORSERVICE_DB_USERNAME,
    password: process.env.DOCTORSERVICE_DB_PASSWORD,
    database: process.env.DOCTORSERVICE_DB_NAME,
    host: process.env.DOCTORSERVICE_DB_HOST,
    port: process.env.DOCTORSERVICE_DB_PORT,
    dialect: "mysql",
    logging: false,
  },
};

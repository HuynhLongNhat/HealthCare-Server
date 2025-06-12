require('dotenv').config(); // Load biến môi trường từ .env

module.exports = {
  development: {
    username: process.env.APPOINTMENTSERVICE_DB_USERNAME,
    password: process.env.APPOINTMENTSERVICE_DB_PASSWORD,
    database: process.env.APPOINTMENTSERVICE_DB_NAME,
    host: process.env.APPOINTMENTSERVICE_DB_HOST,
    port: process.env.APPOINTMENTSERVICE_DB_PORT,
    dialect: 'mysql',
    logging: false
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql"
  }
};

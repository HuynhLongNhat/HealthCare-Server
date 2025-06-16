require('dotenv').config(); // Load biến môi trường từ .env

module.exports = {
  development: {
    username: process.env.USERSERVICE_ROOT_DB_USERNAME,
    password: process.env.USERSERVICE_ROOT_DB_PASSWORD,
    database: process.env.USERSERVICE_ROOT_DB_NAME,
    host: process.env.USERSERVICE_ROOT_DB_HOST,
    port: process.env.USERSERVICE_ROOT_DB_PORT,
    dialect: 'mysql',
    logging: false
  },
  test: {
    username: process.env.USERSERVICE_DB_USERNAME,
    password: process.env.USERSERVICE_DB_PASSWORD,
    database: process.env.USERSERVICE_DB_NAME,
    host: process.env.USERSERVICE_DB_HOST,
    port: process.env.USERSERVICE_DB_PORT,
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: process.env.USERSERVICE_DB_USERNAME,
    password: process.env.USERSERVICE_DB_PASSWORD,
    database: process.env.USERSERVICE_DB_NAME,
    host: process.env.USERSERVICE_DB_HOST,
    port: process.env.USERSERVICE_DB_PORT,
    dialect: 'mysql',
    logging: false
  }
};

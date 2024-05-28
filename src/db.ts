import dotenv from 'dotenv';
dotenv.config();
import mysql, { PoolOptions } from 'mysql2';

/**
 * Параметры для подключения
 */
const access: PoolOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  rowsAsArray: false,
  multipleStatements: true
};

// создаем connection pool
const connection = mysql.createPool(access);
// делаем обертку с промисами
const promisePool = connection.promise();

/**
 * Метод для отправки запросов в базу
 * @param {string} text - sql запрос для выполнения
 * @param {Array} params - массив параметров
 */
const sendQuery = (text: string, params: []) => promisePool.query(text, params);

export default sendQuery;

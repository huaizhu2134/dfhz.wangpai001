import mysql from "mysql2/promise";
import { loadConfig } from "./config.js";

const config = loadConfig(process.env);

// Singleton Pool
let pool = null;

export function getDb() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
      namedPlaceholders: true 
    });
  }
  return pool;
}

// Helper for single query
export async function query(sql, params) {
  const db = getDb();
  return db.execute(sql, params);
}

export async function transaction(callback) {
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

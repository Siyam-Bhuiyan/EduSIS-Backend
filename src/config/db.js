// src/config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

let pool;
export async function initDB() {
  if (pool) return pool;
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  // create DB if not exists
  await pool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
  await pool.query(`USE \`${process.env.DB_NAME}\`;`);

  // create tables if not exist (no demo rows)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role ENUM('admin','teacher','student') NOT NULL DEFAULT 'student',
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(120) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

    // Student profiles (1:1 with users of role 'student')
  await pool.query(`
    CREATE TABLE IF NOT EXISTS student_profiles (
      user_id INT PRIMARY KEY,
      reg_no VARCHAR(50) UNIQUE,
      phone VARCHAR(30),
      dob DATE,
      department VARCHAR(120),
      batch VARCHAR(60),
      address VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_sp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);


  return pool;
}

export function getPool() {
  if (!pool) throw new Error("DB not initialized. Call initDB() first.");
  return pool;
}

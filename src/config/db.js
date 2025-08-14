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

    // Teacher profiles (1:1 with users of role 'teacher')
  await pool.query(`
    CREATE TABLE IF NOT EXISTS teacher_profiles (
      user_id INT PRIMARY KEY,
      employee_no VARCHAR(50) UNIQUE,
      phone VARCHAR(30),
      dob DATE,
      department VARCHAR(120),
      designation VARCHAR(120),
      bio VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_tp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);


    // Departments
  await pool.query(`
    CREATE TABLE IF NOT EXISTS departments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL UNIQUE,
      code VARCHAR(20) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Courses
  await pool.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      department_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      code VARCHAR(30) NOT NULL UNIQUE,
      credit DECIMAL(3,1) NOT NULL DEFAULT 3.0,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_courses_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Course ↔ Teachers (many-to-many)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS course_teachers (
      course_id INT NOT NULL,
      teacher_id INT NOT NULL,
      PRIMARY KEY (course_id, teacher_id),
      CONSTRAINT fk_ct_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      CONSTRAINT fk_ct_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT chk_ct_teacher_role CHECK (teacher_id IN (SELECT id FROM users WHERE role='teacher'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Enrollments (student ↔ course)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      course_id INT NOT NULL,
      student_id INT NOT NULL,
      status ENUM('enrolled','dropped') NOT NULL DEFAULT 'enrolled',
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (course_id, student_id),
      CONSTRAINT fk_en_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      CONSTRAINT fk_en_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT chk_en_student_role CHECK (student_id IN (SELECT id FROM users WHERE role='student'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);




  return pool;
}

export function getPool() {
  if (!pool) throw new Error("DB not initialized. Call initDB() first.");
  return pool;
}

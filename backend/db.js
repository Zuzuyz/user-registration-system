const mysql = require("mysql2/promise");

const databaseName =
  process.env.DB_NAME ||
  process.env.MYSQLDATABASE ||
  process.env.MYSQL_DATABASE ||
  "shubham_shreyasi_project";
const baseConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  user: process.env.DB_USER || process.env.MYSQLUSER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || ""
};

const isLocalDatabaseHost = new Set(["127.0.0.1", "localhost"]).has(baseConfig.host);
const shouldCreateDatabase = process.env.AUTO_CREATE_DATABASE === "true" || isLocalDatabaseHost;

const db = mysql.createPool({
  ...baseConfig,
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 10
});

async function initializeDatabase() {
  const connection = await mysql.createConnection(
    shouldCreateDatabase ? baseConfig : { ...baseConfig, database: databaseName }
  );

  try {
    if (shouldCreateDatabase) {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
      await connection.query(`USE \`${databaseName}\``);
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        dob DATE NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'rescue',
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [columns] = await connection.query(
      `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = 'users'
          AND COLUMN_NAME = 'role'
      `,
      [databaseName]
    );

    if (!columns.length) {
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'rescue'
      `);
    }

    await connection.query(
      `
        INSERT INTO users (username, email, dob, role, password)
        VALUES
          (?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          username = VALUES(username),
          dob = VALUES(dob),
          role = VALUES(role),
          password = VALUES(password)
      `,
      [
        "Shubham",
        "shubham@gmail.com",
        "2003-11-21",
        "admin",
        "123456",
        "Shreyasi",
        "shreyasi@gmail.com",
        "2004-02-02",
        "ngo",
        "123456",
        "Aarav Nair",
        "aarav.nair@rescuenexus.in",
        "1998-06-14",
        "rescue",
        "123456"
      ]
    );

    console.log("Connected to MySQL");
  } finally {
    await connection.end();
  }
}

module.exports = { db, initializeDatabase };

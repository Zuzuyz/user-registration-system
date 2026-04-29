const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
const databaseName =
  process.env.PGDATABASE ||
  process.env.POSTGRES_DB ||
  "user_registration_system";

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    }
  : {
      host: process.env.PGHOST || process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
      user: process.env.PGUSER || process.env.DB_USER || "postgres",
      password: process.env.PGPASSWORD || process.env.DB_PASSWORD || "",
      database: databaseName,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    };

const db = new Pool(poolConfig);

async function initializeDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      dob DATE NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'rescue',
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(
    `
      INSERT INTO users (username, email, dob, role, password)
      VALUES
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10),
        ($11, $12, $13, $14, $15)
      ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        dob = EXCLUDED.dob,
        role = EXCLUDED.role,
        password = EXCLUDED.password
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

  console.log("Connected to Postgres");
}

module.exports = { db, initializeDatabase };

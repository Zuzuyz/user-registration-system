const { db, ensureDatabaseReady } = require("./_lib/db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, email, dob, password, role } = req.body || {};

  if (!username || !email || !dob || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await ensureDatabaseReady();

    await db.query(
      "INSERT INTO users (username, email, dob, role, password) VALUES (?, ?, ?, ?, ?)",
      [username, email, dob, role || "rescue", password]
    );

    return res.status(201).json({ message: "Registered successfully" });
  } catch (error) {
    console.error("Failed to register user:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already registered" });
    }

    return res.status(500).json({ message: "Registration failed" });
  }
};

const { db, ensureDatabaseReady } = require("./_lib/db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password, role } = req.body || {};

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, password, and role are required" });
  }

  try {
    await ensureDatabaseReady();

    const { rows } = await db.query(
      "SELECT id, username, email, role FROM users WHERE email = $1 AND password = $2 LIMIT 1",
      [email, password]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    if (user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as ${user.role}. Please switch to the matching role to continue.`
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user
    });
  } catch (error) {
    console.error("Failed to login user:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

const { db, ensureDatabaseReady } = require("./_lib/db");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await ensureDatabaseReady();

    const { rows: users } = await db.query(
      "SELECT id, username, email FROM users ORDER BY id DESC"
    );

    return res.status(200).json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return res.status(500).json({ message: "Could not fetch users" });
  }
};

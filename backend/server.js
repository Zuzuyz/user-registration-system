const express = require("express");
const cors = require("cors");
const path = require("path");
const { db, initializeDatabase } = require("./db");

const app = express();
const frontendPath = path.join(__dirname, "..", "frontend");
const port = Number(process.env.PORT) || 5050;

app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/api/users", async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, username, email FROM users ORDER BY id DESC"
        );

        return res.json(users);
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return res.status(500).json({ message: "Could not fetch users" });
    }
});

app.post("/api/register", async (req, res) => {
    const { username, email, dob, password, role } = req.body;

    if (!username || !email || !dob || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
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
});

app.post("/api/login", async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: "Email, password, and role are required" });
    }

    try {
        const [rows] = await db.query(
            "SELECT id, username, email, role FROM users WHERE email = ? AND password = ? LIMIT 1",
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

        return res.json({
            message: "Login successful",
            user
        });
    } catch (error) {
        console.error("Failed to login user:", error);
        return res.status(500).json({ message: "Login failed" });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

async function startServer() {
    try {
        await initializeDatabase();

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error("Could not start the server:", error);
        process.exit(1);
    }
}

startServer();

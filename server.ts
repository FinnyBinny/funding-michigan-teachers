import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    location TEXT,
    type TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    tier TEXT NOT NULL,
    message TEXT,
    pos_x REAL DEFAULT 0,
    pos_y REAL DEFAULT 0,
    date TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_name TEXT NOT NULL,
    school_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    goal REAL NOT NULL,
    raised REAL DEFAULT 0,
    votes INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    bio TEXT NOT NULL,
    impact TEXT NOT NULL,
    school TEXT NOT NULL,
    location TEXT NOT NULL,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    impact TEXT NOT NULL,
    amount TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    students TEXT,
    low_income TEXT,
    diversity TEXT,
    projects TEXT
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    date TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS newsletter_signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    date TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Ensure pos_x and pos_y exist in donors table
try {
  const tableInfo = db.prepare("PRAGMA table_info(donors)").all() as any[];
  const hasPosX = tableInfo.some(col => col.name === 'pos_x');
  const hasPosY = tableInfo.some(col => col.name === 'pos_y');

  if (!hasPosX) {
    db.exec("ALTER TABLE donors ADD COLUMN pos_x REAL DEFAULT 0");
    console.log("Added pos_x column to donors table");
  }
  if (!hasPosY) {
    db.exec("ALTER TABLE donors ADD COLUMN pos_y REAL DEFAULT 0");
    console.log("Added pos_y column to donors table");
  }
} catch (error) {
  console.error("Migration error:", error);
}

// Seed initial data if empty
const eventCount = db.prepare("SELECT COUNT(*) as count FROM events").get() as { count: number };
if (eventCount.count === 0) {
  // No initial mock data for production
}

const donorCount = db.prepare("SELECT COUNT(*) as count FROM donors").get() as { count: number };
if (donorCount.count === 0) {
  // No initial mock data for production
}

const projectCount = db.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number };
if (projectCount.count === 0) {
  // No initial mock data for production
}

const locationCount = db.prepare("SELECT COUNT(*) as count FROM locations").get() as { count: number };
if (locationCount.count === 0) {
  // No initial mock data for production
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/events", (req, res) => {
    const events = db.prepare("SELECT * FROM events ORDER BY date ASC").all();
    res.json(events);
  });

  app.post("/api/events", (req, res) => {
    const { title, date, description, location, type } = req.body;
    const result = db.prepare("INSERT INTO events (title, date, description, location, type) VALUES (?, ?, ?, ?, ?)").run(title, date, description, location, type);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/events/:id", (req, res) => {
    const { title, date, description, location, type } = req.body;
    db.prepare("UPDATE events SET title = ?, date = ?, description = ?, location = ?, type = ? WHERE id = ?").run(title, date, description, location, type, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/events/:id", (req, res) => {
    db.prepare("DELETE FROM events WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/donors", (req, res) => {
    const donors = db.prepare("SELECT * FROM donors ORDER BY date DESC").all();
    res.json(donors);
  });

  app.post("/api/donors", (req, res) => {
    const { name, amount, tier, message } = req.body;
    const result = db.prepare("INSERT INTO donors (name, amount, tier, message) VALUES (?, ?, ?, ?)").run(name, amount, tier, message);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/donors/:id", (req, res) => {
    const { name, amount, tier, message, pos_x, pos_y } = req.body;
    db.prepare("UPDATE donors SET name = ?, amount = ?, tier = ?, message = ?, pos_x = ?, pos_y = ? WHERE id = ?").run(name, amount, tier, message, pos_x, pos_y, req.params.id);
    res.json({ success: true });
  });

  app.put("/api/donors/positions", (req, res) => {
    const { positions } = req.body; // Array of { id, pos_x, pos_y }
    const update = db.prepare("UPDATE donors SET pos_x = ?, pos_y = ? WHERE id = ?");
    const transaction = db.transaction((items) => {
      for (const item of items) {
        update.run(item.pos_x, item.pos_y, item.id);
      }
    });
    transaction(positions);
    res.json({ success: true });
  });

  app.delete("/api/donors/:id", (req, res) => {
    db.prepare("DELETE FROM donors WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects").all();
    res.json(projects);
  });

  app.post("/api/projects", (req, res) => {
    const { teacher_name, school_name, title, description, goal } = req.body;
    const result = db.prepare("INSERT INTO projects (teacher_name, school_name, title, description, goal) VALUES (?, ?, ?, ?, ?)").run(teacher_name, school_name, title, description, goal);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/projects/:id", (req, res) => {
    const { teacher_name, school_name, title, description, goal } = req.body;
    db.prepare("UPDATE projects SET teacher_name = ?, school_name = ?, title = ?, description = ?, goal = ? WHERE id = ?").run(teacher_name, school_name, title, description, goal, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/projects/:id", (req, res) => {
    db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/projects/:id/vote", (req, res) => {
    db.prepare("UPDATE projects SET votes = votes + 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/projects/:id/donate", (req, res) => {
    const { amount } = req.body;
    db.prepare("UPDATE projects SET raised = raised + ? WHERE id = ?").run(amount, req.params.id);
    
    // Also add to donors wall as anonymous
    db.prepare("INSERT INTO donors (name, amount, tier, message) VALUES (?, ?, ?, ?)").run(
      "Anonymous Supporter", amount, "Pencil Pal", "Donated to a classroom project!"
    );
    
    res.json({ success: true });
  });

  app.get("/api/stories", (req, res) => {
    const stories = db.prepare("SELECT * FROM stories").all();
    res.json(stories);
  });

  app.get("/api/leaderboard", (req, res) => {
    const leaderboard = db.prepare(`
      SELECT 
        teacher_name, 
        school_name, 
        COUNT(*) as project_count, 
        SUM(votes) as total_votes, 
        SUM(raised) as total_raised
      FROM projects 
      GROUP BY teacher_name, school_name 
      ORDER BY total_votes DESC, project_count DESC
      LIMIT 10
    `).all();
    res.json(leaderboard);
  });

  app.post("/api/stories", (req, res) => {
    const { name, bio, impact, school, location, image } = req.body;
    const result = db.prepare("INSERT INTO stories (name, bio, impact, school, location, image) VALUES (?, ?, ?, ?, ?, ?)").run(name, bio, impact, school, location, image);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/stories/:id", (req, res) => {
    const { name, bio, impact, school, location, image } = req.body;
    db.prepare("UPDATE stories SET name = ?, bio = ?, impact = ?, school = ?, location = ?, image = ? WHERE id = ?").run(name, bio, impact, school, location, image, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/stories/:id", (req, res) => {
    db.prepare("DELETE FROM stories WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/locations", (req, res) => {
    const locations = db.prepare("SELECT * FROM locations").all();
    res.json(locations);
  });

  app.post("/api/locations", (req, res) => {
    const { name, district, impact, amount, lat, lng, students, low_income, diversity, projects } = req.body;
    const result = db.prepare("INSERT INTO locations (name, district, impact, amount, lat, lng, students, low_income, diversity, projects) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(name, district, impact, amount, lat, lng, students, low_income, diversity, projects);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/locations/:id", (req, res) => {
    const { name, district, impact, amount, lat, lng, students, low_income, diversity, projects } = req.body;
    db.prepare("UPDATE locations SET name = ?, district = ?, impact = ?, amount = ?, lat = ?, lng = ?, students = ?, low_income = ?, diversity = ?, projects = ? WHERE id = ?").run(name, district, impact, amount, lat, lng, students, low_income, diversity, projects, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/locations/:id", (req, res) => {
    db.prepare("DELETE FROM locations WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;
    try {
      db.prepare("INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)").run(name, email, message);
      console.log("Contact form submission saved:", { name, email, message });
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving contact:", error);
      res.status(500).json({ error: "Failed to save contact" });
    }
  });

  app.post("/api/newsletter", (req, res) => {
    const { email } = req.body;
    try {
      db.prepare("INSERT INTO newsletter_signups (email) VALUES (?)").run(email);
      console.log("Newsletter signup saved:", email);
      res.json({ success: true });
    } catch (error) {
      if ((error as any).code === 'SQLITE_CONSTRAINT') {
        return res.json({ success: true, message: "Already signed up" });
      }
      console.error("Error saving newsletter signup:", error);
      res.status(500).json({ error: "Failed to save newsletter signup" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

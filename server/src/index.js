import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./db.js";
import { authRouter, requireAuth } from "./auth.js";
import { searchFoods } from "./usda.js";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing. Copy .env.example to .env first.");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);

// Everything below this line requires a logged-in user.
app.use("/api", requireAuth);

app.get("/api/foods/search", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (q.length < 2) return res.json([]);
  try {
    res.json(await searchFoods(q));
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Could not reach the nutrition database. Try again in a moment." });
  }
});

const MEALS = ["breakfast", "lunch", "dinner", "snack"];
const NUTRIENTS = ["calories", "protein", "carbs", "fat", "fiber", "sodium"];
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const validServings = (n) => Number.isFinite(n) && n > 0 && n <= 100;

// GET /api/logs?date=2026-10-11 -> that day's entries plus calculated totals.
app.get("/api/logs", async (req, res) => {
  const date = String(req.query.date ?? "");
  if (!isDate(date)) return res.status(400).json({ error: "date must look like YYYY-MM-DD." });

  const entries = await prisma.foodLog.findMany({
    where: { userId: req.userId, date },
    orderBy: { createdAt: "asc" },
  });
  const totals = Object.fromEntries(NUTRIENTS.map((n) => [n, 0]));
  for (const e of entries) for (const n of NUTRIENTS) totals[n] += e[n] * e.servings;
  res.json({ date, entries, totals });
});

app.post("/api/logs", async (req, res) => {
  const b = req.body ?? {};
  const servings = Number(b.servings ?? 1);
  if (!isDate(String(b.date))) return res.status(400).json({ error: "date must look like YYYY-MM-DD." });
  if (!MEALS.includes(b.meal)) return res.status(400).json({ error: `meal must be one of: ${MEALS.join(", ")}.` });
  if (!b.name || !Number.isInteger(b.fdcId)) return res.status(400).json({ error: "Pick a food from the search results." });
  if (!validServings(servings)) return res.status(400).json({ error: "Servings must be between 0 and 100." });

  const nutrients = Object.fromEntries(NUTRIENTS.map((n) => [n, Math.max(0, Number(b[n]) || 0)]));
  const entry = await prisma.foodLog.create({
    data: { userId: req.userId, date: b.date, meal: b.meal, fdcId: b.fdcId, name: String(b.name), servings, ...nutrients },
  });
  res.status(201).json(entry);
});

// Looks up a log entry, but only if it belongs to the logged-in user.
async function findOwnEntry(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return null;
  return prisma.foodLog.findFirst({ where: { id, userId: req.userId } });
}

app.patch("/api/logs/:id", async (req, res) => {
  const servings = Number(req.body?.servings);
  if (!validServings(servings)) return res.status(400).json({ error: "Servings must be between 0 and 100." });
  const entry = await findOwnEntry(req);
  if (!entry) return res.status(404).json({ error: "Entry not found." });
  res.json(await prisma.foodLog.update({ where: { id: entry.id }, data: { servings } }));
});

app.delete("/api/logs/:id", async (req, res) => {
  const entry = await findOwnEntry(req);
  if (!entry) return res.status(404).json({ error: "Entry not found." });
  await prisma.foodLog.delete({ where: { id: entry.id } });
  res.status(204).end();
});

// Last-resort handler so an unexpected error returns JSON instead of crashing.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));

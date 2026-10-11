// Account creation, login, and the middleware that protects the other routes.
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./db.js";

const SECRET = process.env.JWT_SECRET;
const signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, SECRET, { expiresIn: "7d" });

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "An account with that email already exists." });

  // Never store the password itself, only a salted hash of it.
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash } });
  res.status(201).json({ token: signToken(user), user: { id: user.id, email: user.email } });
});

authRouter.post("/login", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  // Same message for "no such user" and "wrong password" so we don't leak which emails exist.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }
  res.json({ token: signToken(user), user: { id: user.id, email: user.email } });
});

// Middleware: requires "Authorization: Bearer <token>" and sets req.userId.
export function requireAuth(req, res, next) {
  const token = (req.headers.authorization ?? "").replace(/^Bearer /, "");
  try {
    req.userId = Number(jwt.verify(token, SECRET).sub);
    next();
  } catch {
    res.status(401).json({ error: "Please log in again." });
  }
}

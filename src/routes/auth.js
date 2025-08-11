import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();
const router = Router();
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, company, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already in use" });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hash, name, company, role } });
    res.json({ id: user.id, email: user.email });
  } catch (e) { console.error(e); res.status(500).json({ error: "Registration failed" }) }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || "devsecret", { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (e) { console.error(e); res.status(500).json({ error: "Login failed" }) }
});
export default router;

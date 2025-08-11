import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "./_authMiddleware.js";
const prisma = new PrismaClient();
const router = Router();
router.use(auth);
router.post("/activities", async (req, res) => {
  const { projectId, items } = req.body;
  const created = await prisma.$transaction(items.map(it => prisma.activity.create({ data: { projectId, name: it.name, amount: it.amount } })));
  res.json(created);
});
router.patch("/activities/:id/complete", async (req, res) => {
  const { id } = req.params;
  const activity = await prisma.activity.update({ where: { id }, data: { completed: true, completedAt: new Date() } });
  res.json(activity);
});
router.get("/project/:projectId/option-a/summary", async (req, res) => {
  const { projectId } = req.params;
  const activities = await prisma.activity.findMany({ where: { projectId } });
  const total = activities.reduce((s,a)=>s+a.amount,0);
  const completed = activities.filter(a=>a.completed).reduce((s,a)=>s+a.amount,0);
  res.json({ totalSchedule: total, completedValue: completed, remaining: total - completed });
});
router.post("/cost-entry", async (req, res) => {
  const { projectId, description, amount, entryDate } = req.body;
  const entry = await prisma.costEntry.create({ data: { projectId, description, amount, entryDate: new Date(entryDate) } });
  res.json(entry);
});
router.get("/project/:projectId/costs", async (req, res) => {
  const { projectId } = req.params;
  const entries = await prisma.costEntry.findMany({ where: { projectId }, orderBy: { entryDate: "asc" } });
  const total = entries.reduce((s,e)=>s+e.amount,0);
  res.json({ entries, total });
});
export default router;

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "./_authMiddleware.js";
const prisma = new PrismaClient();
const router = Router();
router.use(auth);
router.get("/", async (req, res) => {
  const projects = await prisma.project.findMany({ where: { ownerId: req.user.sub }, orderBy: { createdAt: "desc" } });
  res.json(projects);
});
router.post("/", async (req, res) => {
  const { name, clientName, contractType, mainOption, startDate, endDate } = req.body;
  const project = await prisma.project.create({ data: { name, clientName, contractType, mainOption, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, ownerId: req.user.sub } });
  res.json(project);
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const project = await prisma.project.findFirst({ where: { id, ownerId: req.user.sub }, include: { earlyWarnings: true, compensationEvents: true, activities: true, costEntries: true } });
  if (!project) return res.status(404).json({ error: "Not found" });
  res.json(project);
});
export default router;

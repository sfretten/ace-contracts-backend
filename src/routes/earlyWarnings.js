import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "./_authMiddleware.js";
const prisma = new PrismaClient();
const router = Router();
router.use(auth);
router.post("/", async (req, res) => {
  const { projectId, title, description, dueMeeting } = req.body;
  const ew = await prisma.earlyWarning.create({ data: { projectId, title, description, createdBy: req.user.sub, dueMeeting: dueMeeting ? new Date(dueMeeting) : null } });
  res.json(ew);
});
router.get("/project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const list = await prisma.earlyWarning.findMany({ where: { projectId }, orderBy: { createdAt: "desc" } });
  res.json(list);
});
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const ew = await prisma.earlyWarning.update({ where: { id }, data: { status } });
  res.json(ew);
});
export default router;

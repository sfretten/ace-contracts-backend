import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "./_authMiddleware.js";
const prisma = new PrismaClient();
const router = Router();
router.use(auth);
router.post("/", async (req, res) => {
  const { projectId, type, subject, body } = req.body;
  const notice = await prisma.notice.create({ data: { projectId, type, subject, body, senderId: req.user.sub } });
  res.json(notice);
});
router.get("/project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const list = await prisma.notice.findMany({ where: { projectId }, orderBy: { createdAt: "desc" } });
  res.json(list);
});
export default router;

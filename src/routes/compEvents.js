import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "./_authMiddleware.js";
const prisma = new PrismaClient();
const router = Router();
router.use(auth);
router.post("/", async (req, res) => {
  const { projectId, title, description, cause } = req.body;
  const ce = await prisma.compensationEvent.create({ data: { projectId, title, description, cause, createdBy: req.user.sub } });
  res.json(ce);
});
router.get("/project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const list = await prisma.compensationEvent.findMany({ where: { projectId }, orderBy: { notifiedAt: "desc" } });
  res.json(list);
});
router.patch("/:id/quote", async (req, res) => {
  const { id } = req.params;
  const { quoteAmount, quoteTimeImpact } = req.body;
  const ce = await prisma.compensationEvent.update({ where: { id }, data: { status: "QUOTED", quoteAmount, quoteTimeImpact: quoteTimeImpact ?? null } });
  res.json(ce);
});
router.patch("/:id/decision", async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body;
  const ce = await prisma.compensationEvent.update({ where: { id }, data: { decision, decisionAt: new Date(), status: decision === "ACCEPTED" ? "ACCEPTED" : (decision === "REJECTED" ? "REJECTED" : "QUOTED") } });
  res.json(ce);
});
router.patch("/:id/implement", async (req, res) => {
  const { id } = req.params;
  const ce = await prisma.compensationEvent.update({ where: { id }, data: { status: "IMPLEMENTED", implementedAt: new Date() } });
  res.json(ce);
});
export default router;

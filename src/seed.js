import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const password = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "contractor@example.com" },
    update: {},
    create: { email: "contractor@example.com", password, name: "Contractor Demo", role: "CONTRACTOR", company: "DemoCo Ltd" }
  });
  const project = await prisma.project.create({
    data: { name: "Project Alpha", clientName: "ClientCorp", contractType: "NEC4", mainOption: "A", startDate: new Date(), ownerId: user.id }
  });
  await prisma.activity.createMany({ data: [
    { projectId: project.id, name: "Site Setup", amount: 10000 },
    { projectId: project.id, name: "Foundations", amount: 25000 },
    { projectId: project.id, name: "Superstructure", amount: 40000 }
  ]});
  await prisma.earlyWarning.create({ data: { projectId: project.id, title: "Potential supply delay", description: "Supplier hinted at 2-week delay", createdBy: user.id } });
  await prisma.compensationEvent.create({ data: { projectId: project.id, title: "Scope Change - extra ducting", description: "Client requested additional ducting runs", cause: "Client change", createdBy: user.id } });
  console.log("Seed complete.");
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

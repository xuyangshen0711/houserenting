import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.property.findFirst();
  if (p) {
    console.log("Found property:", p.id);
    try {
      await prisma.property.delete({ where: { id: p.id } });
      console.log("Deleted successfully");
    } catch(e) {
      console.error(e);
    }
  } else {
    console.log("No property");
  }
}
main().then(() => prisma.$disconnect());

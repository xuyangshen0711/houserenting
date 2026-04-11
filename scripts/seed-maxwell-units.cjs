const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const units = [
  { name: "S2", layout: "STUDIO", monthlyRent: 0, roomSizeSqFt: 462 },
  { name: "S1.1", layout: "STUDIO", monthlyRent: 0, roomSizeSqFt: 465 },
  { name: "S3", layout: "STUDIO", monthlyRent: 0, roomSizeSqFt: 549 },
  { name: "S4.1.H", layout: "STUDIO", monthlyRent: 0, roomSizeSqFt: 549 },
  { name: "S5.1", layout: "STUDIO", monthlyRent: 0, roomSizeSqFt: 567 },
  { name: "S5.2", layout: "STUDIO", monthlyRent: 0, roomSizeSqFt: 568 },
  { name: "S6.3", layout: "STUDIO", monthlyRent: 2390, roomSizeSqFt: 579 },
  { name: "S6.3", layout: "STUDIO", monthlyRent: 2860, roomSizeSqFt: 579 },
  { name: "S6.3.H", layout: "STUDIO", monthlyRent: 2660, roomSizeSqFt: 640 },
  { name: "S8", layout: "STUDIO", monthlyRent: 2875, roomSizeSqFt: 673 },
  { name: "A2U", layout: "ONE_BED_ONE_BATH", monthlyRent: 2590, roomSizeSqFt: 567 },
  { name: "A2U", layout: "ONE_BED_ONE_BATH", monthlyRent: 2740, roomSizeSqFt: 567 },
  { name: "A1.U", layout: "ONE_BED_ONE_BATH", monthlyRent: 2525, roomSizeSqFt: 572 },
  { name: "A4U", layout: "ONE_BED_ONE_BATH", monthlyRent: 2650, roomSizeSqFt: 596 },
  { name: "A4U", layout: "ONE_BED_ONE_BATH", monthlyRent: 2800, roomSizeSqFt: 596 },
  { name: "A6", layout: "ONE_BED_ONE_BATH", monthlyRent: 2850, roomSizeSqFt: 686 },
  { name: "A6", layout: "ONE_BED_ONE_BATH", monthlyRent: 2950, roomSizeSqFt: 686 },
  { name: "A6.2", layout: "ONE_BED_ONE_BATH", monthlyRent: 0, roomSizeSqFt: 689 },
  { name: "A7.2", layout: "ONE_BED_ONE_BATH", monthlyRent: 0, roomSizeSqFt: 694 },
  { name: "A10", layout: "ONE_BED_ONE_BATH", monthlyRent: 3015, roomSizeSqFt: 704 },
  { name: "A11.Den", layout: "ONE_BED_ONE_BATH", monthlyRent: 0, roomSizeSqFt: 740 },
  { name: "A13.Den.H", layout: "ONE_BED_ONE_BATH", monthlyRent: 0, roomSizeSqFt: 742 },
  { name: "A15U", layout: "ONE_BED_ONE_BATH", monthlyRent: 0, roomSizeSqFt: 753 },
  { name: "A18.Den", layout: "ONE_BED_ONE_BATH", monthlyRent: 0, roomSizeSqFt: 770 },
  { name: "A19.Den", layout: "ONE_BED_ONE_BATH", monthlyRent: 0, roomSizeSqFt: 772 },
  { name: "B1U", layout: "TWO_BED_TWO_BATH", monthlyRent: 0, roomSizeSqFt: 780 },
  { name: "B2U", layout: "TWO_BED_TWO_BATH", monthlyRent: 2860, roomSizeSqFt: 788 },
  { name: "B4.1", layout: "TWO_BED_TWO_BATH", monthlyRent: 3630, roomSizeSqFt: 991 },
  { name: "B4.2", layout: "TWO_BED_TWO_BATH", monthlyRent: 3560, roomSizeSqFt: 993 },
  { name: "B4.2", layout: "TWO_BED_TWO_BATH", monthlyRent: 3835, roomSizeSqFt: 993 },
  { name: "B7", layout: "TWO_BED_TWO_BATH", monthlyRent: 0, roomSizeSqFt: 993 },
  { name: "B7.1.H", layout: "TWO_BED_TWO_BATH", monthlyRent: 0, roomSizeSqFt: 993 },
  { name: "B9.Den", layout: "TWO_BED_TWO_BATH", monthlyRent: 3250, roomSizeSqFt: 1058 },
  { name: "B12", layout: "TWO_BED_TWO_BATH", monthlyRent: 0, roomSizeSqFt: 1063 },
  { name: "B13.Den.1", layout: "TWO_BED_TWO_BATH", monthlyRent: 3780, roomSizeSqFt: 1064 },
  { name: "B13.Den.1", layout: "TWO_BED_TWO_BATH", monthlyRent: 3930, roomSizeSqFt: 1064 },
  { name: "B14", layout: "TWO_BED_TWO_BATH", monthlyRent: 0, roomSizeSqFt: 1086 },
  { name: "B16", layout: "TWO_BED_TWO_BATH", monthlyRent: 0, roomSizeSqFt: 1167 },
  { name: "B18.Den", layout: "TWO_BED_TWO_BATH", monthlyRent: 3930, roomSizeSqFt: 1181 },
  { name: "B19", layout: "TWO_BED_TWO_BATH", monthlyRent: 0, roomSizeSqFt: 1362 },
];

async function main() {
  // Find Maxwell property
  const property = await prisma.property.findUnique({
    where: { slug: "maxwell-everett" },
    include: { floorPlans: true },
  });

  if (!property) {
    throw new Error("Property maxwell-everett not found!");
  }

  console.log(`Found property: ${property.name} (${property.floorPlans.length} existing floor plans)`);

  // Delete existing floor plans
  const deleted = await prisma.floorPlan.deleteMany({
    where: { propertyId: property.id },
  });
  console.log(`Deleted ${deleted.count} existing floor plans`);

  // Insert all new units
  const created = await prisma.floorPlan.createMany({
    data: units.map((u) => ({
      propertyId: property.id,
      name: u.name,
      layout: u.layout,
      monthlyRent: u.monthlyRent,
      roomSizeSqFt: u.roomSizeSqFt,
      isFurnished: false,
      imageUrls: [],
    })),
  });

  console.log(`Inserted ${created.count} new floor plans`);

  // Summary
  const studios = units.filter((u) => u.layout === "STUDIO");
  const oneBed = units.filter((u) => u.layout === "ONE_BED_ONE_BATH");
  const twoBed = units.filter((u) => u.layout === "TWO_BED_TWO_BATH");
  console.log(`  Studio: ${studios.length} units`);
  console.log(`  1B1B:   ${oneBed.length} units`);
  console.log(`  2B2B:   ${twoBed.length} units`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

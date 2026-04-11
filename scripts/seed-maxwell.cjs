// One-off seed script: insert Maxwell apartment into the database
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const property = await prisma.property.create({
    data: {
      slug: "maxwell-everett",
      name: "Maxwell",
      address: "102 Mill Rd, Everett, MA 02149",
      area: "EVERETT",
      petPolicy: "CATS_AND_DOGS",
      description:
        "Maxwell 是格调与烟火气的完美平衡。在这里，文化、餐厅和特色店铺触手可及。也可以居家享受绿意环绕、灵感工作空间和放松身心的丰富设施。在 Maxwell，无需远行，即可尽享城市与自然的美好。\n\n宠物政策：允许养狗，最多 2 只，体重限 80 磅，月租 $50；允许养猫，最多 2 只，体重限 80 磅，月租 $50。限制品种：比特犬、斯塔福郡梗、罗威纳、杜宾、松狮、加纳利獒、秋田、阿拉斯加雪橇犬及狼犬混血。社区配有宠物水疗中心。",
      transitInfo:
        "交通评分 62 / 100（公共交通便利）；步行评分 67 / 100（适合步行）；骑行评分 51 / 100（可骑行）。社区提供免费接驳班车。",
      promotions:
        "限时新入住优惠：可享 6 周免租。具体限制条件请咨询 leasing 顾问。",
      parkingFee: null,
      hasBrokerFee: false,
      acceptsUndergrad: true,
      isPublished: false,
      nearbySchools: [],
      imageUrls: [],
      videoUrls: [],
      floorPlans: {
        create: [
          {
            name: "Studio",
            layout: "STUDIO",
            monthlyRent: 2225,
            roomSizeSqFt: 462,
            isFurnished: false,
            imageUrls: [],
          },
          {
            name: "1 Bedroom",
            layout: "ONE_BED_ONE_BATH",
            monthlyRent: 2325,
            roomSizeSqFt: 567,
            isFurnished: false,
            imageUrls: [],
          },
          {
            name: "2 Bedroom",
            layout: "TWO_BED_TWO_BATH",
            monthlyRent: 2860,
            roomSizeSqFt: null,
            isFurnished: false,
            imageUrls: [],
          },
        ],
      },
    },
    include: { floorPlans: true },
  });

  console.log(`Created property: ${property.name} (id: ${property.id})`);
  console.log(`  slug: ${property.slug}`);
  for (const fp of property.floorPlans) {
    console.log(`  Floor plan: ${fp.name} - $${fp.monthlyRent}/mo (${fp.layout})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

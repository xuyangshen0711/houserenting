import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL 未设置，无法批量更新房源介绍。");
  process.exit(1);
}

const prisma = new PrismaClient();

const translationsByName = {
  "160 Pleasant Street Apartments":
    "在这里，你可以同时享受两种生活方式的优点。住户既能拥有郊区生活的松弛感，又能在家门口享受大城市配套，前往 Boston 和 Cambridge 都只需几分钟。项目提供 Studio、一居和两居公寓，配备现代装修、奢华社区设施、不锈钢家电、大窗采光和宽敞户型。每套公寓都拥有独立的高效供暖和空调系统，为你的生活空间持续输送新风。大楼内还设有先进健身中心、影音休息区、露台、礼宾服务、24 小时安保，以及配有电动车充电桩的恒温停车库。Walk Score 高达 97，周边餐饮、购物和休闲选择丰富，超市、银行、药房都可步行到达。你还可以去 Malden River 划皮划艇、沿 Northern Strand Trail 骑行，或探索 Fells Reservation。想去 Boston 也很方便，距离地铁 T 站仅一个街区。",
  "212 Stuart":
    "212 Stuart 坐落于波士顿多个标志性街区交汇处，位于 Back Bay，紧邻宁静的 Bay Village 和繁华的 Park Square，距 Boston Common、Newbury Street、Back Bay 车站仅数个街区，距 Logan 机场也仅需短程车程。项目提供 Studio、一居、两居、三居及联排别墅式公寓，配备精选设施和高端服务，尽享轻松优雅生活。",
  "30 Dalton":
    "30 Dalton 是全新 26 层公寓社区，毗邻 Fenway Park、Boston Common 和 Symphony 地铁站（绿线）。坐落于 Back Bay 的 Dalton 街与 Belvidere 街交汇处，开放式户型设计精巧，尽享波士顿天际线景观，配备高端装修和顶级设施。",
  "525 LINC":
    "525 LINC 提供 Studio、三居和四居户型。其中三居和四居公寓按卧室出租，住户将与同一套房内的其他租客共享公共空间。这里像是一张通往现成社群生活的通行证，让人更容易建立连接。入住 525 LINC 无需再为水电账单和买家具操心，这里全部都已包含。公寓为全套家具配置，且水电杂费全包。",
  "660 Washington":
    "660 Washington 位于波士顿 Theater District 与 Downtown 核心地段，提供高品质公寓生活。住户可享受全新翻修住宅、现代装修、室内洗衣烘干设备，以及包括联合办公空间在内的优质社区配套。项目紧邻 Boston Common、餐厅、购物区以及主要公共交通线路，位置十分便利。",
  Alcott:
    "Alcott 位于波士顿历史悠久的 West End 核心地段。这座全新的 44 层、470 户住宅高楼连接了 Thoreau Path 与 North Station，并将在高处打造 37 层天空观景平台，尽享城市景观。",
  "Alder at Allston Yards":
    "Alder 专为开拓者和创意思考者而设计，吸引各类追求卓越的人群。连接 Allston 丰富的历史与充满活力的创新未来，由 Bozzuto 打造的独特居所在这个多元社区中焕发新活力。位于 Allston Yards 核心，步行即达 Boston Landing 地铁站，一站直达波士顿市中心，轻松连接一切。",
  "Avalon North Station":
    "Avalon North Station 以无与伦比的城市景观，以及都市活力与社区氛围兼具的生活体验，重新定义公寓居住标准。项目提供无烟、宠物友好的 Studio、一居、两居和三居户型，配备现代厨房、不锈钢家电、花岗岩台面、宽敞衣橱以及室内洗衣烘干设备。社区还设有先进健身中心、可俯瞰天际线和港景的屋顶露台、宠物水疗区、住户休息室等丰富设施。",
  Avenir:
    "Avenir Apartments 位于波士顿焕新升级后的 Bulfinch Triangle Historic District，是这个充满活力街区的重要地标，周边汇集优质餐厅、商店和户外市集。Avenir 提供无烟 Studio、一居和两居公寓，配备智能家居系统、花岗岩与不锈钢质感装修，以及高品质卫浴空间。",
  "AVA Back Bay":
    "AVA Back Bay 提供 Studio、一居、两居和三居波士顿公寓，配备齐全厨房、充足储物空间和硬木地板，另有精装公寓可选。现代厨房配花岗岩台面、不锈钢电器和瓷砖背板。社区设施包括先进健身中心、住户活动空间以及公共区域免费 WiFi。周边零售、健身、超市和地铁一应俱全。",
  "BLDG 89":
    "BLDG 89 位于充满活力的 Allston 社区，提供 Studio、一居和两居公寓。住户可享受高端装修、设备完善的健身房、顶层屋顶露台，以及轻松抵达 Allston 各类生活配套的便利位置。",
  Duo:
    "DUO 让你尽享便捷都市生活，毗邻银线、Logan 机场和波士顿天际线。可选 Studio、一居或两居公寓，配备挑高天花板、超大衣橱、室内洗衣设备和城市或水景视野。尽享三个屋顶露台、健身中心、空中会所、联合办公咖啡厅、游戏厅、高尔夫模拟器、宠物公园和儿童游乐场。社区还配备电动车充电车库、自行车中心及火炉庭院。",
  "E3 Apartments":
    "E3 Apartments 将 Allston 的多元活力与奢华居住体验完美融合。三栋建筑 Eco、Element 和 Edge 各具风格与内装特色，任你选择。",
  "Garrison Square":
    "Garrison Square Apartments 提供一居、两居和三居公寓，坐落于波士顿。公寓融合 19 世纪复古建筑风格与 21 世纪现代设施，配备壁炉、大理石装饰和室内洗衣机烘干机。私人景观庭院配铸铁喷泉，屋顶露台尽览壮丽景观。步行可达 Back Bay 时尚商铺和 South End 画廊与小酒馆，毗邻市中心商务和娱乐区。",
  "Hub50House":
    "Hub50House 高踞 The Hub on Causeway 之上，提供拥有全景城市与水景视野的豪华公寓，以及出众的高端配套。住户可享受波士顿最高的屋顶泳池、专为宠物打造的四季可用 Woof Deck，以及毗邻 North Station 和 Boston Garden 的活力地段。",
  Jade:
    "欢迎来到 Jade，一处精心打造的灵感居所，让你在此寻找慰藉，探索大波士顿地区的精彩。精心设计的室内空间采用丰富自然色调，设施满足各种生活方式需求。配备现代健身中心、充足的共享办公空间、音乐室和宠物水疗中心。户外宽敞庭院配有火炉、烧烤区和泳池。",
  "Luka on the Common":
    "我们的公寓因这座伟大城市而充满活力，也因你而独具个性。距 Boston Common 仅几分钟路程，一个街区即可抵达绿线和橙线地铁，四个街区可达红线，市中心的娱乐、夜生活和餐饮尽在指尖。",
  Mason:
    "Mason 公寓以温馨的工业风设计、精致设施和专属工作区域，激发生活灵感。位于 Everett 的豪华公寓，无论是创意工作、健身运动、朋友聚会还是通勤后的放松休憩，都能找到理想节奏。这里，就是家。",
  Maxwell:
    "Maxwell 是格调与烟火气的完美平衡。在这里，文化、餐厅和特色店铺触手可及。也可以居家享受绿意环绕、灵感工作空间和放松身心的丰富设施。在 Maxwell，无需远行，即可尽享城市与自然的美好。\n\n宠物政策：允许养狗，最多 2 只，体重限 80 磅，月租 $50；允许养猫，最多 2 只，体重限 80 磅，月租 $50。限制品种：比特犬、斯塔福郡梗、罗威纳、杜宾、松狮、加纳利獒、秋田、阿拉斯加雪橇犬及狼犬混血。社区配有宠物水疗中心。",
  "One Everett":
    "One Everett 是 Boston Landing 的全新亮点，集惊艳建筑、震撼内饰与合理定价于一身。时尚精致的设计为住户带来顶级豪华生活体验，包含丰富设施、宽敞户型、设计师级装修和 A+ 地段。从拥有极致天际线景观的屋顶露台到充满活力的底层空间，One Everett 真正实现从上到下的高端生活。",
  "One North of Boston":
    "欢迎来到 One North of Boston，一个与众不同的公寓社区。ONB 拥有超乎想象的丰富设施、贴心的住户服务、精美的公寓内饰和高端配置，更有宠物呵护服务。距波士顿市中心仅一英里，是近郊唯一可步行直达 Chelsea 通勤铁路（至 North Station）或 SL3 银线（至 South Station）的公寓社区。",
  "Overlook at St. Gabriel's":
    "The Overlook at St. Gabriel's 提供与众不同的居住体验。项目坐落于 Brighton 一处修复后的历史校园之中，社区在成熟树木与经典建筑环绕下，拥有开阔的波士顿景观与安静、开阔的居住氛围。这里提供从 Studio 到四居室的公寓及联排别墅，将历史底蕴与现代优雅结合在一起。许多住宅拥有挑高天花板、定制化装修，并保留了原 St. Gabriel's 修道院与教堂的建筑细节，部分户型还带有私人露台，营造更轻松的室内外联动生活方式。社区配套经过精心规划，从度假风格泳池、宽敞健身中心到独立工作空间和趣味推杆果岭，每一处细节都围绕舒适、健康与社交连接而设计。",
  "Park 151":
    "Park 151 坐落于 East Cambridge 核心地段，紧邻公园，提供高品质 Studio、一居、两居和三居豪华公寓。你可以在公园旁享受高品质居住体验，同时拥有世界级配套设施，包括户外泳池露台、普拉提教室、多处住户休息区，以及俯瞰波士顿市中心和 Kendall Square 的开阔景观。",
  "Parkside Commons":
    "Parkside Commons 位于 Chelsea Route 1 旁，在都市环境中打造顶级公寓生活。多次荣获环保居住与奢华风格相结合的殊荣。专属设施包括游泳池、健身中心、会所和商务中心。距 MBTA 通勤铁路 Chelsea 站仅 1.5 英里，蓝线地铁仅 2 英里，Logan 机场不到 2 英里。",
  "Quarrystone at Overlook Ridge":
    "Quarrystone at Overlook Ridge 位于 Malden，提供波士顿地区少见的大户型公寓，将奢华感与便利性结合在距离 Boston 和海边都不远的优越位置。社区提供前往 Haymarket、Malden Center 和通勤铁路站的免费接驳班车，日常通勤非常方便。项目坐落在安静宜居的社区环境中，拥有精致园林、适合步行的道路，以及宽敞的一居、两居和三居公寓。户型采用开放式布局，配备现代厨房和早餐吧台、大卧室、玻璃淋浴间与浸泡浴缸、室内洗衣设备、步入式衣橱和充足储物空间。在 Quarrystone at Overlook Ridge，舒适与便利兼得。",
  Radius:
    "Radius Boston 坐落于充满活力的 Brighton 核心，现代设计与优雅格调在此交融。每间通透明亮的住宅都展现流畅的装修、开放式布局和精致细节。LEED 金级认证社区提供顶层健身中心、冥想室、主厨厨房和屋顶露台（配烧烤站和草坪游戏区），尽览城市美景。毗邻 Charles River，周围环绕波士顿优质餐饮和娱乐场所。",
  "The Brookliner":
    "欢迎来到 The Brookliner。项目以 Brookline 一贯的精致优雅与低调风格为灵感，提供 Studio、一居、两居和三居公寓。这里的每一处细节都经过反复打磨，打造出令人喜爱的城市私享居所。住宅拥有合理布局、高端装修，并可享受完善的社区配套。项目地理位置也十分便利，Whole Foods 就在隔壁，Washington Square、Longwood 以及 Brighton 和 Boston 各大生活区域都可轻松到达。",
  "The Charley":
    "The Charley 提供全新建成的公寓，拥有多种独特户型可选。宽敞的户型配备高端白色大理石瓷砖地面、不锈钢家电、柱盆、石英石台面，以及深咖色质感橱柜，整体居住体验精致而现代。社区配套包括 24 小时健身中心、屋顶休息区等。项目位于 Allston 核心，周围环绕活跃的美食、艺术与音乐氛围，介于 Charles River 与 Boston Landing 之间，带来精品级豪华居住体验。",
  "The Emery at Overlook Ridge":
    "The Emery at Overlook Ridge 现已开放招租。项目将现代公寓配置与贴合当代生活方式的社区设施融合在一个安静私享、距离波士顿市中心仅约 15 分钟的环境之中。坐落于充满活力的 Overlook Ridge 社区，这里为你的生活、工作与日常节奏带来更多可能。这是一种真正跟得上你步调的公寓生活方式。",
  "The Exchange Street Apartments":
    "在这里，你可以同时享受两种生活方式的优点。住户既能拥有郊区生活的松弛感，又能在家门口享受大城市配套，前往 Boston 和 Cambridge 都只需几分钟。项目提供 Studio、一居和两居公寓，配备现代装修、奢华社区设施、不锈钢家电、大窗采光和宽敞户型。每套公寓都拥有独立的高效供暖和空调系统，为你的生活空间持续输送新风。大楼内还设有先进健身中心、影音休息区、露台、礼宾服务、24 小时安保，以及配有电动车充电桩的恒温停车库。Walk Score 高达 97，周边餐饮、购物和休闲选择丰富，超市、银行、药房都可步行到达。你还可以去 Malden River 划皮划艇、沿 Northern Strand Trail 骑行，或探索 Fells Reservation。想去 Boston 也很方便，距离地铁 T 站仅一个街区。",
  "The Indie":
    "The Indie 坐落于充满活力的 Allston 社区，打造现代优质居住体验。Allston 以其蓬勃的能量和多元的商铺、餐厅及文化景点著称，是理想的居住之选。",
  "The Kensington":
    "The Kensington 连续 7 年荣获全美住户满意度第一，拥有高端公寓、超 2800 平方米的顶级设施和无可比拟的波士顿市中心位置。从大堂到每个单元，每一处细节都展现当代风格。高层尽享城市壮丽景观。设施包括屋顶泳池日光平台、健身中心、宠物水疗等，一楼设有 Jaho Coffee and Tea。无需自驾，步行即可满足大部分生活所需，同时也是 LEED 金级认证绿色社区。",
  "The Monroe":
    "在 The Monroe，每天回家都像在度假。这里以接近公寓豪宅标准的工艺品质和度假式社区配套，带来更高阶的居住体验。优越地段周边生活丰富多彩，全新的活力生活方式正在等你开启。在 The Monroe，你可以每天都更轻松自在地享受生活，而通往 Boston 精彩生活的路线，也从这里开始。",
  "The Pioneer":
    "欢迎来到 The Pioneer，位于 Everett 的豪华公寓社区。宽敞开放式户型适合小型聚会，私人阳台可静享波士顿天际线美景。尽享超大露天庭院（配备恒温泳池、火炉和户外电影院）、高尔夫模拟器、24 小时健身中心（含瑜伽和 Peloton 单车房）等丰富设施。",
  "The Sudbury":
    "在 The Sudbury，你可以享受震撼景观、富有灵感的现代设计，以及贴心打造的奢华社区配套。项目是一座位于波士顿 West End 市中心的现代高层住宅，带来更高品质的都市生活体验。",
  "Trac 75":
    "TRAC 75 将都市精致感与舒适便利结合在一起，是位于 Allston 的全新公寓项目。它以全新的角度诠释 Allston 生活，配备高标准社区设施，并拥有极具优势的地理位置，距离 Boston Landing 通勤铁路站以及 Allston 丰富的餐厅、商店和娱乐场所都仅几步之遥。",
  Twenty20:
    "Twenty20 是现代奢华生活的代表作，拥有开阔而独特的居住视角。这里汇聚了年轻职场人士、学者等多元人群，坐落于出色的 East Cambridge 社区。窗外即可欣赏令人向往的波士顿天际线，同时还能轻松享受前所未有的零售和休闲配套资源。社区周边可通过骑行、步行和便利的公共交通轻松穿行，整栋 20 层建筑提供从 Studio 到顶层豪宅的多样精心设计户型。",
  "Vero Apartments":
    "Vero Apartments 坐落于 Chelsea 复兴中的工业区，同时也是充满活力的滨水社区。公寓提供从 Studio 到宽敞两居室的多种独特户型，每间都以高端现代装修精心打造。周边环绕本地精酿酒厂、获奖餐厅，以及多个艺术画廊和表演艺术剧院。距 MBTA 银线仅两个街区，轻松连接波士顿市中心和北岸地区的精彩生活。",
  Verra:
    "Verra 融合舒适、温馨与热情好客，打造高品质社区生活。坐落于 Allston 最具活力的新地标核心地带，提供 Studio、一居和两居公寓，是理想的安家之所。"
};

async function main() {
  const properties = await prisma.property.findMany({
    select: { id: true, name: true, description: true }
  });

  let updatedCount = 0;
  let skippedCount = 0;

  for (const property of properties) {
    const translatedDescription = translationsByName[property.name];

    if (!translatedDescription) {
      skippedCount += 1;
      continue;
    }

    if (property.description === translatedDescription) {
      skippedCount += 1;
      continue;
    }

    await prisma.property.update({
      where: { id: property.id },
      data: { description: translatedDescription }
    });

    updatedCount += 1;
    console.log(`已更新: ${property.name}`);
  }

  console.log(`完成。更新 ${updatedCount} 条，跳过 ${skippedCount} 条。`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

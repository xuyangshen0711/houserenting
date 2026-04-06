import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const translations = {
  "cmnltuebb0000uuqwdq9uoj3z": // The Pioneer
    "欢迎来到 The Pioneer，位于 Everett 的豪华公寓社区。宽敞开放式户型适合小型聚会，私人阳台可静享波士顿天际线美景。尽享超大露天庭院（配备恒温泳池、火炉和户外电影院）、高尔夫模拟器、24小时健身中心（含瑜伽和 Peloton 单车房）等丰富设施。",

  "cmnm71f6n0000uuqcgjhzfmmt": // One North of Boston
    "欢迎来到 One North of Boston，一个与众不同的公寓社区。ONB 拥有超乎想象的丰富设施、贴心的住户服务、精美的公寓内饰和高端配置，更有宠物呵护服务。距波士顿市中心仅一英里，是近郊唯一可步行直达 Chelsea 通勤铁路（至 North Station）或 SL3 银线（至 South Station）的公寓社区。",

  "cmnlv4v230000uu1wpxxbr38i": // Garrison Square
    "Garrison Square Apartments 提供一居、两居和三居公寓，坐落于波士顿。公寓融合19世纪复古建筑风格与21世纪现代设施，配备壁炉、大理石装饰和室内洗衣机烘干机。私人景观庭院配铸铁喷泉，屋顶露台尽览壮丽景观。步行可达 Back Bay 时尚商铺和 South End 画廊与小酒馆，毗邻市中心商务和娱乐区。",

  "cmnm6qy950000uutw71hynvhu": // Parkside Commons
    "Parkside Commons 位于 Chelsea Route 1 旁，在都市环境中打造顶级公寓生活。多次荣获环保居住与奢华风格相结合的殊荣。专属设施包括游泳池、健身中心、会所和商务中心。距 MBTA 通勤铁路 Chelsea 站仅1.5英里，蓝线地铁仅2英里，Logan 机场不到2英里。",

  "cmnm74j550000uu8g2hvpz057": // Duo
    "DUO 让你尽享便捷都市生活——毗邻银线、Logan 机场和波士顿天际线。可选工作室、一居或两居公寓，配备挑高天花板、超大衣橱、室内洗衣设备和城市/水景视野。尽享三个屋顶露台、健身中心、空中会所、联合办公咖啡厅、游戏厅、高尔夫模拟器、宠物公园和儿童游乐场。配备电动车充电车库、自行车中心及火炉庭院。",

  "cmnm4yg1e0000uukcr8liwsbo": // The Indie
    "The Indie 坐落于充满活力的 Allston 社区，打造现代优质居住体验。Allston 以其蓬勃的能量和多元的商铺、餐厅及文化景点著称，是理想的居住之选。",

  "cmnm67eki0000uuzk210fqyy2": // Verra
    "Verra 融合舒适、温馨与热情好客，打造高品质社区生活。坐落于 Allston 最具活力的新地标核心地带，提供工作室、一居和两居公寓，是理想的安家之所。",

  "cmnlvchqh0000uut0sgv88g61": // 30 Dalton
    "30 Dalton 是全新26层公寓社区，毗邻 Fenway Park、Boston Common 和 Symphony 地铁站（绿线）。坐落于 Back Bay 的 Dalton 街与 Belvidere 街交汇处，开放式户型设计精巧，尽享波士顿天际线景观，配备高端装修和顶级设施。",

  "cmnltfjbr0000uuqc8tvkiuo5": // Mason
    "Mason 公寓以温馨的工业风设计、精致设施和专属工作区域，激发生活灵感。位于 Everett 的豪华公寓，无论是创意工作、健身运动、朋友聚会还是通勤后的放松休憩，都能找到理想节奏。这里，就是家。",

  "cmnlaqm3w0000sz2au5t5rbx4": // Jade
    "欢迎来到 Jade——一处精心打造的灵感居所，让你在此寻找慰藉，探索大波士顿地区的精彩。精心设计的室内空间采用丰富自然色调，设施满足各种生活方式需求。配备现代健身中心、充足的共享办公空间、音乐室和宠物水疗中心。户外宽敞庭院配有火炉、烧烤区和泳池。",

  "cmnlu2zag0000uu2wny1k3b8g": // AVA Back Bay
    "AVA Back Bay 提供工作室、一居、两居和三居波士顿公寓，配备齐全厨房、充足储物空间和硬木地板，另有精装公寓可选。现代厨房配花岗岩台面、不锈钢电器、瓷砖背板。社区设施包括先进健身中心、住户活动和公共区域免费WiFi。周边零售、健身、超市和地铁一应俱全。",

  "cmnlvqpgm0000uu2gdpjdkngc": // 212 Stuart
    "212 Stuart 坐落于波士顿多个标志性街区交汇处——Back Bay，紧邻宁静的 Bay Village 和繁华的 Park Square，距 Boston Common、Newbury Street、Back Bay 车站仅数个街区，距 Logan 机场仅短程车程。提供工作室、一居、两居、三居及联排别墅式公寓，配备精选设施和高端服务，尽享轻松优雅生活。",

  "cmnm44fzy0000uutsip73ulpc": // The Kensington
    "The Kensington 连续7年荣获全美住户满意度第一*，拥有高端公寓、超2800平方米的顶级设施和无可比拟的波士顿市中心位置。从大堂到每个单元，每一处细节都展现当代风格。高层尽享城市壮丽景观。设施包括屋顶泳池日光平台、健身中心、宠物水疗等。一楼设有 Jaho Coffee and Tea。无需自驾，步行可达大部分生活所需。LEED 金级认证绿色社区。",

  "cmnm5t3on0000uuwo4ieo8fnr": // E3 Apartments
    "E3 Apartments 将 Allston 的多元活力与奢华居住完美融合。三栋建筑 Eco、Element 和 Edge 各具风格与内装特色，任你选择。",

  "cmnm551ob0000uua8uw03ahch": // One Everett
    "One Everett 是 Boston Landing 的全新亮点，集惊艳建筑、震撼内饰与合理定价于一身。时尚精致的设计为住户带来顶级豪华生活体验——丰富设施、宽敞户型、设计师级装修和 A+ 地段。从拥有极致天际线景观的屋顶露台到充满活力的底层空间，One Everett 真正实现从上到下的高端生活。",

  "cmnm6jy7s0000uuo8gdnzsow4": // Alder at Allston Yards
    "Alder 专为开拓者和创意思考者而设计，吸引各类追求卓越的人群。连接 Allston 丰富的历史与充满活力的创新未来，由 Bozzuto 打造的独特居所在这个多元社区中焕发新活力。位于 Allston Yards 核心，步行即达 Boston Landing 地铁站，一站直达波士顿市中心，轻松连接一切。",

  "cmnlsm5sp0000uu54hs48mci4": // Maxwell
    "Maxwell 是格调与烟火气的完美平衡。在这里，文化、餐厅和特色店铺触手可及。也可以居家享受绿意环绕、灵感工作空间和放松身心的丰富设施。在 Maxwell，无需远行，即可尽享城市与自然的美好。\n\n宠物政策：允许养狗，最多2只，体重限80磅，月租$50；允许养猫，最多2只，体重限80磅，月租$50。限制品种：比特犬/斯塔福郡梗、罗威纳、杜宾、松狮、加纳利獒、秋田、阿拉斯加雪橇犬、狼犬混血。设有宠物水疗中心。",

  "cmnm3gze40000uuv02w7btntx": // Luka on the Common
    "我们的公寓因这座伟大城市而充满活力，因你而独具个性。距 Boston Common 仅几分钟，一个街区即达绿线和橙线地铁，四个街区可达红线，市中心的娱乐、夜生活和餐饮尽在指尖。",

  "cmnm6n6320000uu9oytj14fba": // Radius
    "Radius Boston 坐落于充满活力的 Brighton 核心，现代设计与优雅格调在此交融。每间通透明亮的住宅都展现流畅的装修、开放式布局和精致细节。LEED 金级认证社区提供顶层健身中心、冥想室、主厨厨房、屋顶露台（配烧烤站和草坪游戏区），尽览城市美景。毗邻 Charles River，周围环绕波士顿最佳餐饮和娱乐场所。",

  "cmnm6wdcj0000uuh8h8etz0ra": // Vero Apartments
    "Vero Apartments 坐落于 Chelsea 复兴的工业区，同时也是充满活力的滨水社区。公寓提供从工作室到宽敞两居室的多种独特户型，每间都以高端现代装修精心打造。周边环绕本地精酿酒厂、获奖餐厅和多个艺术画廊与表演艺术剧院。距 MBTA 银线仅两个街区，轻松连接波士顿市中心和北岸地区的精彩生活。",
};

async function main() {
  for (const [id, desc] of Object.entries(translations)) {
    await p.property.update({ where: { id }, data: { description: desc } });
    const prop = await p.property.findUnique({ where: { id }, select: { name: true } });
    console.log(`✓ ${prop.name}`);
  }
  await p.$disconnect();
  console.log("\nDone! All descriptions translated.");
}

main();

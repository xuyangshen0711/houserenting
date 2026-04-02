import type { ListingViewModel } from "@/lib/listing-view-model";

export const mockListings: ListingViewModel[] = [
  {
    id: "mock-back-bay-brownstone-light",
    slug: "back-bay-brownstone-light",
    title: "Back Bay 棕石楼光感一居",
    monthlyRent: 3650,
    address: "Boylston St, Boston, MA",
    area: "Back Bay",
    nearbySchools: ["Boston University", "Northeastern University"],
    layoutLabel: "1B1B",
    hasBrokerFee: false,
    isFurnished: true,
    petPolicyLabel: "猫狗均可",
    imageUrls: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
    ],
    videoUrls: [],
    description:
      "位于 Back Bay 核心街区，步行即可到达 Newbury Street 与绿线站点。整体空间线条简洁，客厅采光通透，适合希望兼顾美感与通勤效率的留学生或年轻职场人士。",
    transitInfo: "步行 4 分钟到 Green Line，12 分钟到 Northeastern",
    tagline: "通勤与城市氛围兼得",
    isPublished: true
  },
  {
    id: "mock-malden-orange-line-family",
    slug: "malden-orange-line-family",
    title: "Malden 中心高层两居",
    monthlyRent: 2980,
    address: "Pleasant St, Malden, MA",
    area: "Malden",
    nearbySchools: ["Tufts University"],
    layoutLabel: "2B2B",
    hasBrokerFee: true,
    isFurnished: false,
    petPolicyLabel: "不限",
    imageUrls: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80"
    ],
    videoUrls: [],
    description:
      "靠近 Orange Line 的两居高层，户型方正，卧室独立性强，适合朋友合租或情侣长住。楼内设施完整，生活便利度高，是 Malden 区非常稳妥的选择。",
    transitInfo: "步行 6 分钟到 Malden Center，约 22 分钟进城",
    tagline: "合租友好，节奏从容",
    isPublished: true
  },
  {
    id: "mock-everett-riverside-studio",
    slug: "everett-riverside-studio",
    title: "Everett 河景精装 Studio",
    monthlyRent: 2420,
    address: "Broadway, Everett, MA",
    area: "Everett",
    nearbySchools: ["Northeastern University"],
    layoutLabel: "Studio",
    hasBrokerFee: false,
    isFurnished: true,
    petPolicyLabel: "仅猫",
    imageUrls: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    ],
    videoUrls: [],
    description:
      "适合预算更克制、但仍然追求设计感与舒适度的人群。Studio 的收纳做得很完整，窗景开阔，晨间光线柔和，非常适合单人居住与远程办公。",
    transitInfo: "门口公交接驳 Orange Line，开车约 15 分钟到 Downtown",
    tagline: "精致独居，预算友好",
    isPublished: true
  },
  {
    id: "mock-allston-campus-share",
    slug: "allston-campus-share",
    title: "Allston 校区附近双卧公寓",
    monthlyRent: 3200,
    address: "Commonwealth Ave, Allston, MA",
    area: "Allston",
    nearbySchools: ["Boston University", "Boston College"],
    layoutLabel: "2B2B",
    hasBrokerFee: true,
    isFurnished: true,
    petPolicyLabel: "猫狗均可",
    imageUrls: [
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80"
    ],
    videoUrls: [],
    description:
      "离 BU 与日常生活配套都很近，适合学生与初来波士顿的工作党。双卧布局均衡，公共区域宽敞，兼顾社交和安静休息。",
    transitInfo: "门口 Green Line，步行到超市与餐厅约 5 分钟",
    tagline: "校园生活圈，省心上手",
    isPublished: true
  },
  {
    id: "mock-cambridge-modern-loft",
    slug: "cambridge-modern-loft",
    title: "Cambridge 简约阁楼感一居",
    monthlyRent: 3880,
    address: "Massachusetts Ave, Cambridge, MA",
    area: "Cambridge",
    nearbySchools: ["Harvard University", "Massachusetts Institute of Technology"],
    layoutLabel: "1B1B",
    hasBrokerFee: false,
    isFurnished: false,
    petPolicyLabel: "不限",
    imageUrls: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
    ],
    videoUrls: [],
    description:
      "Cambridge 典型的理性与自由感，在这套公寓里有很好的平衡。适合 MIT 或 Harvard 周边学习工作的人，安静、整洁，也方便步行抵达咖啡馆与图书馆。",
    transitInfo: "步行 8 分钟到 Red Line，附近步行生活半径成熟",
    tagline: "学术氛围与生活质感并存",
    isPublished: true
  },
  {
    id: "mock-brookline-classic-two-bed",
    slug: "brookline-classic-two-bed",
    title: "Brookline 林荫大道温润两居",
    monthlyRent: 3460,
    address: "Beacon St, Brookline, MA",
    area: "Brookline",
    nearbySchools: ["Boston University", "Boston College", "Harvard University"],
    layoutLabel: "2B2B",
    hasBrokerFee: false,
    isFurnished: true,
    petPolicyLabel: "仅猫",
    imageUrls: [
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80"
    ],
    videoUrls: [],
    description:
      "街区气质温和，树荫和红砖的秩序感很适合长期居住。公寓内部做了现代化翻新，但仍保留了波士顿经典住宅的比例与层次。",
    transitInfo: "步行 5 分钟到 C Line，进 Longwood Medical Area 方便",
    tagline: "适合稳定长期居住",
    isPublished: true
  }
];

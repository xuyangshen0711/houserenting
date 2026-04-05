import { Area, LayoutType, PetPolicy } from "@prisma/client";

export type FloorPlanSource = {
  id: string;
  name: string;
  layout: LayoutType;
  monthlyRent: number;
  roomSizeSqFt: number | null;
  isFurnished: boolean;
  imageUrls: string[];
};

export type AdminListingRecord = {
  id: string;
  slug: string;
  name: string;
  address: string;
  area: Area;
  nearbySchools: string[];
  petPolicy: PetPolicy;
  acceptsUndergrad: boolean;
  parkingFee: number | null;
  hasBrokerFee: boolean;
  promotions: string | null;
  imageUrls: string[];
  videoUrls: string[];
  description: string;
  transitInfo: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  floorPlans: FloorPlanSource[];
  floorPlanDiagrams: Record<string, string[]> | null;
};

const areaLabelMap: Record<Area, string> = {
  BACK_BAY: "Back Bay",
  BEACON_HILL: "Beacon Hill",
  SEAPORT: "Seaport",
  SOUTH_END: "South End",
  CHELSEA: "Chelsea",
  BRIGHTON: "Brighton",
  EVERETT: "Everett",
  MALDEN: "Malden",
  ALLSTON: "Allston",
  CAMBRIDGE: "Cambridge",
  SOMERVILLE: "Somerville",
  BROOKLINE: "Brookline",
  BOSTON: "Boston"
};

const areaTaglineMap: Record<Area, string> = {
  BACK_BAY: "通勤与城市氛围兼得",
  BEACON_HILL: "经典波士顿街区，步行生活感强",
  SEAPORT: "滨水新城，现代感和配套都在线",
  SOUTH_END: "历史街区与餐饮氛围兼具",
  CHELSEA: "预算更灵活，进城通勤方便",
  BRIGHTON: "学生与年轻职场人都很友好",
  EVERETT: "精致独居，预算友好",
  MALDEN: "合租友好，节奏从容",
  ALLSTON: "校园生活圈，省心上手",
  CAMBRIDGE: "学术氛围与生活质感并存",
  SOMERVILLE: "生活密度高，街区感鲜明",
  BROOKLINE: "适合稳定长期居住",
  BOSTON: "波士顿市中心，生活便利配套齐全"
};

const layoutLabelMap: Record<LayoutType, string> = {
  STUDIO: "Studio",
  ONE_BED_ONE_BATH: "1B1B",
  ONE_BED_DEN: "1B+Den",
  TWO_BED_TWO_BATH: "2B2B",
  THREE_BED_TWO_BATH: "3B2B"
};

export type FloorPlanDiagrams = Partial<Record<LayoutType, string[]>>;

const petPolicyLabelMap: Record<PetPolicy, string> = {
  OPEN: "不限",
  CATS_ONLY: "仅猫",
  CATS_AND_DOGS: "猫狗均可"
};

export const supportedAreaLabels = [
  "Back Bay",
  "Beacon Hill",
  "Seaport",
  "South End",
  "Chelsea",
  "Brighton",
  "Everett",
  "Malden",
  "Allston",
  "Cambridge",
  "Somerville",
  "Brookline",
  "Boston"
];

export const orderedSchoolLabels = [
  "全部",
  "Harvard University",
  "Massachusetts Institute of Technology",
  "Boston University",
  "Northeastern University",
  "Tufts University",
  "Boston College",
  "Emerson College",
  "Suffolk University",
  "University of Massachusetts Boston",
  "Massachusetts College of Art and Design",
  "Wentworth Institute of Technology",
  "Wheelock College",
  "Berklee College of Music",
  "New England Conservatory",
  "Lesley University",
  "Cambridge College",
  "Babson College",
  "Brandeis University",
  "School of the Museum of Fine Arts at Tufts",
  "Boston Architectural College"
];

export const supportedSchoolLabels = orderedSchoolLabels.filter(
  (school) => school !== "全部"
);

export const schoolShortLabelMap: Record<string, string> = {
  "Boston University": "BU",
  "Northeastern University": "NEU",
  "Harvard University": "Harvard",
  "Massachusetts Institute of Technology": "MIT",
  "Boston College": "BC",
  "Tufts University": "Tufts",
  "Emerson College": "Emerson",
  "Suffolk University": "Suffolk",
  "University of Massachusetts Boston": "UMass Boston",
  "Massachusetts College of Art and Design": "MassArt",
  "Wentworth Institute of Technology": "Wentworth",
  "Wheelock College": "Wheelock",
  "Berklee College of Music": "Berklee",
  "New England Conservatory": "NEC",
  "Lesley University": "Lesley",
  "Cambridge College": "Cambridge College",
  "Babson College": "Babson",
  "Brandeis University": "Brandeis",
  "School of the Museum of Fine Arts at Tufts": "SMFA at Tufts",
  "Boston Architectural College": "BAC"
};

export const rentSortOptions = [
  { value: "default", label: "默认排序" },
  { value: "rent_asc", label: "房租从低到高" },
  { value: "rent_desc", label: "房租从高到低" }
] as const;

export type RentSortValue = (typeof rentSortOptions)[number]["value"];

export function getAreaLabel(area: Area) {
  return areaLabelMap[area];
}

export function getAreaEnum(label: string) {
  return (Object.entries(areaLabelMap).find(([, value]) => value === label)?.[0] ??
    null) as Area | null;
}

export function getLayoutLabel(layout: LayoutType) {
  return layoutLabelMap[layout];
}

export function getPetPolicyLabel(petPolicy: PetPolicy) {
  return petPolicyLabelMap[petPolicy];
}

export function getTagline(area: Area) {
  return areaTaglineMap[area];
}

export function getOrderedAreaLabels(selectedLabels: string[]) {
  return supportedAreaLabels.filter((label) => selectedLabels.includes(label));
}

export function getOrderedSchoolLabels(selectedLabels: string[]) {
  return orderedSchoolLabels.filter((label) => label === "全部" || selectedLabels.includes(label));
}

export function getSchoolDisplayLabel(school: string) {
  return schoolShortLabelMap[school] ?? school;
}

type ListingSource = {
  id: string;
  slug: string;
  name: string;
  address: string;
  area: Area;
  nearbySchools: string[];
  petPolicy: PetPolicy;
  acceptsUndergrad: boolean;
  parkingFee: number | null;
  promotions: string | null;
  hasBrokerFee: boolean;
  imageUrls: string[];
  videoUrls: string[];
  description: string;
  transitInfo: string | null;
  isPublished: boolean;
  floorPlans: FloorPlanSource[];
  floorPlanDiagrams?: Record<string, string[]> | null;
};

export type FloorPlanViewModel = {
  id: string;
  name: string;
  layout: LayoutType;
  layoutLabel: string;
  monthlyRent: number;
  roomSizeSqFt: number | null;
  isFurnished: boolean;
  imageUrls: string[];
};

export type ListingViewModel = {
  id: string;
  slug: string;
  title: string;
  monthlyRent: number; // min rent from floor plans
  address: string;
  area: string;
  nearbySchools: string[];
  petPolicyLabel: string;
  acceptsUndergrad: boolean;
  parkingFee: number | null;
  hasBrokerFee: boolean;
  promotions: string | null;
  imageUrls: string[];
  videoUrls: string[];
  description: string;
  transitInfo: string;
  tagline: string;
  isPublished: boolean;
  floorPlans: FloorPlanViewModel[];
  floorPlanDiagrams: Record<string, string[]>;
};

function normalizeDiagramUrls(urls: unknown): string[] {
  if (!Array.isArray(urls)) {
    return [];
  }

  return urls.filter((url): url is string => typeof url === "string" && url.trim().length > 0);
}

export function getUnifiedFloorPlanDiagrams(
  floorPlans: Array<Pick<FloorPlanSource, "layout" | "imageUrls">>,
  legacyDiagrams?: Record<string, string[]> | null
): Record<string, string[]> {
  const merged = new Map<string, string[]>();

  function append(layout: string, urls: unknown) {
    const nextUrls = normalizeDiagramUrls(urls);
    if (nextUrls.length === 0) {
      return;
    }

    const current = merged.get(layout) ?? [];
    for (const url of nextUrls) {
      if (!current.includes(url)) {
        current.push(url);
      }
    }
    merged.set(layout, current);
  }

  for (const floorPlan of floorPlans) {
    append(floorPlan.layout, floorPlan.imageUrls);
  }

  if (legacyDiagrams) {
    for (const [layout, urls] of Object.entries(legacyDiagrams)) {
      append(layout, urls);
    }
  }

  return Object.fromEntries(merged.entries());
}

export function mapToListingViewModel(property: ListingSource): ListingViewModel {
  const mappedFloorPlans = property.floorPlans.map((fp) => ({
    id: fp.id,
    name: fp.name,
    layout: fp.layout,
    layoutLabel: getLayoutLabel(fp.layout),
    monthlyRent: fp.monthlyRent,
    roomSizeSqFt: fp.roomSizeSqFt,
    isFurnished: fp.isFurnished,
    imageUrls: fp.imageUrls
  }));

  const pricedPlans = mappedFloorPlans.filter(fp => fp.monthlyRent > 0);
  const minRent = pricedPlans.length > 0
    ? Math.min(...pricedPlans.map(fp => fp.monthlyRent))
    : 0;

  return {
    id: property.id,
    slug: property.slug,
    title: property.name,
    monthlyRent: minRent,
    address: property.address,
    area: getAreaLabel(property.area),
    nearbySchools: property.nearbySchools,
    petPolicyLabel: getPetPolicyLabel(property.petPolicy),
    acceptsUndergrad: property.acceptsUndergrad,
    parkingFee: property.parkingFee,
    hasBrokerFee: property.hasBrokerFee,
    promotions: property.promotions,
    imageUrls: property.imageUrls,
    videoUrls: property.videoUrls,
    description: property.description,
    transitInfo: property.transitInfo ?? "交通信息待补充",
    tagline: getTagline(property.area),
    isPublished: property.isPublished,
    floorPlans: mappedFloorPlans,
    floorPlanDiagrams: getUnifiedFloorPlanDiagrams(
      property.floorPlans,
      (property.floorPlanDiagrams as Record<string, string[]>) ?? null
    )
  };
}

import { Area, LayoutType, PetPolicy } from "@prisma/client";

export type ListingViewModel = {
  id: string;
  slug: string;
  title: string;
  monthlyRent: number;
  address: string;
  area: string;
  nearbySchools: string[];
  layoutLabel: string;
  hasBrokerFee: boolean;
  isFurnished: boolean;
  petPolicyLabel: string;
  imageUrls: string[];
  videoUrls: string[];
  description: string;
  transitInfo: string;
  tagline: string;
  isPublished: boolean;
};

export type AdminListingRecord = {
  id: string;
  slug: string;
  title: string;
  monthlyRent: number;
  address: string;
  area: Area;
  nearbySchools: string[];
  layout: LayoutType;
  hasBrokerFee: boolean;
  isFurnished: boolean;
  petPolicy: PetPolicy;
  imageUrls: string[];
  videoUrls: string[];
  description: string;
  transitInfo: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

const areaLabelMap: Record<Area, string> = {
  BACK_BAY: "Back Bay",
  EVERETT: "Everett",
  MALDEN: "Malden",
  ALLSTON: "Allston",
  CAMBRIDGE: "Cambridge",
  SOMERVILLE: "Somerville",
  BROOKLINE: "Brookline"
};

const areaTaglineMap: Record<Area, string> = {
  BACK_BAY: "通勤与城市氛围兼得",
  EVERETT: "精致独居，预算友好",
  MALDEN: "合租友好，节奏从容",
  ALLSTON: "校园生活圈，省心上手",
  CAMBRIDGE: "学术氛围与生活质感并存",
  SOMERVILLE: "生活密度高，街区感鲜明",
  BROOKLINE: "适合稳定长期居住"
};

const layoutLabelMap: Record<LayoutType, string> = {
  STUDIO: "Studio",
  ONE_BED_ONE_BATH: "1B1B",
  TWO_BED_TWO_BATH: "2B2B",
  THREE_BED_TWO_BATH: "3B2B"
};

const petPolicyLabelMap: Record<PetPolicy, string> = {
  OPEN: "不限",
  CATS_ONLY: "仅猫",
  CATS_AND_DOGS: "猫狗均可"
};

const orderedAreaLabels = [
  "Back Bay",
  "Everett",
  "Malden",
  "Allston",
  "Cambridge",
  "Somerville",
  "Brookline"
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
  return orderedAreaLabels.filter((label) => selectedLabels.includes(label));
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
  title: string;
  monthlyRent: number;
  address: string;
  area: Area;
  nearbySchools: string[];
  layout: LayoutType;
  hasBrokerFee: boolean;
  isFurnished: boolean;
  petPolicy: PetPolicy;
  imageUrls: string[];
  videoUrls: string[];
  description: string;
  transitInfo: string | null;
  isPublished: boolean;
};

export function mapToListingViewModel(listing: ListingSource): ListingViewModel {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    monthlyRent: listing.monthlyRent,
    address: listing.address,
    area: getAreaLabel(listing.area),
    nearbySchools: listing.nearbySchools,
    layoutLabel: getLayoutLabel(listing.layout),
    hasBrokerFee: listing.hasBrokerFee,
    isFurnished: listing.isFurnished,
    petPolicyLabel: getPetPolicyLabel(listing.petPolicy),
    imageUrls: listing.imageUrls,
    videoUrls: listing.videoUrls,
    description: listing.description,
    transitInfo: listing.transitInfo ?? "交通信息待补充",
    tagline: getTagline(listing.area),
    isPublished: listing.isPublished
  };
}

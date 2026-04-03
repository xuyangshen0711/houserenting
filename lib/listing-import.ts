import { Area, LayoutType, PetPolicy } from "@prisma/client";

type UnknownRecord = Record<string, unknown>;

type ImportedFloorPlan = {
  name: string;
  layout: LayoutType;
  monthlyRent: number;
  roomSizeSqFt: number | null;
  isFurnished: boolean;
  imageUrls: string[];
};

export type NormalizedImportedListing = {
  slug: string;
  name: string;
  address: string;
  area: Area;
  petPolicy: PetPolicy;
  description: string;
  transitInfo: string | null;
  promotions: string | null;
  parkingFee: number | null;
  hasBrokerFee: boolean;
  acceptsUndergrad: boolean;
  isPublished: boolean;
  nearbySchools: string[];
  imageUrls: string[];
  videoUrls: string[];
  floorPlans: ImportedFloorPlan[];
};

const areaAliasMap: Record<string, Area> = {
  BACK_BAY: Area.BACK_BAY,
  "BACK BAY": Area.BACK_BAY,
  EVERETT: Area.EVERETT,
  MALDEN: Area.MALDEN,
  ALLSTON: Area.ALLSTON,
  CAMBRIDGE: Area.CAMBRIDGE,
  SOMERVILLE: Area.SOMERVILLE,
  BROOKLINE: Area.BROOKLINE
};

const layoutAliasMap: Record<string, LayoutType> = {
  STUDIO: LayoutType.STUDIO,
  "1B1B": LayoutType.ONE_BED_ONE_BATH,
  ONE_BED_ONE_BATH: LayoutType.ONE_BED_ONE_BATH,
  "1 BEDROOM": LayoutType.ONE_BED_ONE_BATH,
  "ONE BEDROOM": LayoutType.ONE_BED_ONE_BATH,
  "2B2B": LayoutType.TWO_BED_TWO_BATH,
  TWO_BED_TWO_BATH: LayoutType.TWO_BED_TWO_BATH,
  "2 BEDROOM": LayoutType.TWO_BED_TWO_BATH,
  "TWO BEDROOM": LayoutType.TWO_BED_TWO_BATH,
  "3B2B": LayoutType.THREE_BED_TWO_BATH,
  THREE_BED_TWO_BATH: LayoutType.THREE_BED_TWO_BATH,
  "3 BEDROOM": LayoutType.THREE_BED_TWO_BATH,
  "THREE BEDROOM": LayoutType.THREE_BED_TWO_BATH
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const matches = value.match(/\d[\d,]*/g);
  if (!matches?.length) {
    return null;
  }

  return Number(matches[0].replaceAll(",", ""));
}

function normalizeArea(value: unknown) {
  const normalized = asString(value).toUpperCase().replaceAll("-", " ");
  return areaAliasMap[normalized] ?? null;
}

function normalizeLayout(value: unknown, fallbackName?: unknown) {
  const candidates = [value, fallbackName];

  for (const candidate of candidates) {
    const normalized = asString(candidate).toUpperCase();
    if (layoutAliasMap[normalized]) {
      return layoutAliasMap[normalized];
    }
  }

  return null;
}

function normalizePetPolicy(value: unknown) {
  const raw = asString(value).toLowerCase();

  if (!raw) {
    return PetPolicy.OPEN;
  }

  if (raw.includes("cat") && !raw.includes("dog")) {
    return PetPolicy.CATS_ONLY;
  }

  if (
    raw.includes("dog") ||
    raw.includes("猫狗") ||
    raw.includes("宠物友好") ||
    raw.includes("pet friendly")
  ) {
    return PetPolicy.CATS_AND_DOGS;
  }

  if (raw.includes("cats_only")) {
    return PetPolicy.CATS_ONLY;
  }

  if (raw.includes("cats_and_dogs")) {
    return PetPolicy.CATS_AND_DOGS;
  }

  return PetPolicy.OPEN;
}

function normalizePromotions(value: unknown) {
  if (Array.isArray(value)) {
    const items = asStringArray(value);
    return items.length ? items.join("; ") : null;
  }

  const text = asString(value);
  return text || null;
}

function slugify(parts: string[]) {
  const base = parts
    .map((part) =>
      part
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
    )
    .filter(Boolean)
    .join("-");

  return base || `listing-${Date.now()}`;
}

function buildDescription(body: UnknownRecord) {
  const sections = [asString(body.description)];

  const utilities = asString(body.utilities);
  if (utilities) {
    sections.push(`Utilities: ${utilities}`);
  }

  const inUnitFeatures = asStringArray(body.in_unit_features);
  if (inUnitFeatures.length) {
    sections.push(`In-unit features: ${inUnitFeatures.join("; ")}`);
  }

  const communityAmenities = asStringArray(body.community_amenities);
  if (communityAmenities.length) {
    sections.push(`Community amenities: ${communityAmenities.join("; ")}`);
  }

  const petPolicyDetails = asString(body.pet_policy);
  if (petPolicyDetails && !sections.some((section) => section.includes(petPolicyDetails))) {
    sections.push(`Pet details: ${petPolicyDetails}`);
  }

  return sections.filter(Boolean).join("\n\n");
}

function getRentRangeFloorPlans(body: UnknownRecord): ImportedFloorPlan[] {
  const floorPlans = Array.isArray(body.floor_plans) ? body.floor_plans : [];
  const rentRange = isRecord(body.rent_range) ? body.rent_range : {};
  const normalizedPlans: Array<ImportedFloorPlan | null> = floorPlans.map((plan) => {
    const name = asString(plan);
    const layout = normalizeLayout(plan);

    if (!name || !layout) {
      return null;
    }

    let rentSource: unknown = null;

    if (layout === LayoutType.STUDIO) {
      rentSource = rentRange.studio;
    } else if (layout === LayoutType.ONE_BED_ONE_BATH) {
      rentSource = rentRange.one_bedroom;
    } else if (layout === LayoutType.TWO_BED_TWO_BATH) {
      rentSource = rentRange.two_bedroom;
    }

    const monthlyRent = parseNumber(rentSource);
    if (!monthlyRent) {
      return null;
    }

    return {
      name,
      layout,
      monthlyRent,
      roomSizeSqFt: null,
      isFurnished: false,
      imageUrls: []
    };
  });

  return normalizedPlans.filter((plan): plan is ImportedFloorPlan => plan !== null);
}

function normalizeFloorPlans(body: UnknownRecord) {
  const source = Array.isArray(body.floorPlans)
    ? body.floorPlans
    : Array.isArray(body.floor_plans)
      ? body.floor_plans
      : [];

  const normalized: Array<ImportedFloorPlan | null> = source.map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const name = asString(item.name) || asString(item.layout) || asString(item.type);
      const layout = normalizeLayout(item.layout, name);
      const monthlyRent = parseNumber(item.monthlyRent ?? item.monthly_rent ?? item.rent);

      if (!name || !layout || !monthlyRent) {
        return null;
      }

      return {
        name,
        layout,
        monthlyRent,
        roomSizeSqFt: parseNumber(item.roomSizeSqFt ?? item.room_size_sqft ?? item.square_feet),
        isFurnished: Boolean(item.isFurnished ?? item.is_furnished),
        imageUrls: asStringArray(item.imageUrls ?? item.image_urls)
      };
    });

  const filtered = normalized.filter((plan): plan is ImportedFloorPlan => plan !== null);

  return filtered.length ? filtered : getRentRangeFloorPlans(body);
}

export function normalizeImportedListing(input: unknown): NormalizedImportedListing {
  if (!isRecord(input)) {
    throw new Error("导入失败：请求体必须是 JSON 对象。");
  }

  const basicInfo = isRecord(input.basic_info) ? input.basic_info : {};

  const name = asString(input.name) || asString(basicInfo.property_name);
  const address = asString(input.address) || asString(basicInfo.full_address);
  const areaSource =
    input.area ??
    basicInfo.neighborhood ??
    input.neighborhood;
  const area = normalizeArea(areaSource);
  const description = buildDescription(input);
  const floorPlans = normalizeFloorPlans(input);

  if (!name) {
    throw new Error("导入失败：缺少房源名称。");
  }

  if (!address) {
    throw new Error("导入失败：缺少详细地址。");
  }

  if (!area) {
    throw new Error("导入失败：无法识别区域，请传 EVERETT 这类枚举或明确街区名。");
  }

  if (!description) {
    throw new Error("导入失败：缺少房源描述。");
  }

  return {
    slug: asString(input.slug) || slugify([name, Area[area].toLowerCase()]),
    name,
    address,
    area,
    petPolicy: normalizePetPolicy(input.petPolicy ?? input.pet_policy),
    description,
    transitInfo: asString(input.transitInfo ?? input.proximity) || null,
    promotions: normalizePromotions(input.promotions),
    parkingFee: parseNumber(input.parkingFee),
    hasBrokerFee: Boolean(input.hasBrokerFee),
    acceptsUndergrad:
      input.acceptsUndergrad === undefined ? true : Boolean(input.acceptsUndergrad),
    isPublished: false,
    nearbySchools: asStringArray(input.nearbySchools),
    imageUrls: asStringArray(input.imageUrls),
    videoUrls: asStringArray(input.videoUrls),
    floorPlans
  };
}

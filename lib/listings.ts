import { prisma } from "@/lib/prisma";
import {
  getAreaEnum,
  getOrderedAreaLabels,
  mapToListingViewModel,
  supportedAreaLabels,
  orderedSchoolLabels,
  type RentSortValue,
  type AdminListingRecord
} from "@/lib/listing-view-model";
import { mockListings } from "@/lib/mock-listings";

function canUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getUniqueAreas() {
  if (!canUseDatabase()) {
    return ["全部", ...getOrderedAreaLabels(mockListings.map((listing) => listing.area))];
  }

  return ["全部", ...supportedAreaLabels];
}

export async function getUniqueSchools() {
  return orderedSchoolLabels;
}

function sortListingsByRent<T extends { monthlyRent: number }>(
  listings: T[],
  sort: RentSortValue
) {
  if (sort === "rent_asc") {
    return [...listings].sort((a, b) => a.monthlyRent - b.monthlyRent);
  }

  if (sort === "rent_desc") {
    return [...listings].sort((a, b) => b.monthlyRent - a.monthlyRent);
  }

  return listings;
}

export async function getFeaturedListings(
  selectedArea = "全部",
  selectedSchool = "全部",
  sort: RentSortValue = "default",
  minRent?: number,
  maxRent?: number
) {
  if (!canUseDatabase()) {
    // For mocks, skipping complete mapping for brevity since we focus on DB
    return [];
  }

  try {
    const areaEnum = selectedArea === "全部" ? null : getAreaEnum(selectedArea);
    const properties = await prisma.property.findMany({
      where: {
        isPublished: true,
        ...(areaEnum ? { area: areaEnum } : {}),
        ...(selectedSchool !== "全部"
          ? {
              nearbySchools: {
                has: selectedSchool
              }
            }
          : {}),
        ...(minRent !== undefined || maxRent !== undefined
          ? {
              floorPlans: {
                some: {
                  monthlyRent: {
                    ...(minRent !== undefined ? { gte: minRent } : {}),
                    ...(maxRent !== undefined ? { lte: maxRent } : {})
                  }
                }
              }
            }
          : {})
      },
      include: {
        floorPlans: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return sortListingsByRent(properties.map(mapToListingViewModel), sort);
  } catch(e) {
    console.error(e);
    return [];
  }
}

export async function getListingBySlug(slug: string) {
  if (!canUseDatabase()) {
    return null;
  }

  try {
    const property = await prisma.property.findUnique({
      where: {
        slug
      },
      include: {
        floorPlans: true
      }
    });

    if (!property || !property.isPublished) {
      return null;
    }

    return mapToListingViewModel(property);
  } catch {
    return null;
  }
}

export async function getAdminListings(): Promise<AdminListingRecord[]> {
  if (!canUseDatabase()) {
    return [];
  }

  try {
    const properties = await prisma.property.findMany({
      orderBy: {
        updatedAt: "desc"
      },
      include: {
        floorPlans: true
      }
    });

    return properties.map((property) => ({
      id: property.id,
      slug: property.slug,
      name: property.name,
      address: property.address,
      area: property.area,
      nearbySchools: property.nearbySchools,
      acceptsUndergrad: property.acceptsUndergrad,
      parkingFee: property.parkingFee,
      hasBrokerFee: property.hasBrokerFee,
      promotions: property.promotions,
      petPolicy: property.petPolicy,
      imageUrls: property.imageUrls,
      videoUrls: property.videoUrls,
      description: property.description,
      transitInfo: property.transitInfo ?? "",
      isPublished: property.isPublished,
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
      floorPlans: property.floorPlans
    }));
  } catch {
    return [];
  }
}

export async function getAdminListingById(id: string): Promise<AdminListingRecord | null> {
  if (!canUseDatabase()) {
    return null;
  }

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        floorPlans: true
      }
    });

    if (!property) {
      return null;
    }

    return {
      id: property.id,
      slug: property.slug,
      name: property.name,
      address: property.address,
      area: property.area,
      nearbySchools: property.nearbySchools,
      acceptsUndergrad: property.acceptsUndergrad,
      parkingFee: property.parkingFee,
      hasBrokerFee: property.hasBrokerFee,
      promotions: property.promotions,
      petPolicy: property.petPolicy,
      imageUrls: property.imageUrls,
      videoUrls: property.videoUrls,
      description: property.description,
      transitInfo: property.transitInfo ?? "",
      isPublished: property.isPublished,
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
      floorPlans: property.floorPlans
    };
  } catch {
    return null;
  }
}

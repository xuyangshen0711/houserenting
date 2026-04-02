import { prisma } from "@/lib/prisma";
import {
  getAreaEnum,
  getAreaLabel,
  getOrderedAreaLabels,
  getOrderedSchoolLabels,
  mapToListingViewModel,
  type RentSortValue,
  type AdminListingRecord
} from "@/lib/listing-view-model";
import { mockListings } from "@/lib/mock-listings";

function canUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getUniqueAreas() {
  if (!canUseDatabase()) {
    return ["全部", ...new Set(mockListings.map((listing) => listing.area))];
  }

  try {
    const areas = await prisma.listing.findMany({
      where: {
        isPublished: true
      },
      select: {
        area: true
      },
      distinct: ["area"]
    });

    const labels = areas.map((item) => getAreaLabel(item.area));
    return ["全部", ...getOrderedAreaLabels(labels)];
  } catch {
    return ["全部", ...new Set(mockListings.map((listing) => listing.area))];
  }
}

export async function getUniqueSchools() {
  if (!canUseDatabase()) {
    return getOrderedSchoolLabels([
      ...new Set(mockListings.flatMap((listing) => listing.nearbySchools))
    ]);
  }

  try {
    const listings = await prisma.listing.findMany({
      where: {
        isPublished: true
      },
      select: {
        nearbySchools: true
      }
    });

    const schools = [
      ...new Set(listings.flatMap((listing) => listing.nearbySchools).filter(Boolean))
    ];

    return getOrderedSchoolLabels(schools);
  } catch {
    return getOrderedSchoolLabels([
      ...new Set(mockListings.flatMap((listing) => listing.nearbySchools))
    ]);
  }
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
    const filteredListings = mockListings.filter((listing) => {
      const areaMatch = selectedArea === "全部" || listing.area === selectedArea;
      const schoolMatch =
        selectedSchool === "全部" || listing.nearbySchools.includes(selectedSchool);
      const minRentMatch = minRent === undefined || listing.monthlyRent >= minRent;
      const maxRentMatch = maxRent === undefined || listing.monthlyRent <= maxRent;

      return areaMatch && schoolMatch && minRentMatch && maxRentMatch;
    });

    return sortListingsByRent(filteredListings, sort);
  }

  try {
    const areaEnum = selectedArea === "全部" ? null : getAreaEnum(selectedArea);
    const listings = await prisma.listing.findMany({
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
              monthlyRent: {
                ...(minRent !== undefined ? { gte: minRent } : {}),
                ...(maxRent !== undefined ? { lte: maxRent } : {})
              }
            }
          : {})
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return sortListingsByRent(listings.map(mapToListingViewModel), sort);
  } catch {
    const filteredListings = mockListings.filter((listing) => {
      const areaMatch = selectedArea === "全部" || listing.area === selectedArea;
      const schoolMatch =
        selectedSchool === "全部" || listing.nearbySchools.includes(selectedSchool);
      const minRentMatch = minRent === undefined || listing.monthlyRent >= minRent;
      const maxRentMatch = maxRent === undefined || listing.monthlyRent <= maxRent;

      return areaMatch && schoolMatch && minRentMatch && maxRentMatch;
    });

    return sortListingsByRent(filteredListings, sort);
  }
}

export async function getListingBySlug(slug: string) {
  if (!canUseDatabase()) {
    return mockListings.find((listing) => listing.slug === slug);
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: {
        slug
      }
    });

    if (!listing || !listing.isPublished) {
      return null;
    }

    return mapToListingViewModel(listing);
  } catch {
    return mockListings.find((listing) => listing.slug === slug) ?? null;
  }
}

export async function getAdminListings(): Promise<AdminListingRecord[]> {
  if (!canUseDatabase()) {
    return [];
  }

  try {
    const listings = await prisma.listing.findMany({
      orderBy: {
        updatedAt: "desc"
      }
    });

    return listings.map((listing) => ({
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      monthlyRent: listing.monthlyRent,
      address: listing.address,
      area: listing.area,
      nearbySchools: listing.nearbySchools,
      layout: listing.layout,
      hasBrokerFee: listing.hasBrokerFee,
      isFurnished: listing.isFurnished,
      petPolicy: listing.petPolicy,
      imageUrls: listing.imageUrls,
      videoUrls: listing.videoUrls,
      description: listing.description,
      transitInfo: listing.transitInfo ?? "",
      isPublished: listing.isPublished,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString()
    }));
  } catch {
    return [];
  }
}

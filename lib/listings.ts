import { mockListings } from "@/lib/mock-listings";

export function getUniqueAreas() {
  return ["全部", ...new Set(mockListings.map((listing) => listing.area))];
}

export function getFeaturedListings(selectedArea = "全部") {
  if (selectedArea === "全部") {
    return mockListings;
  }

  return mockListings.filter((listing) => listing.area === selectedArea);
}

export function getListingBySlug(slug: string) {
  return mockListings.find((listing) => listing.slug === slug);
}

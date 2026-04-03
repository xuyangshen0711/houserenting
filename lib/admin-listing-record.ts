import type { AdminListingRecord, FloorPlanSource } from "@/lib/listing-view-model";

type AdminPropertyRecord = {
  id: string;
  slug: string;
  name: string;
  address: string;
  area: AdminListingRecord["area"];
  nearbySchools: string[];
  petPolicy: AdminListingRecord["petPolicy"];
  acceptsUndergrad: boolean;
  parkingFee: number | null;
  hasBrokerFee: boolean;
  promotions: string | null;
  imageUrls: string[];
  videoUrls: string[];
  description: string;
  transitInfo: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  floorPlans?: FloorPlanSource[];
};

export function toAdminListingRecord(property: AdminPropertyRecord): AdminListingRecord {
  return {
    id: property.id,
    slug: property.slug,
    name: property.name,
    address: property.address,
    area: property.area,
    nearbySchools: property.nearbySchools,
    petPolicy: property.petPolicy,
    acceptsUndergrad: property.acceptsUndergrad,
    parkingFee: property.parkingFee,
    hasBrokerFee: property.hasBrokerFee,
    promotions: property.promotions,
    imageUrls: property.imageUrls,
    videoUrls: property.videoUrls,
    description: property.description,
    transitInfo: property.transitInfo ?? "",
    isPublished: property.isPublished,
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
    floorPlans: property.floorPlans ?? []
  };
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

const CATEGORIES = [
  {
    key: "chinese_restaurant",
    label: "中餐厅",
    keyword: "Chinese restaurant",
  },
  {
    key: "chinese_supermarket",
    label: "中超",
    keyword: "Chinese supermarket Asian grocery",
  },
  {
    key: "supermarket",
    label: "超市",
    keyword: "supermarket grocery store",
  },
  {
    key: "fine_dining",
    label: "高级餐厅",
    keyword: "fine dining restaurant",
  },
];

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status === "OK" && data.results[0]) {
    return data.results[0].geometry.location;
  }
  return null;
}

async function searchNearby(lat: number, lng: number, keyword: string) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&keyword=${encodeURIComponent(keyword)}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK") return [];

  return data.results.slice(0, 5).map((place: {
    place_id: string;
    name: string;
    rating?: number;
    user_ratings_total?: number;
    vicinity?: string;
    geometry: { location: { lat: number; lng: number } };
  }) => ({
    placeId: place.place_id,
    name: place.name,
    rating: place.rating ?? null,
    reviewCount: place.user_ratings_total ?? 0,
    vicinity: place.vicinity ?? "",
    distanceKm: getDistanceKm(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
  }));
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export async function GET(req: NextRequest) {
  const propertyId = req.nextUrl.searchParams.get("propertyId");
  if (!propertyId) return NextResponse.json({ error: "missing propertyId" }, { status: 400 });

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Return cache if exists
  if (property.nearbyPlacesCache) {
    return NextResponse.json(property.nearbyPlacesCache);
  }

  // Geocode if no lat/lng
  let lat = property.latitude;
  let lng = property.longitude;
  if (!lat || !lng) {
    const coords = await geocodeAddress(property.address);
    if (!coords) return NextResponse.json({ error: "geocode failed" }, { status: 500 });
    lat = coords.lat;
    lng = coords.lng;
    await prisma.property.update({ where: { id: propertyId }, data: { latitude: lat, longitude: lng } });
  }

  // Fetch all categories in parallel
  const results = await Promise.all(
    CATEGORIES.map(async (cat) => ({
      key: cat.key,
      label: cat.label,
      places: await searchNearby(lat!, lng!, cat.keyword),
    }))
  );

  // Cache to DB
  await prisma.property.update({
    where: { id: propertyId },
    data: { nearbyPlacesCache: results },
  });

  return NextResponse.json(results);
}

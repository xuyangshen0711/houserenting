import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

const CATEGORIES = [
  { key: "chinese_restaurant", label: "中餐厅", query: "Chinese restaurant" },
  { key: "chinese_supermarket", label: "中超", query: "Chinese supermarket Asian grocery" },
  { key: "supermarket", label: "超市", query: "supermarket grocery store" },
  { key: "fine_dining", label: "高级餐厅", query: "fine dining restaurant" },
];

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status === "OK" && data.results[0]) {
    return data.results[0].geometry.location;
  }
  console.error("Geocode failed:", data.status, data.error_message);
  return null;
}

// Uses new Places API (Text Search) — compatible with "Places API (New)"
async function searchByText(lat: number, lng: number, query: string) {
  const body = {
    textQuery: query,
    maxResultCount: 5,
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 3000,
      },
    },
  };

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.rating,places.userRatingCount,places.formattedAddress,places.location",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!data.places) {
    console.error("Places API error:", JSON.stringify(data));
    return [];
  }

  return data.places.map((place: {
    id: string;
    displayName: { text: string };
    rating?: number;
    userRatingCount?: number;
    formattedAddress?: string;
    location: { latitude: number; longitude: number };
  }) => ({
    placeId: place.id,
    name: place.displayName.text,
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? 0,
    vicinity: place.formattedAddress ?? "",
    distanceKm: getDistanceKm(lat, lng, place.location.latitude, place.location.longitude),
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

// Admin: clear all caches so they re-fetch
export async function DELETE() {
  await prisma.property.updateMany({ data: { nearbyPlacesCache: { set: null } } });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const propertyId = req.nextUrl.searchParams.get("propertyId");
  if (!propertyId) return NextResponse.json({ error: "missing propertyId" }, { status: 400 });

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Return cache if exists (skip if refresh=true)
  const refresh = req.nextUrl.searchParams.get("refresh") === "true";
  if (property.nearbyPlacesCache && !refresh) {
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
      places: await searchByText(lat!, lng!, cat.query),
    }))
  );

  // Cache to DB
  await prisma.property.update({
    where: { id: propertyId },
    data: { nearbyPlacesCache: results },
  });

  return NextResponse.json(results);
}

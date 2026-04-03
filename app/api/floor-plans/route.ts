import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSessionValue } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  if (cookieStore.get("boston-nest-admin")?.value !== createAdminSessionValue()) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const { propertyId, name, layout, monthlyRent, roomSizeSqFt, isFurnished, imageUrls } = body;

  try {
    const floorPlan = await prisma.floorPlan.create({
      data: {
        propertyId,
        name,
        layout,
        monthlyRent: Number(monthlyRent),
        roomSizeSqFt: roomSizeSqFt ? Number(roomSizeSqFt) : null,
        isFurnished: Boolean(isFurnished),
        imageUrls: Array.isArray(imageUrls) ? imageUrls : []
      }
    });

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (property) {
      revalidatePath(`/listings/${property.slug}`);
      revalidatePath("/");
    }

    return NextResponse.json({ message: "户型创建成功", floorPlan });
  } catch (err) {
    return NextResponse.json({ message: "创建户型失败" }, { status: 500 });
  }
}

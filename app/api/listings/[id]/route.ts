import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminSessionValue } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import type { AdminListingRecord } from "@/lib/listing-view-model";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function toAdminListingRecord(property: {
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
}): AdminListingRecord {
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
    floorPlans: []
  };
}

async function assertAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("boston-nest-admin")?.value === createAdminSessionValue();
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ message: "未授权的请求，请先通过管理员后台登录。" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ message: "未检测到 DATABASE_URL，请先配置数据库环境变量。" }, { status: 503 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();

    if (body.imageUrls !== undefined && (!Array.isArray(body.imageUrls) || body.imageUrls.length === 0)) {
      return NextResponse.json({ message: "请至少保留 1 张照片。" }, { status: 400 });
    }

    const existing = await prisma.property.findUnique({
      where: { id },
      select: { slug: true }
    });

    if (!existing) {
      return NextResponse.json({ message: "没有找到对应的记录。" }, { status: 404 });
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.slug !== undefined ? { slug: body.slug } : {}),
        ...(body.address !== undefined ? { address: body.address } : {}),
        ...(body.area !== undefined ? { area: body.area } : {}),
        ...(body.nearbySchools !== undefined ? { nearbySchools: body.nearbySchools } : {}),
        ...(body.hasBrokerFee !== undefined ? { hasBrokerFee: Boolean(body.hasBrokerFee) } : {}),
        ...(body.acceptsUndergrad !== undefined ? { acceptsUndergrad: Boolean(body.acceptsUndergrad) } : {}),
        ...(body.parkingFee !== undefined ? { parkingFee: body.parkingFee !== null ? Number(body.parkingFee) : null } : {}),
        ...(body.promotions !== undefined ? { promotions: body.promotions || null } : {}),
        ...(body.isPublished !== undefined ? { isPublished: Boolean(body.isPublished) } : {}),
        ...(body.petPolicy !== undefined ? { petPolicy: body.petPolicy } : {}),
        ...(body.imageUrls !== undefined ? { imageUrls: body.imageUrls } : {}),
        ...(body.videoUrls !== undefined ? { videoUrls: body.videoUrls } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.transitInfo !== undefined ? { transitInfo: body.transitInfo } : {})
      }
    });

    revalidatePath("/");
    revalidatePath(`/listings/${existing.slug}`);
    revalidatePath(`/listings/${property.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({
      message: "属性已更新。",
      listing: toAdminListingRecord(property)
    });
  } catch (error) {
    return NextResponse.json({
      message: "更新资产时出现错误。",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ message: "未授权的请求，请先通过管理员后台登录。" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ message: "未检测到 DATABASE_URL，请先配置数据库环境变量。" }, { status: 503 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.property.findUnique({
      where: { id },
      select: { slug: true }
    });

    if (!existing) {
      return NextResponse.json({ message: "没有找到。" }, { status: 404 });
    }

    await prisma.property.delete({
      where: { id }
    });

    revalidatePath("/");
    revalidatePath(`/listings/${existing.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({ message: "已删除。" });
  } catch (error) {
    return NextResponse.json({
      message: "删除时出现错误。",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

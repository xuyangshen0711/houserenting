import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminSessionValue } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import type { AdminListingRecord } from "@/lib/listing-view-model";

function toAdminListingRecord(listing: {
  id: string;
  slug: string;
  title: string;
  monthlyRent: number;
  address: string;
  area: AdminListingRecord["area"];
  nearbySchools: string[];
  layout: AdminListingRecord["layout"];
  hasBrokerFee: boolean;
  isFurnished: boolean;
  isPublished: boolean;
  petPolicy: AdminListingRecord["petPolicy"];
  imageUrls: string[];
  videoUrls: string[];
  description: string;
  transitInfo: string | null;
  createdAt: Date;
  updatedAt: Date;
}): AdminListingRecord {
  return {
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
    isPublished: listing.isPublished,
    petPolicy: listing.petPolicy,
    imageUrls: listing.imageUrls,
    videoUrls: listing.videoUrls,
    description: listing.description,
    transitInfo: listing.transitInfo ?? "",
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString()
  };
}

export async function POST(request: Request) {
  const cookieStore = await cookies();

  if (cookieStore.get("boston-nest-admin")?.value !== createAdminSessionValue()) {
    return NextResponse.json(
      {
        message: "未授权的请求，请先通过管理员后台登录。"
      },
      { status: 401 }
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        message: "未检测到 DATABASE_URL，请先配置数据库环境变量。"
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    if (!Array.isArray(body.imageUrls) || body.imageUrls.length === 0) {
      return NextResponse.json(
        {
          message: "请至少上传 1 张房源图片。"
        },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        slug: body.slug,
        title: body.title,
        monthlyRent: Number(body.monthlyRent),
        address: body.address,
        area: body.area,
        nearbySchools: body.nearbySchools ?? [],
        layout: body.layout,
        hasBrokerFee: Boolean(body.hasBrokerFee),
        isFurnished: Boolean(body.isFurnished),
        isPublished: body.isPublished ?? true,
        petPolicy: body.petPolicy,
        imageUrls: body.imageUrls,
        videoUrls: body.videoUrls ?? [],
        description: body.description,
        transitInfo: body.transitInfo
      }
    });

    revalidatePath("/");
    revalidatePath(`/listings/${listing.slug}`);

    return NextResponse.json({
      message: "房源已成功写入数据库。",
      listing: toAdminListingRecord(listing)
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "保存房源时出现错误，请检查 Prisma 枚举值和数据库连接。",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

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

async function assertAdmin() {
  const cookieStore = await cookies();

  return cookieStore.get("boston-nest-admin")?.value === createAdminSessionValue();
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await assertAdmin())) {
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

  const { id } = await context.params;

  try {
    const body = await request.json();

    if (
      body.imageUrls !== undefined &&
      (!Array.isArray(body.imageUrls) || body.imageUrls.length === 0)
    ) {
      return NextResponse.json(
        {
          message: "请至少保留 1 张房源图片。"
        },
        { status: 400 }
      );
    }

    const existing = await prisma.listing.findUnique({
      where: {
        id
      },
      select: {
        slug: true
      }
    });

    if (!existing) {
      return NextResponse.json(
        {
          message: "没有找到对应的房源。"
        },
        { status: 404 }
      );
    }

    const listing = await prisma.listing.update({
      where: {
        id
      },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.slug !== undefined ? { slug: body.slug } : {}),
        ...(body.monthlyRent !== undefined
          ? { monthlyRent: Number(body.monthlyRent) }
          : {}),
        ...(body.address !== undefined ? { address: body.address } : {}),
        ...(body.area !== undefined ? { area: body.area } : {}),
        ...(body.nearbySchools !== undefined
          ? { nearbySchools: body.nearbySchools }
          : {}),
        ...(body.layout !== undefined ? { layout: body.layout } : {}),
        ...(body.hasBrokerFee !== undefined
          ? { hasBrokerFee: Boolean(body.hasBrokerFee) }
          : {}),
        ...(body.isFurnished !== undefined
          ? { isFurnished: Boolean(body.isFurnished) }
          : {}),
        ...(body.isPublished !== undefined
          ? { isPublished: Boolean(body.isPublished) }
          : {}),
        ...(body.petPolicy !== undefined ? { petPolicy: body.petPolicy } : {}),
        ...(body.imageUrls !== undefined ? { imageUrls: body.imageUrls } : {}),
        ...(body.videoUrls !== undefined ? { videoUrls: body.videoUrls } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.transitInfo !== undefined ? { transitInfo: body.transitInfo } : {})
      }
    });

    revalidatePath("/");
    revalidatePath(`/listings/${existing.slug}`);
    revalidatePath(`/listings/${listing.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({
      message: "房源已更新。",
      listing: toAdminListingRecord(listing)
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "更新房源时出现错误。",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  if (!(await assertAdmin())) {
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

  const { id } = await context.params;

  try {
    const existing = await prisma.listing.findUnique({
      where: {
        id
      },
      select: {
        slug: true
      }
    });

    if (!existing) {
      return NextResponse.json(
        {
          message: "没有找到对应的房源。"
        },
        { status: 404 }
      );
    }

    await prisma.listing.delete({
      where: {
        id
      }
    });

    revalidatePath("/");
    revalidatePath(`/listings/${existing.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({
      message: "房源已删除。"
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "删除房源时出现错误。",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

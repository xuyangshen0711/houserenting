import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSessionValue } from "@/lib/admin";
import { toAdminListingRecord } from "@/lib/admin-listing-record";
import { normalizeImportedListing } from "@/lib/listing-import";
import { resolvePropertySlug } from "@/lib/property-slug";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  if (cookieStore.get("boston-nest-admin")?.value !== createAdminSessionValue()) {
    return NextResponse.json(
      { message: "未授权的请求，请先通过管理员后台登录。" },
      { status: 401 }
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { message: "未检测到 DATABASE_URL，请先配置数据库环境变量。" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const normalized = normalizeImportedListing(body);
    const slug = await resolvePropertySlug({
      desiredSlug: normalized.slug,
      name: normalized.name
    });

    const property = await prisma.property.create({
      data: {
        slug,
        name: normalized.name,
        address: normalized.address,
        area: normalized.area,
        petPolicy: normalized.petPolicy,
        description: normalized.description,
        transitInfo: normalized.transitInfo,
        promotions: normalized.promotions,
        parkingFee: normalized.parkingFee,
        hasBrokerFee: normalized.hasBrokerFee,
        acceptsUndergrad: normalized.acceptsUndergrad,
        isPublished: false,
        nearbySchools: normalized.nearbySchools,
        imageUrls: normalized.imageUrls,
        videoUrls: normalized.videoUrls,
        floorPlans: normalized.floorPlans.length
          ? {
              create: normalized.floorPlans
            }
          : undefined
      },
      include: {
        floorPlans: true
      }
    });

    revalidatePath("/admin");
    revalidatePath("/");

    return NextResponse.json({
      message: normalized.imageUrls.length
        ? "房源已导入数据库，当前默认保持未发布。"
        : "房源已导入数据库，但还缺少主图，请到后台补充后再发布。",
      listing: toAdminListingRecord({
        ...property,
        floorPlanDiagrams: (property.floorPlanDiagrams as Record<string, string[]>) ?? null
      })
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "导入房源失败，请检查 Grok JSON 字段。",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 400 }
    );
  }
}

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminSessionValue } from "@/lib/admin";
import { toAdminListingRecord } from "@/lib/admin-listing-record";
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
    const slug = await resolvePropertySlug({
      desiredSlug: typeof body.slug === "string" ? body.slug : "",
      name: String(body.name ?? "")
    });

    if (!Array.isArray(body.imageUrls) || body.imageUrls.length === 0) {
      return NextResponse.json(
        { message: "请至少为大楼上传 1 张全局展示图片。" },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({
      data: {
        slug,
        name: body.name,
        address: body.address,
        area: body.area,
        nearbySchools: body.nearbySchools ?? [],
        petPolicy: body.petPolicy,
        acceptsUndergrad: Boolean(body.acceptsUndergrad ?? true),
        parkingFee: body.parkingFee ? Number(body.parkingFee) : null,
        hasBrokerFee: Boolean(body.hasBrokerFee),
        promotions: body.promotions || null,
        isPublished: body.isPublished ?? true,
        imageUrls: body.imageUrls,
        videoUrls: body.videoUrls ?? [],
        description: body.description,
        transitInfo: body.transitInfo
      },
      include: {
        floorPlans: true
      }
    });

    revalidatePath("/");
    revalidatePath(`/listings/${property.slug}`);

    return NextResponse.json({
      message: "公寓已成功写入数据库。",
      listing: toAdminListingRecord({
        ...property,
        floorPlanDiagrams: (property.floorPlanDiagrams as Record<string, string[]>) ?? null
      })
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "保存时出现错误，请检查表单字段和数据库。",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

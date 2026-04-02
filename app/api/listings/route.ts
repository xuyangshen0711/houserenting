import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminSessionValue } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

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
    const listing = await prisma.listing.create({
      data: {
        slug: body.slug,
        title: body.title,
        monthlyRent: Number(body.monthlyRent),
        address: body.address,
        area: body.area,
        layout: body.layout,
        hasBrokerFee: Boolean(body.hasBrokerFee),
        isFurnished: Boolean(body.isFurnished),
        petPolicy: body.petPolicy,
        imageUrls: body.imageUrls,
        description: body.description,
        transitInfo: body.transitInfo
      }
    });

    revalidatePath("/");
    revalidatePath(`/listings/${listing.slug}`);

    return NextResponse.json({
      message: "房源已成功写入数据库。",
      listing
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

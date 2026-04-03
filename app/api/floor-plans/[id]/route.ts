import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSessionValue } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type RouteContext = { params: Promise<{ id: string }> };

async function assertAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("boston-nest-admin")?.value === createAdminSessionValue();
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ message: "未授权的请求" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { name, layout, monthlyRent, roomSizeSqFt, isFurnished, imageUrls } = body;

    const floorPlan = await prisma.floorPlan.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(layout !== undefined ? { layout } : {}),
        ...(monthlyRent !== undefined ? { monthlyRent: Number(monthlyRent) } : {}),
        ...(roomSizeSqFt !== undefined ? { roomSizeSqFt: roomSizeSqFt ? Number(roomSizeSqFt) : null } : {}),
        ...(isFurnished !== undefined ? { isFurnished: Boolean(isFurnished) } : {}),
        ...(imageUrls !== undefined ? { imageUrls } : {})
      },
      include: { property: true }
    });

    revalidatePath(`/listings/${floorPlan.property.slug}`);
    revalidatePath("/");

    return NextResponse.json({ message: "户型已更新", floorPlan });
  } catch (error) {
    return NextResponse.json({ message: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const floorPlan = await prisma.floorPlan.delete({
      where: { id },
      include: { property: true }
    });

    revalidatePath(`/listings/${floorPlan.property.slug}`);
    revalidatePath("/");

    return NextResponse.json({ message: "户型已删除" });
  } catch (error) {
    return NextResponse.json({ message: "删除时出现错误" }, { status: 500 });
  }
}

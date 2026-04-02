import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSessionValue } from "@/lib/admin";
import path from "path";
import fs from "fs/promises";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  // Validate admin token
  if (cookieStore.get("boston-nest-admin")?.value !== createAdminSessionValue()) {
    return NextResponse.json(
      { message: "未授权的请求，请先通过管理员后台登录。" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ message: "未找到上传的文件。" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    // Ensure the directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      // Sanitize file name
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${uniqueSuffix}-${safeName}`;
      
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, buffer);
      
      urls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "文件保存失败。" }, { status: 500 });
  }
}

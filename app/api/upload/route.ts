import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSessionValue } from "@/lib/admin";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    const urls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      const secureUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: "listings", // All uploads will be organized in this folder
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result.secure_url);
            } else {
              reject(new Error("Unknown Cloudinary error"));
            }
          }
        );
        uploadStream.end(buffer);
      });
      
      urls.push(secureUrl);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Cloudinary Upload error:", error);
    return NextResponse.json({ message: "图床上传失败，请检查 Cloudinary 密钥。" }, { status: 500 });
  }
}

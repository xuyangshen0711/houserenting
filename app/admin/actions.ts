"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSessionValue } from "@/lib/admin";

export async function unlockAdmin(formData: FormData) {
  const submittedPassword = String(formData.get("password") ?? "");
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "bostonnest";

  if (submittedPassword !== expectedPassword) {
    redirect("/admin?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set("boston-nest-admin", createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  redirect("/admin");
}

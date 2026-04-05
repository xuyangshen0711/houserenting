import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminListingCreator } from "@/components/admin-listing-creator";
import { createAdminSessionValue } from "@/lib/admin";

export default async function AdminListingCreatePage() {
  const cookieStore = await cookies();
  const isAuthed =
    cookieStore.get("boston-nest-admin")?.value === createAdminSessionValue();

  if (!isAuthed) {
    redirect("/admin");
  }

  return (
    <main className="page-shell pb-20">
      <AdminListingCreator />
    </main>
  );
}

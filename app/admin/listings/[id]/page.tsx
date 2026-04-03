import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminListingEditor } from "@/components/admin-listing-editor";
import { createAdminSessionValue } from "@/lib/admin";
import { getAdminListingById } from "@/lib/listings";

type AdminListingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminListingPage({ params }: AdminListingPageProps) {
  const cookieStore = await cookies();
  const isAuthed =
    cookieStore.get("boston-nest-admin")?.value === createAdminSessionValue();

  if (!isAuthed) {
    redirect("/admin");
  }

  const { id } = await params;
  const listing = await getAdminListingById(id);

  if (!listing) {
    redirect("/admin");
  }

  return (
    <main className="page-shell pb-20">
      <AdminListingEditor listing={listing} />
    </main>
  );
}

import Link from "next/link";
import { cookies } from "next/headers";
import { AdminDashboard } from "@/components/admin-dashboard";
import { unlockAdmin } from "@/app/admin/actions";
import { createAdminSessionValue } from "@/lib/admin";
import { getAdminListings } from "@/lib/listings";

type AdminPageProps = {
  searchParams?: Promise<{
    error?: string;
    created?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) ?? {};
  const cookieStore = await cookies();
  const isAuthed =
    cookieStore.get("boston-nest-admin")?.value === createAdminSessionValue();
  const databaseReady = Boolean(process.env.DATABASE_URL);

  if (!isAuthed) {
    return (
      <main className="page-shell flex min-h-screen items-center py-10">
        <section className="content-wrap">
          <div className="mx-auto max-w-lg rounded-[2rem] border border-white/40 bg-white/70 p-8 shadow-glass backdrop-blur-xl">
            <p className="section-label">私密入口</p>
            <h1 className="mt-5 text-3xl font-semibold text-slate-950">
              管理员后台
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              输入后台密码后即可进入房源管理页面。部署前请在环境变量里设置
              {" "}
              <code>ADMIN_PASSWORD</code>
              。
            </p>

            <form action={unlockAdmin} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  访问密码
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none transition focus:border-slate-400"
                  placeholder="输入管理员密码"
                />
              </label>

              {params.error ? (
                <p className="text-sm text-rose-500">密码不正确，请重试。</p>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                解锁后台
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  const listings = await getAdminListings();

  return (
    <main className="page-shell pb-20">
      <section className="content-wrap pt-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="section-label">后台管理</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              管理你的公寓大楼
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              在这里集中管理房源：新增、编辑、上下架、补图和查看当前状态。
            </p>
          </div>

          <Link
            href="/admin/listings/new"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            新建公寓
          </Link>
        </div>
      </section>

      <section className="content-wrap pt-10">
        <AdminDashboard
          initialListings={listings}
          databaseReady={databaseReady}
          initialStatus={params.created ? "公寓已创建，可以继续补图或管理户型。" : ""}
        />
      </section>
    </main>
  );
}

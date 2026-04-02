import { cookies } from "next/headers";
import { AdminListingForm } from "@/components/admin-listing-form";
import { unlockAdmin } from "@/app/admin/actions";
import { createAdminSessionValue } from "@/lib/admin";

type AdminPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) ?? {};
  const cookieStore = await cookies();
  const isAuthed =
    cookieStore.get("boston-nest-admin")?.value === createAdminSessionValue();

  if (!isAuthed) {
    return (
      <main className="page-shell flex min-h-screen items-center py-10">
        <section className="content-wrap">
          <div className="mx-auto max-w-lg rounded-[2rem] border border-white/40 bg-white/70 p-8 shadow-glass backdrop-blur-xl">
            <p className="section-label">私密入口</p>
            <h1 className="mt-5 text-3xl font-semibold text-slate-950">管理员后台</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              输入你的后台密码后，即可进入房源录入页面。部署前请在环境变量里设置 `ADMIN_PASSWORD`。
            </p>

            <form action={unlockAdmin} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">访问密码</span>
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

  return (
    <main className="page-shell pb-20">
      <section className="content-wrap pt-10">
        <div className="max-w-3xl">
          <p className="section-label">后台录入</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            录入一套值得被认真展示的房源
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            这里是你的私密后台。上传图片后会自动推送到 Cloudinary，再把返回的 URL
            一起写入数据库，方便首页和详情页统一使用。
          </p>
        </div>
      </section>

      <section className="content-wrap pt-10">
        <AdminListingForm />
      </section>
    </main>
  );
}

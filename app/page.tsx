import { AreaFilter } from "@/components/area-filter";
import { ListingCard } from "@/components/listing-card";
import { getFeaturedListings, getUniqueAreas } from "@/lib/listings";

type HomePageProps = {
  searchParams?: Promise<{
    area?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const selectedArea = params.area ?? "全部";
  const listings = getFeaturedListings(selectedArea);
  const areas = getUniqueAreas();

  return (
    <main className="page-shell pb-20">
      <section className="content-wrap pt-6 sm:pt-8">
        <div className="glass-panel flex items-center justify-between rounded-full px-4 py-3 text-sm text-slate-700 sm:px-6">
          <span className="font-medium">Boston Nest</span>
          <span className="text-slate-500">波士顿精选租房</span>
        </div>
      </section>

      <section className="content-wrap relative pt-16 sm:pt-24">
        <div className="max-w-4xl">
          <span className="section-label">Boston Nest · 精选住居</span>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 sm:text-7xl">
            <span className="headline-gradient">在波士顿，遇见你的理想居所。</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            面向华人留学生与职场人士的高质量房源平台。我们用更克制的设计、更清晰的信息和更舒适的浏览节奏，帮你更快找到适合自己的家。
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="glass-panel rounded-[2rem] p-5">
            <p className="text-sm text-slate-500">精选区域</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">Back Bay · Malden · Everett</p>
          </div>
          <div className="glass-panel rounded-[2rem] p-5">
            <p className="text-sm text-slate-500">房源风格</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">通勤友好，采光优秀，配置完整</p>
          </div>
          <div className="rounded-[2rem] bg-slate-950 px-5 py-6 text-white shadow-float">
            <p className="text-sm text-white/70">体验目标</p>
            <p className="mt-2 text-2xl font-semibold">像逛 Apple 官网一样看房</p>
          </div>
        </div>
      </section>

      <section className="content-wrap pt-14 sm:pt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="section-label">区域筛选</span>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950 sm:text-3xl">用更轻松的方式，缩小你的选择范围</h2>
          </div>
          <p className="hidden text-sm text-slate-500 sm:block">当前：{selectedArea}</p>
        </div>

        <AreaFilter areas={areas} selectedArea={selectedArea} />
      </section>

      <section className="content-wrap pt-10">
        <div className="grid auto-rows-[320px] grid-cols-1 gap-5 md:grid-cols-6">
          {listings.map((listing, index) => (
            <ListingCard key={listing.slug} listing={listing} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}

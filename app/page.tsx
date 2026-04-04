import { HomeFilters } from "@/components/home-filters";
import { HeroSection } from "@/components/hero-section";
import { ListingCard } from "@/components/listing-card";
import {
  getFeaturedListings,
  getUniqueAreas,
  getUniqueSchools
} from "@/lib/listings";
import { type RentSortValue } from "@/lib/listing-view-model";

type HomePageProps = {
  searchParams?: Promise<{
    area?: string;
    school?: string;
    sort?: RentSortValue;
    minRent?: string;
    maxRent?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const selectedArea = params.area ?? "全部";
  const selectedSchool = params.school ?? "全部";
  const selectedSort = params.sort ?? "default";
  const minRent = params.minRent ?? "";
  const maxRent = params.maxRent ?? "";
  const parsedMinRent = minRent ? Number(minRent) : undefined;
  const parsedMaxRent = maxRent ? Number(maxRent) : undefined;

  const listings = await getFeaturedListings(
    selectedArea,
    selectedSchool,
    selectedSort,
    Number.isFinite(parsedMinRent) ? parsedMinRent : undefined,
    Number.isFinite(parsedMaxRent) ? parsedMaxRent : undefined
  );
  const areas = await getUniqueAreas();
  const schools = await getUniqueSchools();

  const rentSummary =
    selectedSort === "rent_asc"
      ? "低到高"
      : selectedSort === "rent_desc"
        ? "高到低"
        : "默认";
  const budgetSummary =
    minRent || maxRent
      ? `${minRent || "不限"} - ${maxRent || "不限"}`
      : "未设置预算";

  return (
    <main className="page-shell pb-20">
      {/* Ambient orb 3 — pink, bottom */}
      <div className="aura-orb" aria-hidden="true" />

      {/* ─── Top nav bar ──────────────────────────────────── */}
      <section className="content-wrap pt-6 sm:pt-8">
        <div className="flex items-center justify-between rounded-full px-5 py-3 text-sm" style={{ border: "1px solid rgba(15,23,40,0.08)", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
          <span className="logo-text text-base">Aura Boston</span>
          <span className="font-light tracking-wide text-slate-400">波士顿精选租房</span>
        </div>
      </section>

      {/* ─── Hero (animated client component) ────────────── */}
      <HeroSection
        selectedArea={selectedArea}
        selectedSchool={selectedSchool}
        rentSummary={rentSummary}
      />

      {/* ─── Filters ──────────────────────────────────────── */}
      <section className="content-wrap pt-16 sm:pt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="section-label">三类筛选</span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              开始找寻您的新家
            </h2>
          </div>
          <p className="hidden text-xs font-light tracking-wide text-slate-400 sm:block">
            当前：{selectedArea} · {selectedSchool} · {rentSummary} · {budgetSummary}
          </p>
        </div>

        <HomeFilters
          areas={areas}
          schools={schools}
          selectedArea={selectedArea}
          selectedSchool={selectedSchool}
          selectedSort={selectedSort}
          minRent={minRent}
          maxRent={maxRent}
        />
      </section>

      {/* ─── Listings grid ────────────────────────────────── */}
      <section className="content-wrap pt-10">
        {listings.length ? (
          <div className="grid auto-rows-[320px] grid-cols-1 gap-5 md:grid-cols-6">
            {listings.map((listing, index) => (
              <ListingCard key={listing.slug} listing={listing} index={index} />
            ))}
          </div>
        ) : (
          <div className="glass-filter rounded-[2rem] p-8 text-center">
            <p className="text-lg font-bold text-slate-950">这个区域暂时还没有已发布房源</p>
            <p className="mt-3 text-sm font-light leading-7 text-slate-500">
              你可以切换其他区域看看，或者稍后再回来刷新。后台新增并上架后，这里会自动出现。
            </p>
          </div>
        )}
      </section>

      {/* ─── Contact footer ───────────────────────────────── */}
      <section className="content-wrap pt-12 sm:pt-16">
        <div className="glass-filter rounded-[2rem] p-6 sm:p-8">
          <span className="section-label">继续深入聊一聊</span>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            有心仪房源，想看更多视频，欢迎直接联系
          </h2>
          <p className="mt-3 text-sm font-light leading-7 text-slate-500">
            添加微信：
            <span className="ml-2 font-semibold tracking-widest text-slate-900">Aurabostonhomes</span>
          </p>
        </div>
      </section>
    </main>
  );
}

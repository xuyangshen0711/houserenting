import { HomeFilters } from "@/components/home-filters";
import { ListingCard } from "@/components/listing-card";
import {
  getFeaturedListings,
  getUniqueAreas,
  getUniqueSchools
} from "@/lib/listings";
import { getSchoolDisplayLabel, type RentSortValue } from "@/lib/listing-view-model";

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
          <a href="#area-section" className="glass-panel block rounded-[2rem] p-5 transition hover:scale-[1.01]">
            <p className="text-sm text-slate-500">地区分类</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {selectedArea === "全部" ? "Back Bay · Malden · Everett" : selectedArea}
            </p>
          </a>
          <a href="#school-section" className="glass-panel block rounded-[2rem] p-5 transition hover:scale-[1.01]">
            <p className="text-sm text-slate-500">大学分类</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {selectedSchool === "全部"
                ? "BU · NEU · Harvard"
                : `${getSchoolDisplayLabel(selectedSchool)} 附近推荐`}
            </p>
          </a>
          <a
            href="#rent-section"
            className="glass-panel block rounded-[2rem] px-5 py-6 transition hover:scale-[1.01]"
          >
            <p className="text-sm text-slate-500">房租分类</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {rentSummary === "默认" ? "客户可自选升序或降序" : `当前按房租${rentSummary}排列`}
            </p>
          </a>
        </div>
      </section>

      <section className="content-wrap pt-14 sm:pt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="section-label">三类筛选</span>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950 sm:text-3xl">
              先看地区，再看学校，最后按房租排序
            </h2>
          </div>
          <p className="hidden text-sm text-slate-500 sm:block">
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

      <section className="content-wrap pt-10">
        {listings.length ? (
          <div className="grid auto-rows-[320px] grid-cols-1 gap-5 md:grid-cols-6">
            {listings.map((listing, index) => (
              <ListingCard key={listing.slug} listing={listing} index={index} />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-[2rem] p-8 text-center">
            <p className="text-lg font-semibold text-slate-950">这个区域暂时还没有已发布房源</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              你可以切换其他区域看看，或者稍后再回来刷新。后台新增并上架后，这里会自动出现。
            </p>
          </div>
        )}
      </section>

      <section className="content-wrap pt-12 sm:pt-16">
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <p className="section-label">继续深入聊一聊</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            如果有心仪房源想继续深入聊天
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            欢迎直接添加微信：
            <span className="ml-2 font-semibold tracking-wide text-slate-950">UOLOinxx</span>
          </p>
        </div>
      </section>
    </main>
  );
}

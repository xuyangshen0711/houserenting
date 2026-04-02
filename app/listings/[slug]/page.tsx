import Image from "next/image";
import Link from "next/link";
import { BedDouble, MapPin, PawPrint, Sofa, TrainFront, Wallet } from "lucide-react";
import { notFound } from "next/navigation";
import { getListingBySlug } from "@/lib/listings";

type ListingDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const infoCards = [
    {
      icon: Wallet,
      label: "月租金",
      value: `US$ ${listing.monthlyRent.toLocaleString()}`
    },
    {
      icon: MapPin,
      label: "位置",
      value: `${listing.area} · ${listing.address}`
    },
    {
      icon: TrainFront,
      label: "交通",
      value: listing.transitInfo
    },
    {
      icon: BedDouble,
      label: "房型",
      value: listing.layoutLabel
    },
    {
      icon: Sofa,
      label: "家具",
      value: listing.isFurnished ? "可拎包入住" : "可自行配置"
    },
    {
      icon: PawPrint,
      label: "宠物",
      value: listing.petPolicyLabel
    }
  ];

  return (
    <main className="page-shell pb-20">
      <section className="content-wrap pt-6 sm:pt-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="glass-panel rounded-full px-4 py-3 text-sm font-medium text-slate-700"
          >
            返回首页
          </Link>
          <div className="section-label">{listing.area}</div>
        </div>
      </section>

      <section className="content-wrap pt-10 sm:pt-14">
        <div className="max-w-3xl">
          <p className="text-sm tracking-[0.2em] text-slate-500">房源详情</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            {listing.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">{listing.description}</p>
        </div>
      </section>

      <section className="content-wrap pt-10">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass-panel relative min-h-[420px] overflow-hidden rounded-[2rem] md:col-span-2">
            <Image
              src={listing.imageUrls[0]}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
            {listing.imageUrls.slice(1, 3).map((imageUrl, index) => (
              <div
                key={`${listing.slug}-${index}`}
                className="glass-panel relative min-h-[200px] overflow-hidden rounded-[2rem]"
              >
                <Image
                  src={imageUrl}
                  alt={`${listing.title} 图片 ${index + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content-wrap pt-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {infoCards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="glass-panel rounded-[2rem] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-slate-900">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">{item.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="content-wrap pt-10">
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">中介费</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {listing.hasBrokerFee ? "有中介费" : "无中介费"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">适合人群</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{listing.tagline}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">推荐理由</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">通勤顺畅，风格克制，居住舒适</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import { prisma } from "@/lib/prisma";

function normalizeSlugPart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildPropertySlug(value: string) {
  const normalized = normalizeSlugPart(value);
  return normalized || `listing-${Date.now()}`;
}

export async function resolvePropertySlug(options: {
  desiredSlug?: string | null;
  name: string;
  excludeId?: string;
}) {
  const requestedSlug = (options.desiredSlug ?? "").trim();
  const baseSlug = buildPropertySlug(requestedSlug || options.name);

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.property.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!existing || existing.id === options.excludeId) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { getProducts } from "@/lib/api/public";
import { NAV_CATEGORIES } from "@/lib/nav-categories";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({
      products: [],
      categories: [],
      totalProducts: 0,
    });
  }

  try {
    const paginated = await getProducts({ q, pageSize: 4 });

    const qLower = q.toLowerCase();
    const matchedCategories = NAV_CATEGORIES.filter(
      (c) =>
        c.label.toLowerCase().includes(qLower) ||
        c.slug.toLowerCase().includes(qLower) ||
        c.subtitle.toLowerCase().includes(qLower),
    )
      .slice(0, 3)
      .map((c) => ({
        name: c.label,
        slug: c.slug,
        icon: c.icon,
        subtitle: c.subtitle,
      }));

    return NextResponse.json({
      products: paginated.results.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        currency: p.currency,
        condition: p.condition ?? undefined,
        shopName: p.shop_name,
        shopSlug: p.shop_slug,
        shopVerified: p.shop_verified,
        categoryName: p.category?.name ?? null,
        categorySlug: p.category?.slug ?? null,
        imageUrl: p.images?.[0]?.url ?? null,
      })),
      categories: matchedCategories,
      totalProducts: paginated.count,
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json({
      products: [],
      categories: [],
      totalProducts: 0,
    });
  }
}

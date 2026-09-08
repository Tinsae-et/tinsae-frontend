import { NextResponse, type NextRequest } from "next/server";
import { getProduct } from "@/lib/api";
import { getNextSuggestions } from "@/lib/suggestions";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const categoryPage = Math.max(1, parseInt(searchParams.get("categoryPage") ?? "2", 10));
  const discoveryPage = Math.max(1, parseInt(searchParams.get("discoveryPage") ?? "1", 10));
  const mode = searchParams.get("mode") === "discovery" ? "discovery" : "category";
  const seenParam = searchParams.get("seen");
  const seenIds = seenParam
    ? seenParam
        .split(",")
        .map(Number)
        .filter((n) => Number.isFinite(n) && n > 0)
    : [];

  try {
    const product = await getProduct(slug);
    const result = await getNextSuggestions(product, {
      categoryPage,
      discoveryPage,
      seenIds,
      mode,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to load product suggestions" },
      { status: 500 },
    );
  }
}

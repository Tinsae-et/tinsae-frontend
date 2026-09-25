import { getProducts } from "./api/public";
import type { Product } from "./types";

/**
 * Extracts the brand name from the product specs or the first word of the title.
 */
export function extractBrand(product: Product): string | null {
  if (typeof product.specs?.brand === "string" && product.specs.brand.trim()) {
    return product.specs.brand.trim();
  }
  const firstWord = product.title.trim().split(/\s+/)[0];
  if (firstWord && firstWord.length >= 2 && !/^\d/.test(firstWord)) {
    return firstWord;
  }
  return null;
}

/**
 * Computes a ±35% price bracket around the current product's price for price proximity suggestions.
 */
export function getPriceBracket(price: string | number): { minPrice?: number; maxPrice?: number } {
  const num = typeof price === "number" ? price : Number(price);
  if (!Number.isFinite(num) || num <= 0) return {};
  return {
    minPrice: Math.max(0, Math.round(num * 0.65)),
    maxPrice: Math.round(num * 1.35),
  };
}

/**
 * Tiered suggestion engine:
 * Tier 1: Same category + brand affinity
 * Tier 2: Same category + price proximity (±35%)
 * Tier 3: Same category general (ordered by freshness)
 * Tier 4: Cross-category discovery (fresh listings across marketplace)
 */
export async function getInitialSuggestions(
  product: Product,
  count: number = 8,
): Promise<Product[]> {
  const brand = extractBrand(product);
  const categorySlug = product.category?.slug;
  const { minPrice, maxPrice } = getPriceBracket(product.price);

  const seenIds = new Set<number>([product.id]);
  const suggestions: Product[] = [];

  const addUnique = (items: Product[]) => {
    for (const item of items) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        suggestions.push(item);
        if (suggestions.length >= count) return true;
      }
    }
    return false;
  };

  // Tier 1: Same category + brand affinity
  if (brand && categorySlug) {
    try {
      const res = await getProducts({
        category: categorySlug,
        q: brand,
        pageSize: count,
      });
      if (addUnique(res.results)) return suggestions;
    } catch {
      // Continue to next tier
    }
  }

  // Tier 2: Same category + price proximity
  if (categorySlug && minPrice !== undefined && maxPrice !== undefined) {
    try {
      const res = await getProducts({
        category: categorySlug,
        minPrice,
        maxPrice,
        ordering: "-last_confirmed_at",
        pageSize: count,
      });
      if (addUnique(res.results)) return suggestions;
    } catch {
      // Continue to next tier
    }
  }

  // Tier 3: Same category general
  if (categorySlug) {
    try {
      const res = await getProducts({
        category: categorySlug,
        ordering: "-last_confirmed_at",
        pageSize: count,
      });
      if (addUnique(res.results)) return suggestions;
    } catch {
      // Continue to next tier
    }
  }

  // Tier 4: Cross-category discovery
  try {
    const res = await getProducts({
      ordering: "-last_confirmed_at",
      pageSize: count,
    });
    addUnique(res.results);
  } catch {
    // Return what we have
  }

  return suggestions;
}

export type NextSuggestionsOptions = {
  categoryPage?: number;
  discoveryPage?: number;
  seenIds: number[];
  mode?: "category" | "discovery";
  pageSize?: number;
};

export type NextSuggestionsResult = {
  products: Product[];
  nextCategoryPage: number;
  nextDiscoveryPage: number;
  mode: "category" | "discovery";
  hasMore: boolean;
};

/**
 * Paginates subsequent suggestion batches during infinite scroll.
 * Paginates through same-category listings, then smoothly transitions into
 * marketplace-wide discovery so the stream scrolls continuously.
 */
export async function getNextSuggestions(
  product: Product,
  options: NextSuggestionsOptions,
): Promise<NextSuggestionsResult> {
  const pageSize = options.pageSize ?? 8;
  const seenSet = new Set<number>([product.id, ...options.seenIds]);
  const categorySlug = product.category?.slug;

  let mode: "category" | "discovery" =
    options.mode ?? (categorySlug ? "category" : "discovery");
  let categoryPage = options.categoryPage ?? 2;
  let discoveryPage = options.discoveryPage ?? 1;
  const newProducts: Product[] = [];

  const addUnique = (items: Product[]) => {
    for (const item of items) {
      if (!seenSet.has(item.id)) {
        seenSet.add(item.id);
        newProducts.push(item);
        if (newProducts.length >= pageSize) return true;
      }
    }
    return false;
  };

  if (mode === "category" && categorySlug) {
    try {
      let hasMore = true;
      while (newProducts.length < pageSize && hasMore) {
        const res = await getProducts({
          category: categorySlug,
          ordering: "-last_confirmed_at",
          page: categoryPage,
          pageSize,
        });

        addUnique(res.results);
        categoryPage += 1;

        // While the category still has pages there is definitely more to come.
        hasMore = Boolean(res.next) && res.results.length > 0;
        if (newProducts.length > 0 || !hasMore) {
          break;
        }
      }

      // Category exhausted: switch to discovery for subsequent scrolls.
      if (!hasMore) {
        mode = "discovery";
        // If we didn't fill the batch, fetch initial discovery listings
        if (newProducts.length < Math.min(4, pageSize)) {
          while (newProducts.length < Math.min(4, pageSize)) {
            const discRes = await getProducts({
              ordering: "-last_confirmed_at",
              page: discoveryPage,
              pageSize,
            });
            addUnique(discRes.results);
            discoveryPage += 1;
            hasMore = Boolean(discRes.next) && discRes.results.length > 0;
            if (newProducts.length > 0 || !hasMore) {
              break;
            }
          }
        } else {
          // Batch was filled from the category, so discovery is untouched and
          // page 1 of it is still waiting on the next scroll.
          hasMore = true;
        }
      }

      return {
        products: newProducts,
        nextCategoryPage: categoryPage,
        nextDiscoveryPage: discoveryPage,
        mode,
        hasMore,
      };
    } catch {
      // In case of category fetch failure, attempt discovery fallback
      mode = "discovery";
    }
  }

  // Discovery mode (cross-category)
  let discHasMore = true;
  while (newProducts.length < pageSize && discHasMore) {
    const res = await getProducts({
      ordering: "-last_confirmed_at",
      page: discoveryPage,
      pageSize,
    });

    addUnique(res.results);
    discoveryPage += 1;
    discHasMore = Boolean(res.next) && res.results.length > 0;
    if (newProducts.length > 0 || !discHasMore) {
      break;
    }
  }

  return {
    products: newProducts,
    nextCategoryPage: categoryPage,
    nextDiscoveryPage: discoveryPage,
    mode: "discovery",
    hasMore: discHasMore,
  };
}

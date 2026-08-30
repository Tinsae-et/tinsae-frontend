// Shapes returned by tinsae-backend (catalog + shops apps).
// Kept in step with catalog/serializers.py.

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  display_order: number;
};

export type ProductImage = {
  id: number;
  url: string;
  is_primary: boolean;
  display_order: number;
};

export type Product = {
  id: number;
  /** Serializer-computed: `${brand} ${name}`. */
  title: string;
  description: string | null;
  /** DRF renders DecimalField as a string, e.g. "142500.00". */
  price: string;
  currency: string;
  shop_name: string;
  shop_verified: boolean;
  category: Category | null;
  /** Ordered product images (primary first); empty when unset. */
  images: ProductImage[];
  /**
   * Backend confirmation status; null when never confirmed. Graded on the
   * backend's 30-day window, so it is coarser than the tone we render — see
   * `resolveTone` in lib/format. Kept a closed union deliberately: the previous
   * `| string` member collapsed it and silently disabled every check.
   */
  confirmation_status?: "fresh" | "stale" | null;
  /** Nullable — a product may never have been confirmed in stock. */
  last_confirmed_at: string | null;
  slug: string;
  specs: Record<string, unknown>;
};

export type Shop = {
  id: number;
  name: string;
  slug: string;
  description: string;
  city: string;
  is_verified: boolean;
};

export type ShopProduct = {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: string;
  currency: string;
  shop: number;
  category: string;
  is_available: boolean;
  confirmation_status?: "fresh" | "stale" | null;
  last_confirmed_at: string | null;
  freshness: string;
  slug: string;
  specs: Record<string, unknown>;
}
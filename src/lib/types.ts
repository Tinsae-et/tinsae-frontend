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
   * The buyer-facing trust label, and the only one the API ships (the finer
   * tier in catalog/freshness.py is kept backend-side for ranking).
   *
   * Three values, worst last — catalog.models.ConfirmationStatus:
   *   fresh        confirmed inside settings.PRODUCT_STALENESS_DAYS
   *   stale        past that window, the merchant is due to be asked
   *   unconfirmed  asked, and the merchant never answered
   *
   * Note the column defaults to "fresh", so a listing that has never been
   * confirmed arrives as {confirmation_status: "fresh", last_confirmed_at:
   * null}. `freshness()` in lib/format reads both for that reason. Kept a
   * closed union deliberately: the previous `| string` member collapsed it and
   * silently disabled every check.
   */
  confirmation_status?: "fresh" | "stale" | "unconfirmed" | null;
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
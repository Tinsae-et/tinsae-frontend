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
  condition?: string | null;
  shop_name: string;
  shop_slug?: string;
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
  phone?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  telegram_chat_id?: string | null;
  is_verified: boolean;
  active_listings_count?: number;
  created_at?: string;
  updated_at?: string;
};


export type ShopProduct = {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: string;
  currency: string;
  shop: number;
  shop_slug?: string;
  category: string;
  condition: string;
  status?: string;
  stock?: number;
  views?: number;
  inquiries?: number;
  is_available: boolean;
  confirmation_status?: "fresh" | "stale" | null;
  last_confirmed_at: string | null;
  freshness: string;
  slug: string;
  specs: Record<string, unknown>;
  images?: ProductImage[];
};

export type NewProduct = {
  name: string;
  brand: string;
  description: string;
  price: string;
  currency: string;
  category: string;
  condition: string;
  is_available: boolean;
  stock: number;
  specs: Record<string, unknown>;
  status: string;
  slug?: string;
}

export type ShopProductImage = {
  id?: number;
  image: File | string;
  is_primary: boolean;
  display_order: number;
  preview: string;
  product?: ShopProduct;
  url?: string;
};

export type ShopMetrics = {
  verified_shops?: number;
  total_products?: number;
  verified_shop_products?: number;
  category_product_count?: Record<string, number>;
  shop_product_count?: Record<string, number>;
};
/**
 * Writable fields for shop profile and contact updates.
 *
 * `slug` and `telegram_chat_id` are intentionally excluded from mutations:
 * - `slug` is immutable after creation to maintain stable public URLs.
 * - `telegram_chat_id` is linked solely through one-time codes via the Telegram bot.
 */
export type ShopProfile = {
  name?: string;
  description?: string;
  phone?: string;
  city?: string;
};
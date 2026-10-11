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
  /**
   * Listings here have a spec form and spec filters. False for a parent such
   * as "Vehicles & Auto", which only groups its subcategories.
   */
  has_specs?: boolean;
  /**
   * Listings here are for sale or for rent (property): pages offer a
   * "For rent | For sale" switch. Only the category list sends it.
   */
  sale_or_rent?: boolean;
  /** Icon name from the frontend's icon set ("car", "sofa"); see isIconName. */
  icon?: string;
  /** One-line tagline for menus ("Cars · Motorcycles · Bicycles"). */
  tagline?: string;
  /** Subcategories, in order. Only the category list sends these. */
  children?: Category[];
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
  /** The seller's logo; null shows their initials instead. */
  shop_logo?: string | null;
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
  logo?: string | null;
  city: string;
  address?: string;
  categories?: string[];
  photos?: ShopPhoto[];
  phone?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  telegram_chat_id?: string | null;
  is_verified: boolean;
  active_listings_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type ShopPhoto = {
  id: number;
  url: string;
  image?: string;
  display_order: number;
  is_cover: boolean;
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
};

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
  address?: string;
  categories?: string[];
  /** Null clears the logo; a new one is sent as multipart instead. */
  logo?: null;
};

export type TelegramStatus = "idle" | "connected" | "blocked";

export type TelegramState = {
  status: TelegramStatus;
  linked_at: string | null;
  blocked_at: string | null;
};

export type TelegramConnectResult = {
  code: string;
  deep_link: string | null;
  bot_username: string;
  expires_at: string;
};

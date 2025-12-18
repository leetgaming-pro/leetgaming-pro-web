/**
 * Store/Marketplace Types
 * Per PRD E.5 - Store/Market/Exchange
 */

import type { GameId } from "./games";

// Product Categories
export type ProductCategory =
  | "digital-goods" // In-game items, skins, NFTs
  | "services" // Coaching, boosting, etc.
  | "merchandise" // Physical goods
  | "subscriptions" // Platform subscriptions
  | "tournament-entry" // Tournament entries
  | "game-coins" // In-game currencies
  | "nft"; // NFT collectibles

export type ProductStatus =
  | "available"
  | "out-of-stock"
  | "coming-soon"
  | "discontinued";

// Base Product Interface
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: ProductCategory;
  subcategory?: string;

  // Pricing
  price: number;
  currency: string;
  originalPrice?: number; // For discounts
  discount?: number; // Percentage

  // Media
  thumbnail: string;
  images: string[];
  video?: string;

  // Metadata
  gameId?: GameId;
  tags: string[];
  features: string[];

  // Availability
  status: ProductStatus;
  stock?: number;
  maxPerUser?: number;

  // Ratings
  rating: number;
  reviewCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  releaseDate?: string;
}

// Digital Item specific
export interface DigitalItem extends Product {
  category: "digital-goods";
  itemType: "skin" | "weapon" | "character" | "cosmetic" | "boost" | "currency";
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
  tradeable: boolean;
  marketValue?: number; // For trading/exchange
  externalId?: string; // Steam market ID, etc.
  wear?: number; // For CS2 skins (0-1)
}

// NFT specific
export interface NFTItem extends Product {
  category: "nft";
  contractAddress: string;
  tokenId: string;
  chain: "ethereum" | "polygon" | "base" | "arbitrum";
  tokenStandard: "ERC-721" | "ERC-1155";
  creator: {
    id: string;
    name: string;
    verified: boolean;
  };
  edition?: {
    current: number;
    total: number;
  };
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  royalty?: number; // Percentage for creator
}

// Physical Merchandise
export interface MerchandiseItem extends Product {
  category: "merchandise";
  variants: {
    id: string;
    name: string; // e.g., "Size M", "Black"
    sku: string;
    price?: number; // Override price if different
    stock: number;
    attributes: {
      [key: string]: string; // e.g., { size: 'M', color: 'Black' }
    };
  }[];
  shipping: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    regions: string[]; // Shipping regions
    freeShippingThreshold?: number;
  };
}

// Tournament Entry
export interface TournamentEntry extends Product {
  category: "tournament-entry";
  tournamentId: string;
  tournamentName: string;
  gameId: GameId;
  startDate: string;
  endDate: string;
  prizePool: number;
  format: "single-elimination" | "double-elimination" | "round-robin" | "swiss";
  teamSize: number;
  spotsRemaining: number;
  totalSpots: number;
}

// Cart and Orders
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  variantId?: string; // For merchandise variants
  customization?: {
    [key: string]: string;
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  promoCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productThumbnail: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantId?: string;
  variantName?: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];

  // Pricing
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;

  // Payment
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  transactionId?: string;

  // Shipping (for physical goods)
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone?: string;
  };
  trackingNumber?: string;

  // Status
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Trading/Exchange
export interface TradeOffer {
  id: string;
  sellerId: string;
  sellerName: string;

  // Item being sold
  itemId: string;
  itemName: string;
  itemThumbnail: string;
  itemType: "skin" | "nft" | "game-coin";

  // Pricing
  askingPrice: number;
  currency: string;
  originalValue?: number;

  // Trade settings
  acceptsTradeOffers: boolean;
  acceptedPaymentMethods: string[];

  // Status
  status: "active" | "sold" | "cancelled" | "expired";
  expiresAt?: string;

  // Stats
  views: number;
  watchlistCount: number;

  createdAt: string;
  updatedAt: string;
}

export interface TradeTransaction {
  id: string;
  offerId: string;
  sellerId: string;
  buyerId: string;

  itemId: string;
  itemName: string;

  price: number;
  platformFee: number;
  sellerReceives: number;
  currency: string;

  status: "pending" | "completed" | "cancelled" | "disputed";

  createdAt: string;
  completedAt?: string;
}

// Filters and Search
export interface StoreFilters {
  categories?: ProductCategory[];
  games?: GameId[];
  priceRange?: { min: number; max: number };
  rating?: number;
  tags?: string[];
  sortBy?: "newest" | "price-low" | "price-high" | "popular" | "rating";
  inStock?: boolean;
  search?: string;
}

export interface StoreSearchResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filters: StoreFilters;
  facets: {
    categories: { category: ProductCategory; count: number }[];
    games: { gameId: GameId; count: number }[];
    priceRanges: { range: string; count: number }[];
    tags: { tag: string; count: number }[];
  };
}

// Wishlist
export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
  priceAtAdd: number;
  notifyOnSale: boolean;
  notifyOnRestock: boolean;
}

// Gift Cards
export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  currency: string;
  balance: number;
  status: "active" | "redeemed" | "expired" | "cancelled";
  purchaserId?: string;
  recipientEmail?: string;
  message?: string;
  expiresAt?: string;
  createdAt: string;
  redeemedAt?: string;
}

// Promo Codes
export interface PromoCode {
  code: string;
  type: "percentage" | "fixed" | "free-shipping";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  applicableCategories?: ProductCategory[];
  applicableProducts?: string[];
  usageLimit?: number;
  usageCount: number;
  userLimit?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

// Helper functions
export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function calculateDiscount(
  originalPrice: number,
  discountedPrice: number
): number {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

export function getProductCategoryLabel(category: ProductCategory): string {
  const labels: Record<ProductCategory, string> = {
    "digital-goods": "Digital Items",
    services: "Services",
    merchandise: "Merchandise",
    subscriptions: "Subscriptions",
    "tournament-entry": "Tournament Entry",
    "game-coins": "Game Coins",
    nft: "NFT Collectibles",
  };
  return labels[category];
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: "default",
    uncommon: "success",
    rare: "primary",
    epic: "secondary",
    legendary: "warning",
    mythic: "danger",
  };
  return colors[rarity] || "default";
}

// Constants
export const PLATFORM_TRADING_FEE = 0.05; // 5% trading fee
export const MIN_TRADE_VALUE = 1;
export const MAX_CART_ITEMS = 50;

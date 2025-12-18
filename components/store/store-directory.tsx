/**
 * Store Directory Component
 * Main store page with filterable product grid
 * Per PRD E.5 - Store/Market/Exchange with digital items, physical goods, services, NFTs
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Input,
  Select,
  SelectItem,
  Chip,
  Button,
  Slider,
  Checkbox,
  CheckboxGroup,
  Accordion,
  AccordionItem,
  Card,
  CardBody,
  Skeleton,
  Pagination,
  Switch,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, ProductCategory } from "@/types/store";
import { getProductCategoryLabel } from "@/types/store";
import { ProductGrid } from "./product-card";
import type { GameId } from "@/types/games";

// Product rarity type (matches DigitalItem.rarity)
type ProductRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic";

interface StoreDirectoryProps {
  products: Product[];
  isLoading?: boolean;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistedIds?: string[];
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

const GAME_OPTIONS: { value: GameId; label: string; icon: string }[] = [
  { value: "cs2", label: "CS2", icon: "simple-icons:counterstrike" },
  { value: "valorant", label: "VALORANT", icon: "simple-icons:valorant" },
  {
    value: "lol",
    label: "League of Legends",
    icon: "simple-icons:leagueoflegends",
  },
  { value: "dota2", label: "Dota 2", icon: "simple-icons:dota2" },
  { value: "freefire", label: "Free Fire", icon: "simple-icons:garena" },
  { value: "pubg", label: "PUBG", icon: "simple-icons:pubg" },
];

const CATEGORIES: ProductCategory[] = [
  "digital-goods",
  "merchandise",
  "services",
  "game-coins",
  "nft",
  "subscriptions",
  "tournament-entry",
];

const RARITIES: ProductRarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
];

const RARITY_COLORS: Record<ProductRarity, string> = {
  common: "#9ca3af",
  uncommon: "#22c55e",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
  mythic: "#ef4444",
};

export function StoreDirectory({
  products,
  isLoading = false,
  onAddToCart,
  onToggleWishlist,
  wishlistedIds = [],
  totalPages = 1,
  currentPage = 1,
  onPageChange,
}: StoreDirectoryProps) {
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<
    ProductCategory[]
  >([]);
  const [selectedGames, setSelectedGames] = useState<GameId[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<ProductRarity[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Game filter
    if (selectedGames.length > 0) {
      result = result.filter(
        (p) => p.gameId && selectedGames.includes(p.gameId)
      );
    }

    // Rarity filter - check if product is DigitalItem with rarity
    if (selectedRarities.length > 0) {
      result = result.filter((p) => {
        const digitalItem = p as { rarity?: ProductRarity };
        return (
          digitalItem.rarity && selectedRarities.includes(digitalItem.rarity)
        );
      });
    }

    // Price range filter
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Stock filter
    if (inStockOnly) {
      result = result.filter((p) => p.stock === undefined || p.stock > 0);
    }

    // Sale filter
    if (onSaleOnly) {
      result = result.filter(
        (p) => p.originalPrice && p.originalPrice > p.price
      );
    }

    // Sorting
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "popular":
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return result;
  }, [
    products,
    searchQuery,
    selectedCategories,
    selectedGames,
    selectedRarities,
    priceRange,
    inStockOnly,
    onSaleOnly,
    sortBy,
  ]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (selectedGames.length > 0) count++;
    if (selectedRarities.length > 0) count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    if (priceRange[0] > 0 || priceRange[1] < 1000) count++;
    return count;
  }, [
    selectedCategories,
    selectedGames,
    selectedRarities,
    inStockOnly,
    onSaleOnly,
    priceRange,
  ]);

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedGames([]);
    setSelectedRarities([]);
    setPriceRange([0, 1000]);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={
              <Icon
                icon="solar:magnifer-bold"
                className="w-5 h-5 text-default-400"
              />
            }
            endContent={
              searchQuery && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => setSearchQuery("")}
                >
                  <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
                </Button>
              )
            }
            classNames={{ inputWrapper: "rounded-none" }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            aria-label="Sort by"
            selectedKeys={[sortBy]}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-40"
            size="sm"
            classNames={{ trigger: "rounded-none" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} textValue={opt.label}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>

          <Tooltip content={showFilters ? "Hide filters" : "Show filters"}>
            <Button
              isIconOnly
              variant={showFilters ? "flat" : "light"}
              onPress={() => setShowFilters(!showFilters)}
              className="rounded-none relative"
            >
              <Icon icon="solar:filter-bold" className="w-5 h-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </Tooltip>

          <div className="border-l border-divider pl-2 flex gap-1">
            <Tooltip content="Grid view">
              <Button
                isIconOnly
                size="sm"
                variant={viewMode === "grid" ? "flat" : "light"}
                onPress={() => setViewMode("grid")}
              >
                <Icon icon="solar:widget-bold" className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="List view">
              <Button
                isIconOnly
                size="sm"
                variant={viewMode === "list" ? "flat" : "light"}
                onPress={() => setViewMode("list")}
              >
                <Icon icon="solar:list-bold" className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-default-500">Active filters:</span>
          {selectedCategories.map((cat) => (
            <Chip
              key={cat}
              size="sm"
              variant="flat"
              onClose={() =>
                setSelectedCategories((prev) => prev.filter((c) => c !== cat))
              }
            >
              {getProductCategoryLabel(cat)}
            </Chip>
          ))}
          {selectedGames.map((game) => (
            <Chip
              key={game}
              size="sm"
              variant="flat"
              onClose={() =>
                setSelectedGames((prev) => prev.filter((g) => g !== game))
              }
            >
              {GAME_OPTIONS.find((g) => g.value === game)?.label}
            </Chip>
          ))}
          {selectedRarities.map((rarity) => (
            <Chip
              key={rarity}
              size="sm"
              variant="flat"
              style={{ backgroundColor: `${RARITY_COLORS[rarity]}20` }}
              onClose={() =>
                setSelectedRarities((prev) => prev.filter((r) => r !== rarity))
              }
            >
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </Chip>
          ))}
          {inStockOnly && (
            <Chip
              size="sm"
              variant="flat"
              onClose={() => setInStockOnly(false)}
            >
              In Stock
            </Chip>
          )}
          {onSaleOnly && (
            <Chip
              size="sm"
              variant="flat"
              color="danger"
              onClose={() => setOnSaleOnly(false)}
            >
              On Sale
            </Chip>
          )}
          {(priceRange[0] > 0 || priceRange[1] < 1000) && (
            <Chip
              size="sm"
              variant="flat"
              onClose={() => setPriceRange([0, 1000])}
            >
              ${priceRange[0]} - ${priceRange[1]}
            </Chip>
          )}
          <Button
            size="sm"
            variant="light"
            color="danger"
            onPress={clearAllFilters}
          >
            Clear all
          </Button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 overflow-hidden"
            >
              <Card className="sticky top-4">
                <CardBody className="p-0">
                  <Accordion
                    selectionMode="multiple"
                    defaultExpandedKeys={["categories", "price", "games"]}
                    variant="light"
                  >
                    {/* Categories */}
                    <AccordionItem
                      key="categories"
                      title="Categories"
                      startContent={
                        <Icon icon="solar:folder-bold" className="w-5 h-5" />
                      }
                    >
                      <CheckboxGroup
                        value={selectedCategories}
                        onChange={(values) =>
                          setSelectedCategories(values as ProductCategory[])
                        }
                        className="gap-2"
                      >
                        {CATEGORIES.map((cat) => (
                          <Checkbox key={cat} value={cat} size="sm">
                            {getProductCategoryLabel(cat)}
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    </AccordionItem>

                    {/* Games */}
                    <AccordionItem
                      key="games"
                      title="Games"
                      startContent={
                        <Icon icon="solar:gamepad-bold" className="w-5 h-5" />
                      }
                    >
                      <CheckboxGroup
                        value={selectedGames}
                        onChange={(values) =>
                          setSelectedGames(values as GameId[])
                        }
                        className="gap-2"
                      >
                        {GAME_OPTIONS.map((game) => (
                          <Checkbox
                            key={game.value}
                            value={game.value}
                            size="sm"
                          >
                            <div className="flex items-center gap-2">
                              <Icon icon={game.icon} className="w-4 h-4" />
                              {game.label}
                            </div>
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    </AccordionItem>

                    {/* Price Range */}
                    <AccordionItem
                      key="price"
                      title="Price Range"
                      startContent={
                        <Icon icon="solar:dollar-bold" className="w-5 h-5" />
                      }
                    >
                      <div className="px-2 py-4">
                        <Slider
                          label="Price"
                          step={10}
                          minValue={0}
                          maxValue={1000}
                          value={priceRange}
                          onChange={(value) =>
                            setPriceRange(value as [number, number])
                          }
                          formatOptions={{ style: "currency", currency: "USD" }}
                          className="max-w-full"
                        />
                      </div>
                    </AccordionItem>

                    {/* Rarity */}
                    <AccordionItem
                      key="rarity"
                      title="Rarity"
                      startContent={
                        <Icon icon="solar:star-bold" className="w-5 h-5" />
                      }
                    >
                      <CheckboxGroup
                        value={selectedRarities}
                        onChange={(values) =>
                          setSelectedRarities(values as ProductRarity[])
                        }
                        className="gap-2"
                      >
                        {RARITIES.map((rarity) => (
                          <Checkbox key={rarity} value={rarity} size="sm">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: RARITY_COLORS[rarity],
                                }}
                              />
                              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                            </div>
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    </AccordionItem>

                    {/* Other Filters */}
                    <AccordionItem
                      key="other"
                      title="Other"
                      startContent={
                        <Icon icon="solar:settings-bold" className="w-5 h-5" />
                      }
                    >
                      <div className="space-y-3">
                        <Switch
                          isSelected={inStockOnly}
                          onValueChange={setInStockOnly}
                          size="sm"
                        >
                          In Stock Only
                        </Switch>
                        <Switch
                          isSelected={onSaleOnly}
                          onValueChange={setOnSaleOnly}
                          size="sm"
                        >
                          On Sale Only
                        </Switch>
                      </div>
                    </AccordionItem>
                  </Accordion>
                </CardBody>
              </Card>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <main className="flex-1 min-w-0">
          {isLoading ? (
            <ProductGridSkeleton />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              onClearFilters={clearAllFilters}
              hasFilters={activeFilterCount > 0}
            />
          ) : (
            <>
              {/* Results count */}
              <p className="text-sm text-default-500 mb-4">
                Showing {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""}
              </p>

              <ProductGrid
                products={filteredProducts}
                variant={viewMode === "list" ? "compact" : "default"}
                columns={showFilters ? 3 : 4}
                onAddToCart={onAddToCart}
                onWishlist={onToggleWishlist}
                wishlistIds={wishlistedIds}
              />

              {/* Pagination */}
              {totalPages > 1 && onPageChange && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={onPageChange}
                    showControls
                    classNames={{
                      cursor: "rounded-none",
                      item: "rounded-none",
                      prev: "rounded-none",
                      next: "rounded-none",
                    }}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Loading skeleton
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(9)].map((_, i) => (
        <Card key={i}>
          <CardBody className="p-0">
            <Skeleton className="w-full h-48 rounded-none" />
            <div className="p-4 space-y-3">
              <Skeleton className="w-3/4 h-4 rounded-lg" />
              <Skeleton className="w-1/2 h-4 rounded-lg" />
              <div className="flex justify-between">
                <Skeleton className="w-1/3 h-6 rounded-lg" />
                <Skeleton className="w-1/4 h-8 rounded-lg" />
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// Empty state
function EmptyState({
  onClearFilters,
  hasFilters,
}: {
  onClearFilters: () => void;
  hasFilters: boolean;
}) {
  return (
    <Card className="py-12">
      <CardBody className="flex flex-col items-center text-center">
        <Icon
          icon="solar:box-minimalistic-bold-duotone"
          className="w-24 h-24 text-default-300 mb-4"
        />
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-default-500 mb-4">
          {hasFilters
            ? "Try adjusting your filters to find what you're looking for"
            : "There are no products available at the moment"}
        </p>
        {hasFilters && (
          <Button
            color="primary"
            variant="flat"
            onPress={onClearFilters}
            className="rounded-none"
          >
            Clear all filters
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

export default StoreDirectory;

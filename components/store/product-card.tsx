/**
 * Product Card Component
 * Reusable product display card for store/marketplace
 * Per PRD E.5 - Store/Market/Exchange
 */

"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Image,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Product, DigitalItem, NFTItem } from "@/types/store";
import { formatPrice, calculateDiscount, getRarityColor } from "@/types/store";
import { GAME_CONFIGS } from "@/config/games";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "featured";
  onAddToCart?: (product: Product) => void;
  onWishlist?: (product: Product) => void;
  isInWishlist?: boolean;
  showQuickView?: boolean;
}

export function ProductCard({
  product,
  variant = "default",
  onAddToCart,
  onWishlist,
  isInWishlist = false,
  showQuickView = true,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercent =
    hasDiscount && product.originalPrice
      ? calculateDiscount(product.originalPrice, product.price)
      : 0;
  const gameConfig = product.gameId ? GAME_CONFIGS[product.gameId] : null;

  // Type guards for specific product types
  const isDigitalItem = (p: Product): p is DigitalItem =>
    p.category === "digital-goods";
  const isNFT = (p: Product): p is NFTItem => p.category === "nft";

  // Compact variant
  if (variant === "compact") {
    return (
      <Card
        isPressable
        as={Link}
        href={`/store/${product.id}`}
        className="w-full"
      >
        <CardBody className="flex flex-row items-center gap-3 p-3">
          <Image
            src={product.thumbnail}
            alt={product.name}
            width={60}
            height={60}
            className="rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate text-sm">{product.name}</h4>
            <div className="flex items-center gap-2">
              {gameConfig && (
                <Chip size="sm" variant="flat" className="h-5">
                  {gameConfig.shortName || gameConfig.name}
                </Chip>
              )}
              {isDigitalItem(product) && product.rarity && (
                <Chip
                  size="sm"
                  color={getRarityColor(product.rarity) as "default"}
                  variant="flat"
                  className="h-5 capitalize"
                >
                  {product.rarity}
                </Chip>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-primary">
              {formatPrice(product.price, product.currency)}
            </p>
            {hasDiscount && product.originalPrice && (
              <p className="text-xs text-default-500 line-through">
                {formatPrice(product.originalPrice, product.currency)}
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  // Featured variant
  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="w-full bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-2 border-primary-200 dark:border-primary-800">
          <CardBody className="p-0">
            <div className="relative aspect-video">
              <Image
                src={product.images[0] || product.thumbnail}
                alt={product.name}
                removeWrapper
                className="w-full h-full object-cover"
              />
              {hasDiscount && (
                <div className="absolute top-3 left-3">
                  <Chip color="danger" variant="solid">
                    -{discountPercent}%
                  </Chip>
                </div>
              )}
              {product.status === "coming-soon" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Chip size="lg" color="warning" variant="solid">
                    Coming Soon
                  </Chip>
                </div>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-default-600 line-clamp-2">
                    {product.shortDescription || product.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {gameConfig && (
                  <Chip
                    variant="flat"
                    size="sm"
                    startContent={
                      <Icon icon="solar:gamepad-bold" className="w-3 h-3" />
                    }
                  >
                    {gameConfig.name}
                  </Chip>
                )}
                {isDigitalItem(product) && product.rarity && (
                  <Chip
                    size="sm"
                    color={getRarityColor(product.rarity) as "default"}
                    variant="flat"
                    className="capitalize"
                  >
                    {product.rarity}
                  </Chip>
                )}
                {isNFT(product) && (
                  <Chip
                    size="sm"
                    variant="flat"
                    startContent={
                      <Icon
                        icon="solar:link-minimalistic-bold"
                        className="w-3 h-3"
                      />
                    }
                  >
                    {product.chain}
                  </Chip>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Icon icon="solar:star-bold" className="w-4 h-4 text-warning" />
                <span className="font-semibold">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-default-500 text-sm">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            </div>
          </CardBody>

          <CardFooter className="flex items-center justify-between pt-0">
            <div>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.price, product.currency)}
              </span>
              {hasDiscount && product.originalPrice && (
                <span className="text-default-500 line-through ml-2">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                isIconOnly
                variant="flat"
                onPress={() => onWishlist?.(product)}
              >
                <Icon
                  icon={
                    isInWishlist ? "solar:heart-bold" : "solar:heart-linear"
                  }
                  className={isInWishlist ? "text-danger" : ""}
                />
              </Button>
              <Button
                color="primary"
                startContent={<Icon icon="solar:cart-plus-bold" />}
                onPress={() => onAddToCart?.(product)}
                isDisabled={product.status !== "available"}
                className="rounded-none"
              >
                Add to Cart
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="w-full max-w-[280px]">
        <CardBody className="p-0 overflow-hidden">
          <div className="relative aspect-square">
            <Image
              src={product.thumbnail}
              alt={product.name}
              removeWrapper
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {hasDiscount && (
                <Chip size="sm" color="danger" variant="solid">
                  -{discountPercent}%
                </Chip>
              )}
              {isDigitalItem(product) && product.rarity && (
                <Chip
                  size="sm"
                  color={getRarityColor(product.rarity) as "default"}
                  variant="solid"
                  className="capitalize"
                >
                  {product.rarity}
                </Chip>
              )}
              {isNFT(product) && (
                <Chip size="sm" color="secondary" variant="solid">
                  NFT
                </Chip>
              )}
            </div>

            {/* Stock badge */}
            {product.status === "out-of-stock" && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Chip color="default" variant="solid">
                  Out of Stock
                </Chip>
              </div>
            )}

            {/* Quick actions on hover */}
            {showQuickView && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                className="absolute bottom-2 left-2 right-2 flex gap-2"
              >
                <Button
                  size="sm"
                  variant="flat"
                  className="flex-1 bg-background/90 backdrop-blur"
                  as={Link}
                  href={`/store/${product.id}`}
                >
                  Quick View
                </Button>
                <Tooltip
                  content={
                    isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"
                  }
                >
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="bg-background/90 backdrop-blur"
                    onPress={() => onWishlist?.(product)}
                  >
                    <Icon
                      icon={
                        isInWishlist ? "solar:heart-bold" : "solar:heart-linear"
                      }
                      className={isInWishlist ? "text-danger" : ""}
                    />
                  </Button>
                </Tooltip>
              </motion.div>
            )}
          </div>

          <div className="p-3 space-y-2">
            {/* Game tag */}
            {gameConfig && (
              <Chip size="sm" variant="flat" className="h-5">
                {gameConfig.shortName || gameConfig.name}
              </Chip>
            )}

            <h4 className="font-semibold line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h4>

            {/* Rating */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  icon={
                    i < Math.floor(product.rating)
                      ? "solar:star-bold"
                      : "solar:star-linear"
                  }
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? "text-warning"
                      : "text-default-300"
                  }`}
                />
              ))}
              <span className="text-xs text-default-500 ml-1">
                ({product.reviewCount})
              </span>
            </div>
          </div>
        </CardBody>

        <CardFooter className="flex items-center justify-between pt-0 pb-3 px-3">
          <div>
            <p className="font-bold text-primary text-lg">
              {formatPrice(product.price, product.currency)}
            </p>
            {hasDiscount && product.originalPrice && (
              <p className="text-xs text-default-500 line-through">
                {formatPrice(product.originalPrice, product.currency)}
              </p>
            )}
          </div>
          <Button
            isIconOnly
            color="primary"
            variant="flat"
            onPress={() => onAddToCart?.(product)}
            isDisabled={product.status !== "available"}
          >
            <Icon icon="solar:cart-plus-bold" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Grid display for multiple products
export function ProductGrid({
  products,
  variant = "default",
  onAddToCart,
  onWishlist,
  wishlistIds = [],
  emptyMessage = "No products found",
  columns = 4,
}: {
  products: Product[];
  variant?: "default" | "compact";
  onAddToCart?: (product: Product) => void;
  onWishlist?: (product: Product) => void;
  wishlistIds?: string[];
  emptyMessage?: string;
  columns?: 2 | 3 | 4 | 5;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Icon
          icon="solar:bag-cross-bold-duotone"
          className="w-16 h-16 text-default-300 mb-4"
        />
        <p className="text-default-500">{emptyMessage}</p>
      </div>
    );
  }

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          onAddToCart={onAddToCart}
          onWishlist={onWishlist}
          isInWishlist={wishlistIds.includes(product.id)}
        />
      ))}
    </div>
  );
}

export default ProductCard;

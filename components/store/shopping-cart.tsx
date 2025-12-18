/**
 * Shopping Cart Component
 * Slide-out cart panel with items, totals, and checkout
 * Per PRD E.5 - Store/Market/Exchange
 */

"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Image,
  Chip,
  Input,
  Divider,
  ScrollShadow,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Cart, CartItem } from "@/types/store";
import { formatPrice, MAX_CART_ITEMS } from "@/types/store";

interface ShoppingCartProps {
  cart: Cart | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onApplyPromo: (code: string) => Promise<boolean>;
  onClearCart: () => void;
}

export function ShoppingCart({
  cart,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onApplyPromo,
  onClearCart,
}: ShoppingCartProps) {
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    setPromoError("");

    try {
      const success = await onApplyPromo(promoCode);
      if (!success) {
        setPromoError("Invalid or expired promo code");
      } else {
        setPromoCode("");
      }
    } catch {
      setPromoError("Failed to apply promo code");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const itemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={onClose}
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-divider">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:cart-large-bold"
                    className="w-6 h-6 text-primary"
                  />
                  <h2 className="text-xl font-bold">Shopping Cart</h2>
                  {itemCount > 0 && (
                    <Chip size="sm" color="primary" variant="flat">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </Chip>
                  )}
                </div>
                <Button isIconOnly variant="light" onPress={onClose}>
                  <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
                </Button>
              </div>

              {/* Cart Content */}
              {!cart || cart.items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  <Icon
                    icon="solar:cart-large-minimalistic-bold-duotone"
                    className="w-24 h-24 text-default-300 mb-4"
                  />
                  <h3 className="text-lg font-semibold mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-default-500 text-center mb-4">
                    Add some items to your cart to get started
                  </p>
                  <Button
                    as={Link}
                    href="/store"
                    color="primary"
                    startContent={<Icon icon="solar:shop-bold" />}
                    onPress={onClose}
                    className="rounded-none"
                  >
                    Browse Store
                  </Button>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <ScrollShadow className="flex-1 p-4">
                    <div className="space-y-4">
                      {cart.items.map((item) => (
                        <CartItemCard
                          key={item.productId}
                          item={item}
                          onUpdateQuantity={onUpdateQuantity}
                          onRemove={onRemoveItem}
                        />
                      ))}
                    </div>

                    {/* Clear Cart */}
                    {cart.items.length > 1 && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="light"
                          color="danger"
                          size="sm"
                          startContent={
                            <Icon icon="solar:trash-bin-trash-bold" />
                          }
                          onPress={() => setShowClearConfirm(true)}
                        >
                          Clear Cart
                        </Button>
                      </div>
                    )}
                  </ScrollShadow>

                  {/* Footer with Totals */}
                  <div className="p-4 border-t border-divider bg-default-50 space-y-3">
                    {/* Promo Code */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Promo code"
                        value={promoCode}
                        onValueChange={setPromoCode}
                        size="sm"
                        classNames={{ inputWrapper: "rounded-none" }}
                        isInvalid={!!promoError}
                        errorMessage={promoError}
                      />
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={handleApplyPromo}
                        isLoading={isApplyingPromo}
                        className="rounded-none"
                      >
                        Apply
                      </Button>
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-default-600">Subtotal</span>
                        <span>{formatPrice(cart.subtotal, cart.currency)}</span>
                      </div>
                      {cart.discount > 0 && (
                        <div className="flex justify-between text-success">
                          <span>Discount</span>
                          <span>
                            -{formatPrice(cart.discount, cart.currency)}
                          </span>
                        </div>
                      )}
                      {cart.shipping > 0 && (
                        <div className="flex justify-between">
                          <span className="text-default-600">Shipping</span>
                          <span>
                            {formatPrice(cart.shipping, cart.currency)}
                          </span>
                        </div>
                      )}
                      {cart.tax > 0 && (
                        <div className="flex justify-between">
                          <span className="text-default-600">Tax</span>
                          <span>{formatPrice(cart.tax, cart.currency)}</span>
                        </div>
                      )}
                      <Divider />
                      <div className="flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span className="text-primary">
                          {formatPrice(cart.total, cart.currency)}
                        </span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      as={Link}
                      href="/checkout"
                      color="primary"
                      fullWidth
                      size="lg"
                      startContent={<Icon icon="solar:card-bold" />}
                      onPress={onClose}
                      className="rounded-none"
                    >
                      Proceed to Checkout
                    </Button>

                    {/* Continue Shopping */}
                    <Button
                      as={Link}
                      href="/store"
                      variant="flat"
                      fullWidth
                      onPress={onClose}
                      className="rounded-none"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Clear Cart Confirmation */}
      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
      >
        <ModalContent>
          <ModalHeader>Clear Cart?</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to remove all items from your cart?</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={() => {
                onClearCart();
                setShowClearConfirm(false);
              }}
            >
              Clear Cart
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

// Individual Cart Item Card
function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) {
  const { product } = item;
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card className="bg-default-50">
        <CardBody className="flex flex-row gap-3 p-3">
          {/* Thumbnail */}
          <Image
            src={product.thumbnail}
            alt={product.name}
            width={80}
            height={80}
            className="rounded-lg object-cover flex-shrink-0"
          />

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-sm line-clamp-2">
                  {product.name}
                </h4>
                {item.variantId && item.customization && (
                  <p className="text-xs text-default-500">
                    {Object.values(item.customization).join(" / ")}
                  </p>
                )}
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={() => onRemove(item.productId)}
              >
                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between mt-2">
              {/* Quantity Controls */}
              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={() =>
                    onUpdateQuantity(
                      item.productId,
                      Math.max(1, item.quantity - 1)
                    )
                  }
                  isDisabled={item.quantity <= 1}
                >
                  <Icon icon="solar:minus-bold" className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-semibold">
                  {item.quantity}
                </span>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={() =>
                    onUpdateQuantity(item.productId, item.quantity + 1)
                  }
                  isDisabled={
                    item.quantity >= (product.maxPerUser || MAX_CART_ITEMS)
                  }
                >
                  <Icon icon="solar:add-bold" className="w-4 h-4" />
                </Button>
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="font-bold text-primary">
                  {formatPrice(product.price * item.quantity, product.currency)}
                </p>
                {hasDiscount && product.originalPrice && (
                  <p className="text-xs text-default-500 line-through">
                    {formatPrice(
                      product.originalPrice * item.quantity,
                      product.currency
                    )}
                  </p>
                )}
                {item.quantity > 1 && (
                  <p className="text-xs text-default-500">
                    {formatPrice(product.price, product.currency)} each
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Mini Cart Badge (for navbar)
export function CartBadge({
  itemCount,
  onClick,
}: {
  itemCount: number;
  onClick: () => void;
}) {
  return (
    <Button isIconOnly variant="light" onPress={onClick} className="relative">
      <Icon icon="solar:cart-large-bold" className="w-6 h-6" />
      {itemCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-danger text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </motion.div>
      )}
    </Button>
  );
}

export default ShoppingCart;

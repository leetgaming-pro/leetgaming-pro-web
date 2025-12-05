"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Image,
  Chip,
  Button,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Divider,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { title, subtitle } from "@/components/primitives";
import { SearchIcon } from "@/components/icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

interface MarketItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  currency: "credits" | "usd";
  category: "skins" | "coaching" | "services" | "accounts";
  rarity?: "common" | "rare" | "epic" | "legendary";
  seller: {
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
  };
  stock: number;
  sales: number;
}

// API response types
interface APIMarketItem {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  price?: number;
  currency?: string;
  category: string;
  rarity?: string;
  seller?: {
    name?: string;
    avatar_url?: string;
    rating?: number;
    verified?: boolean;
  };
  seller_id?: string;
  stock?: number;
  sales_count?: number;
}

interface APIMarketResponse {
  data?: APIMarketItem[];
}

// Map API response to MarketItem
const mapAPIToMarketItem = (item: APIMarketItem): MarketItem => ({
  id: item.id,
  name: item.name,
  description: item.description,
  image: item.image_url || `https://placehold.co/400x300/34445C/FFF?text=${encodeURIComponent(item.name)}`,
  price: item.price || 0,
  currency: (item.currency as MarketItem['currency']) || 'usd',
  category: item.category as MarketItem['category'],
  rarity: item.rarity as MarketItem['rarity'],
  seller: {
    name: item.seller?.name || 'Unknown Seller',
    avatar: item.seller?.avatar_url || `https://i.pravatar.cc/150?u=${item.seller_id}`,
    rating: item.seller?.rating || 0,
    verified: item.seller?.verified || false,
  },
  stock: item.stock || 0,
  sales: item.sales_count || 0,
});

export default function SupplyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { isOpen: isListOpen, onOpen: onListOpen, onClose: onListClose } = useDisclosure();
  const { isOpen: isBuyOpen, onOpen: onBuyOpen, onClose: onBuyClose } = useDisclosure();

  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  // Fetch market items from API
  useEffect(() => {
    async function fetchMarketItems() {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_REPLAY_API_URL || 'http://localhost:8080';
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (selectedRarity !== 'all') params.append('rarity', selectedRarity);

        const response = await fetch(`${baseUrl}/api/v1/marketplace/items?${params.toString()}`);

        if (response.ok) {
          const data: APIMarketResponse = await response.json();
          const apiItems = data.data || [];
          const mappedItems: MarketItem[] = apiItems.map(mapAPIToMarketItem);
          setMarketItems(mappedItems);
        } else {
          setMarketItems([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load marketplace";
        logger.error("Failed to fetch market items", err);
        setError(errorMessage);
        setMarketItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMarketItems();
  }, [selectedCategory, selectedRarity]);

  // Handle listing a new item
  const handleListItem = () => {
    if (!session) {
      router.push('/signin?callbackUrl=/supply');
      return;
    }
    onListOpen();
  };

  // Handle buying an item
  const handleBuyItem = (item: MarketItem) => {
    if (!session) {
      router.push('/signin?callbackUrl=/supply');
      return;
    }
    setSelectedItem(item);
    onBuyOpen();
  };

  // Confirm purchase
  const handleConfirmPurchase = async () => {
    if (!selectedItem || !session) return;

    setPurchasing(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_REPLAY_API_URL || 'http://localhost:8080';
      const response = await fetch(`${baseUrl}/api/v1/marketplace/items/${selectedItem.id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer_email: session.user?.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Purchase failed');
      }

      logger.info('Purchase successful', { itemId: selectedItem.id });
      onBuyClose();
      // Refresh items
      setMarketItems(prev => prev.map(item =>
        item.id === selectedItem.id
          ? { ...item, stock: Math.max(0, item.stock - 1), sales: item.sales + 1 }
          : item
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
      logger.error('Purchase failed', err);
      setError(errorMessage);
    } finally {
      setPurchasing(false);
    }
  };

  const filteredItems = marketItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesRarity = selectedRarity === "all" || item.rarity === selectedRarity;

    return matchesSearch && matchesCategory && matchesRarity;
  }).sort((a, b) => {
    if (sortBy === "price_low") return a.price - b.price;
    if (sortBy === "price_high") return b.price - a.price;
    if (sortBy === "popular") return b.sales - a.sales;
    return 0;
  });

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case "legendary":
        return "warning";
      case "epic":
        return "secondary";
      case "rare":
        return "primary";
      case "common":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-8 px-4 py-8 lg:px-24">
      {/* Header */}
      <div className="flex w-full max-w-7xl flex-col items-center text-center gap-2">
        <h2 className="text-secondary font-medium">Gaming Marketplace</h2>
        <h1 className={title({ size: "lg" })}>Supply Market</h1>
        <p className={subtitle({ class: "mt-2 max-w-2xl" })}>
          Buy and sell gaming items, skins, services, and more. Trade safely with verified sellers.
        </p>
      </div>

      {/* Filters */}
      <Card className="w-full max-w-7xl">
        <CardBody>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <Input
                placeholder="Search items..."
                startContent={<SearchIcon size={18} />}
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="flex-1"
                variant="bordered"
              />
              <Select
                label="Category"
                selectedKeys={[selectedCategory]}
                onSelectionChange={(keys) => setSelectedCategory(Array.from(keys)[0] as string)}
                className="w-full md:w-48"
                variant="bordered"
              >
                <SelectItem key="all" value="all">All Categories</SelectItem>
                <SelectItem key="skins" value="skins">Skins & Items</SelectItem>
                <SelectItem key="coaching" value="coaching">Coaching</SelectItem>
                <SelectItem key="services" value="services">Services</SelectItem>
                <SelectItem key="accounts" value="accounts">Accounts</SelectItem>
              </Select>
              <Select
                label="Rarity"
                selectedKeys={[selectedRarity]}
                onSelectionChange={(keys) => setSelectedRarity(Array.from(keys)[0] as string)}
                className="w-full md:w-48"
                variant="bordered"
              >
                <SelectItem key="all" value="all">All Rarities</SelectItem>
                <SelectItem key="legendary" value="legendary">Legendary</SelectItem>
                <SelectItem key="epic" value="epic">Epic</SelectItem>
                <SelectItem key="rare" value="rare">Rare</SelectItem>
                <SelectItem key="common" value="common">Common</SelectItem>
              </Select>
              <Select
                label="Sort By"
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as string)}
                className="w-full md:w-48"
                variant="bordered"
              >
                <SelectItem key="popular" value="popular">Most Popular</SelectItem>
                <SelectItem key="price_low" value="price_low">Price: Low to High</SelectItem>
                <SelectItem key="price_high" value="price_high">Price: High to Low</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="w-full max-w-7xl flex justify-center py-12">
          <Spinner size="lg" label="Loading marketplace items..." color="primary" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="w-full max-w-md">
          <CardBody className="text-center">
            <Icon icon="mdi:alert-circle" className="text-danger mx-auto mb-4" width={48} />
            <p className="text-danger font-semibold mb-2">Error loading marketplace</p>
            <p className="text-default-500 mb-4">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Items Grid */}
      {!loading && (
      <div className="w-full max-w-7xl">
        <div className="flex justify-between items-center mb-4">
          <p className="text-default-500">
            Showing {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
          </p>
          <Button
            color="primary"
            variant="flat"
            startContent={<Icon icon="mdi:plus" width={20} />}
            onPress={handleListItem}
          >
            List Item
          </Button>
        </div>

        {filteredItems.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Icon icon="mdi:package-variant-closed" className="text-6xl text-default-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-default-500">
                Try adjusting your filters or search query
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:scale-105 transition-transform" isPressable>
                <CardHeader className="p-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                    radius="none"
                  />
                </CardHeader>

                <CardBody className="p-4 gap-3">
                  {/* Item Title & Rarity */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-sm line-clamp-2 flex-1">
                        {item.name}
                      </h4>
                      {item.rarity && (
                        <Chip size="sm" color={getRarityColor(item.rarity)} variant="flat">
                          {item.rarity}
                        </Chip>
                      )}
                    </div>
                    <p className="text-xs text-default-500 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <Divider />

                  {/* Seller Info */}
                  <div className="flex items-center gap-2">
                    <Image
                      src={item.seller.avatar}
                      alt={item.seller.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium truncate">
                          {item.seller.name}
                        </span>
                        {item.seller.verified && (
                          <Icon icon="mdi:check-decagram" className="text-primary" width={14} />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon icon="mdi:star" className="text-warning" width={12} />
                        <span className="text-xs text-default-500">
                          {item.seller.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* Stats */}
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-1 text-default-500">
                      <Icon icon="mdi:package-variant" width={14} />
                      <span>{item.stock} in stock</span>
                    </div>
                    <div className="flex items-center gap-1 text-default-500">
                      <Icon icon="mdi:cart" width={14} />
                      <span>{item.sales} sold</span>
                    </div>
                  </div>
                </CardBody>

                <CardFooter className="p-4 pt-0 flex-col gap-2">
                  <div className="flex w-full justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xs text-default-500">Price</span>
                      <span className="text-xl font-bold text-primary">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      color="primary"
                      variant="shadow"
                      size="md"
                      endContent={<Icon icon="mdi:cart" width={18} />}
                      onPress={() => handleBuyItem(item)}
                      isDisabled={item.stock <= 0}
                    >
                      {item.stock > 0 ? 'Buy Now' : 'Sold Out'}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Info Cards */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100">
          <CardBody className="p-6">
            <Icon icon="mdi:shield-check" className="text-3xl text-primary mb-2" />
            <h3 className="text-lg font-semibold mb-2">Secure Trading</h3>
            <p className="text-sm text-default-600">
              All transactions are protected with buyer protection and escrow services. Trade with confidence.
            </p>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100">
          <CardBody className="p-6">
            <Icon icon="mdi:account-star" className="text-3xl text-secondary mb-2" />
            <h3 className="text-lg font-semibold mb-2">Verified Sellers</h3>
            <p className="text-sm text-default-600">
              Browse items from verified sellers with proven track records and positive ratings.
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Purchase Confirmation Modal */}
      <Modal isOpen={isBuyOpen} onClose={onBuyClose} size="md">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Confirm Purchase
          </ModalHeader>
          <ModalBody>
            {selectedItem && (
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex flex-col justify-center">
                    <h4 className="font-semibold">{selectedItem.name}</h4>
                    <p className="text-sm text-default-500">{selectedItem.description}</p>
                  </div>
                </div>
                <Divider />
                <div className="flex justify-between items-center">
                  <span className="text-default-500">Price</span>
                  <span className="text-xl font-bold text-primary">${selectedItem.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-default-500">Seller</span>
                  <div className="flex items-center gap-2">
                    <span>{selectedItem.seller.name}</span>
                    {selectedItem.seller.verified && (
                      <Icon icon="mdi:check-decagram" className="text-primary" width={16} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onBuyClose} isDisabled={purchasing}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleConfirmPurchase}
              isLoading={purchasing}
              startContent={!purchasing && <Icon icon="mdi:cart" width={18} />}
            >
              Confirm Purchase
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* List Item Modal */}
      <Modal isOpen={isListOpen} onClose={onListClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            List Item for Sale
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Item Name"
                placeholder="Enter item name"
                variant="bordered"
              />
              <Input
                label="Description"
                placeholder="Describe your item"
                variant="bordered"
              />
              <Select
                label="Category"
                placeholder="Select category"
                variant="bordered"
              >
                <SelectItem key="skins" value="skins">Skins & Items</SelectItem>
                <SelectItem key="coaching" value="coaching">Coaching</SelectItem>
                <SelectItem key="services" value="services">Services</SelectItem>
              </Select>
              <Input
                label="Price"
                placeholder="0.00"
                type="number"
                startContent={<span className="text-default-400">$</span>}
                variant="bordered"
              />
              <p className="text-xs text-default-400">
                A 5% platform fee will be deducted from each sale.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onListClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={onListClose}>
              List Item
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

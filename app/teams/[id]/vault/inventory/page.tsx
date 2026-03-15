'use client';

/**
 * Vault Inventory Page
 */

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Select,
  SelectItem,
  Skeleton,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { PageContainer } from '@/components/layouts/centered-content';
import { useVaultInventory } from '@/hooks/use-vault-inventory';
import { getRarityColor } from '@/types/replay-api/vault.types';
import type { InventoryItem, InventoryItemType, ItemRarity } from '@/types/replay-api/vault.types';

export default function VaultInventoryPage() {
  const params = useParams();
  const router = useRouter();
  const squadId = params.id as string;

  const [typeFilter, setTypeFilter] = useState<InventoryItemType | undefined>();
  const [rarityFilter, setRarityFilter] = useState<ItemRarity | undefined>();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const detailModal = useDisclosure();

  const { inventory, isLoading, refreshInventory } = useVaultInventory(squadId, true, {
    limit: 24,
    offset: 0,
    type: typeFilter,
    rarity: rarityFilter,
  });

  const handleFilterChange = (type?: InventoryItemType, rarity?: ItemRarity) => {
    setTypeFilter(type);
    setRarityFilter(rarity);
    refreshInventory({ type, rarity, limit: 24, offset: 0 });
  };

  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    detailModal.onOpen();
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="light"
              onPress={() => router.push(`/teams/${squadId}/vault`)}
            >
              <Icon icon="solar:arrow-left-bold" className="text-xl" />
            </Button>
            <h1 className="text-2xl font-bold">Inventory</h1>
            {inventory && (
              <Chip variant="flat" size="sm">
                {inventory.total_count} items
              </Chip>
            )}
          </div>
          <Button
            color="primary"
            startContent={<Icon icon="solar:add-circle-bold" />}
            onPress={() => {
              // TODO: open deposit item modal
            }}
          >
            Deposit Item
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select
            label="Type"
            placeholder="All types"
            size="sm"
            className="max-w-[200px]"
            selectedKeys={typeFilter ? [typeFilter] : []}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as InventoryItemType | undefined;
              handleFilterChange(val, rarityFilter);
            }}
          >
            <SelectItem key="NFT">NFT</SelectItem>
            <SelectItem key="GAME_ASSET">Game Asset</SelectItem>
            <SelectItem key="CONSUMABLE">Consumable</SelectItem>
            <SelectItem key="COSMETIC">Cosmetic</SelectItem>
            <SelectItem key="LOOT_BOX">Loot Box</SelectItem>
            <SelectItem key="GENERIC">Generic</SelectItem>
          </Select>

          <Select
            label="Rarity"
            placeholder="All rarities"
            size="sm"
            className="max-w-[200px]"
            selectedKeys={rarityFilter ? [rarityFilter] : []}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as ItemRarity | undefined;
              handleFilterChange(typeFilter, val);
            }}
          >
            <SelectItem key="COMMON">Common</SelectItem>
            <SelectItem key="UNCOMMON">Uncommon</SelectItem>
            <SelectItem key="RARE">Rare</SelectItem>
            <SelectItem key="EPIC">Epic</SelectItem>
            <SelectItem key="LEGENDARY">Legendary</SelectItem>
            <SelectItem key="MYTHIC">Mythic</SelectItem>
          </Select>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : inventory?.items && inventory.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {inventory.items.map((item) => (
              <Card
                key={item.id}
                isPressable
                onPress={() => handleViewItem(item)}
                className="hover:scale-105 transition-transform"
              >
                <CardBody className="p-2">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-default-100">
                      <Icon
                        icon={
                          item.type === 'NFT'
                            ? 'solar:diamond-bold'
                            : item.type === 'GAME_ASSET'
                            ? 'solar:gamepad-bold'
                            : 'solar:box-bold'
                        }
                        className="text-3xl text-default-400"
                      />
                    </div>
                  )}
                </CardBody>
                <CardFooter className="flex-col items-start gap-1 px-2 pb-2">
                  <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                  <div className="flex w-full items-center justify-between">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getRarityColor(item.rarity) as any}
                      className="text-[10px]"
                    >
                      {item.rarity}
                    </Chip>
                    {item.quantity > 1 && (
                      <span className="text-[10px] text-default-400">x{item.quantity}</span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Icon icon="solar:box-bold" className="text-5xl text-default-300" />
            <p className="text-default-500">No items in the vault inventory</p>
            <Button
              color="primary"
              variant="flat"
              startContent={<Icon icon="solar:add-circle-bold" />}
            >
              Deposit First Item
            </Button>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <Modal isOpen={detailModal.isOpen} onOpenChange={detailModal.onOpenChange} size="lg">
        <ModalContent>
          {selectedItem && (
            <>
              <ModalHeader className="flex items-center gap-2">
                <span>{selectedItem.name}</span>
                <Chip
                  color={getRarityColor(selectedItem.rarity) as any}
                  variant="flat"
                  size="sm"
                >
                  {selectedItem.rarity}
                </Chip>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {selectedItem.image_url && (
                    <Image
                      src={selectedItem.image_url}
                      alt={selectedItem.name}
                      className="max-h-64 w-full rounded-lg object-contain"
                    />
                  )}

                  {selectedItem.description && (
                    <p className="text-sm text-default-600">{selectedItem.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-default-500">Type</p>
                      <p className="text-sm font-medium">{selectedItem.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-default-500">Quantity</p>
                      <p className="text-sm font-medium">{selectedItem.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-default-500">Status</p>
                      <Chip
                        size="sm"
                        variant="dot"
                        color={selectedItem.status === 'ACTIVE' ? 'success' : 'warning'}
                      >
                        {selectedItem.status}
                      </Chip>
                    </div>
                    {selectedItem.game_id && (
                      <div>
                        <p className="text-xs text-default-500">Game</p>
                        <p className="text-sm font-medium">{selectedItem.game_id}</p>
                      </div>
                    )}
                  </div>

                  {/* NFT Info */}
                  {selectedItem.nft_data && (
                    <>
                      <div className="border-t border-divider pt-3">
                        <p className="text-sm font-semibold mb-2">NFT Details</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-default-500">Token ID</p>
                            <code className="text-xs">{selectedItem.nft_data.token_id}</code>
                          </div>
                          <div>
                            <p className="text-xs text-default-500">Standard</p>
                            <p className="text-sm">{selectedItem.nft_data.standard}</p>
                          </div>
                          {selectedItem.nft_data.contract_address && (
                            <div className="col-span-2">
                              <p className="text-xs text-default-500">Contract</p>
                              <code className="text-xs break-all">
                                {selectedItem.nft_data.contract_address}
                              </code>
                            </div>
                          )}
                          {selectedItem.nft_data.chain && (
                            <div>
                              <p className="text-xs text-default-500">Chain</p>
                              <p className="text-sm">{selectedItem.nft_data.chain}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Metadata */}
                  {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                    <div className="border-t border-divider pt-3">
                      <p className="text-sm font-semibold mb-2">Attributes</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedItem.metadata).map(([key, val]) => (
                          <Chip key={key} variant="flat" size="sm">
                            {key}: {String(val)}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={detailModal.onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Icon icon="solar:transfer-horizontal-bold" />}
                >
                  Propose Transfer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </PageContainer>
  );
}

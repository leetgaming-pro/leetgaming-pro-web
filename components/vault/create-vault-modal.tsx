'use client';

/**
 * Create Vault Modal Component
 */

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVault: (name: string, description: string) => Promise<boolean>;
}

export function CreateVaultModal({
  isOpen,
  onClose,
  onCreateVault,
}: CreateVaultModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Vault name is required');
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      const success = await onCreateVault(name.trim(), description.trim());
      if (success) {
        setName('');
        setDescription('');
        onClose();
      } else {
        setError('Failed to create vault. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Icon icon="solar:vault-bold-duotone" className="text-primary text-xl" />
          Create Team Vault
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-500 mb-4">
            Set up a shared vault for your team with multisig approval policies.
          </p>
          <Input
            label="Vault Name"
            placeholder="e.g. Team Prize Fund"
            value={name}
            onValueChange={setName}
            isRequired
            autoFocus
          />
          <Textarea
            label="Description"
            placeholder="What will this vault be used for?"
            value={description}
            onValueChange={setDescription}
          />
          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isCreating}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleCreate}
            isLoading={isCreating}
            startContent={!isCreating ? <Icon icon="solar:add-circle-bold" /> : undefined}
          >
            Create Vault
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Select,
  Chip,
  SelectItem,
  Avatar,
  Spacer,
  Autocomplete,
  AutocompleteSection,
  AutocompleteItem,
} from "@nextui-org/react";
import { Form } from "@nextui-org/form";
import { Icon } from "@iconify/react";
import AvatarUploader from "@/components/avatar/avatar-uploader";
import { UserIcon } from "@/components/icons";
import { useSession } from "next-auth/react";
import { logger } from "@/lib/logger";

const games = [
  { id: 1, name: "Counter-Strike: Global Offensive", icon: "https://avatars.githubusercontent.com/u/168373383" },
  { id: 2, name: "Valorant", icon: "https://avatars.githubusercontent.com/u/168373383" },
  { id: 3, name: "League of Legends", icon: "https://avatars.githubusercontent.com/u/168373383" },
  { id: 4, name: "Dota 2", icon: "https://avatars.githubusercontent.com/u/168373383" },
  { id: 5, name: "Overwatch", icon: "https://avatars.githubusercontent.com/u/168373383" },
  { id: 6, name: "Rainbow Six Siege", icon: "https://avatars.githubusercontent.com/u/168373383" },
];

const headingClasses = "flex w-full sticky top-1 z-10 py-1.5 px-2 pt-4 bg-default-100 shadow-small rounded-small";

export default function App() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { data: session } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [visibility, setVisibility] = useState<string>("public");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    if (!session) {
      router.push('/signin');
    } else {
      onOpen();
    }
  };

  const handleAvatarUpload = (file: File) => {
    setAvatarFile(file);
    logger.info("Avatar selected", { fileName: file.name, size: file.size });
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    if (!session) return;

    setSubmitting(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_REPLAY_API_URL || 'http://localhost:8080';

      const playerData = {
        display_name: displayName,
        slug_uri: slug,
        game_id: selectedGame,
        role: selectedRole,
        visibility: visibility,
        email: session.user?.email,
      };

      const response = await fetch(`${baseUrl}/api/v1/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });

      if (!response.ok) {
        throw new Error('Failed to create player profile');
      }

      logger.info('Player profile created successfully', { slug });
      router.push(`/players/${slug}`);
    } catch (err: any) {
      logger.error('Failed to create player profile', err);
      setError(err.message || 'Failed to create player profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    onSubmit({ preventDefault: () => {} });
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayName(value);
    setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  };

  return (
    <>
      <Button startContent={<UserIcon size={18} />} color="primary" variant="faded" onPress={handleOpen}>Apply Now</Button>
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Create Player Profile</ModalHeader>
              <ModalBody>
                <Form className="w-full" validationBehavior="native" onSubmit={onSubmit}>
                  <div className="flex w-full gap-4 items-center pb-4">
                    <Select
                      classNames={{
                        trigger: "min-h-12 py-2",
                      }}
                      isMultiline={true}
                      items={games}
                      placeholder="Select a game"
                      selectedKeys={selectedGame ? [selectedGame] : []}
                      onSelectionChange={(keys) => setSelectedGame(Array.from(keys)[0] as string)}
                      renderValue={(items) => {
                        return (
                          <div className="flex flex-wrap gap-2">
                            {items.map((item) => (
                              <Chip key={item.key}>{item.data!.name}</Chip>
                            ))}
                          </div>
                        );
                      }}
                      selectionMode="single"
                      variant="bordered"
                    >
                      {(game) => (
                        <SelectItem key={game.id} textValue={game.name}>
                          <div className="flex gap-2 items-center">
                            <Avatar alt={game.name} className="flex-shrink-0" size="md" src={game.icon} />
                            <div className="flex flex-col">
                              <span className="text-small">{game.name}</span>
                            </div>
                          </div>
                        </SelectItem>
                      )}
                    </Select>
                  </div>
                  <div className="flex w-full gap-4">
                    <div className="flex flex-col gap-1 w-1/2">
                      <AvatarUploader onUpload={handleAvatarUpload} />
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                      <Input
                        startContent={<span className="text-default-400 pr-2">@</span>}
                        isRequired
                        label="Display Name"
                        labelPlacement="outside"
                        name="display_name"
                        placeholder=""
                        type="text"
                        value={displayName}
                        onChange={handleDisplayNameChange}
                      />

                      <Autocomplete
                        className="max-w-xs"
                        label="Playing Role"
                        placeholder="Search an playing roles"
                        scrollShadowProps={{
                          isEnabled: false,
                        }}
                        variant="bordered"
                      >
                        <AutocompleteSection
                          classNames={{
                            heading: headingClasses,
                          }}
                          title="Role"
                        >
                          <AutocompleteItem key="Entry Fragger">Entry Fragger</AutocompleteItem>
                          <AutocompleteItem key="Support">Support</AutocompleteItem>
                          <AutocompleteItem key="In-Game Leader (IGL)">In-Game Leader (IGL)</AutocompleteItem>
                          <AutocompleteItem key="AWPer">AWPer</AutocompleteItem>
                          <AutocompleteItem key="Lurker">Lurker</AutocompleteItem>
                          <AutocompleteItem key="Anchor">Anchor</AutocompleteItem>
                          <AutocompleteItem key="Controller">Controller</AutocompleteItem>
                          <AutocompleteItem key="Duelist">Duelist</AutocompleteItem>
                          <AutocompleteItem key="Initiator">Initiator</AutocompleteItem>
                          <AutocompleteItem key="Rifler">Rifler</AutocompleteItem>
                          <AutocompleteItem key="Rotator">Rotator</AutocompleteItem>
                        </AutocompleteSection>
                      </Autocomplete>

                      <Select variant="bordered"
                        className="pt-2"
                        label="Profile Visibility Options"
                        placeholder="Select a visibility option"
                        selectedKeys={[visibility]}
                        onSelectionChange={(keys) => setVisibility(Array.from(keys)[0] as string)}
                      >
                        <SelectItem key="public" value="public" textValue="Public"><div className="flex items-center"> <Icon icon="mdi:earth" /><Spacer x={2} />Public (Default)</div></SelectItem>
                        <SelectItem key="private" value="private" textValue="Private"><div className="flex items-center"> <Icon icon="mdi:lock" /><Spacer x={2} /> Private</div></SelectItem>
                        <SelectItem key="restricted" value="restricted" textValue="Restricted"><div className="flex items-center"> <Icon icon="mdi:account-group" /><Spacer x={2} /> Group & Members </div></SelectItem>
                      </Select>
                    </div>
                  </div>
                  <Input
                    variant="flat"
                    startContent={<small className="text-default-400">leetgaming.pro/players/</small>}
                    isRequired
                    label="URL"
                    labelPlacement="outside"
                    name="slug"
                    placeholder=""
                    type="text"
                    value={slug}
                    readOnly
                  />
                </Form>
              </ModalBody>
              <ModalFooter>
                {error && (
                  <p className="text-danger text-sm flex-1">{error}</p>
                )}
                <Button variant="bordered" onPress={onClose} isDisabled={submitting}>
                  Close
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={submitting}
                  isDisabled={!displayName || !selectedGame}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

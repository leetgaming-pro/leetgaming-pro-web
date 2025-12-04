"use client";

import { useState } from "react";
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
  Textarea,
  Tabs,
  Tab,
  Progress,
  Card,
  CardBody,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import AvatarUploader from "@/components/avatar/avatar-uploader";
import PlayerSearchInput from "@/components/players/player-search-input/player-search-modal";
import { useSession } from "next-auth/react";
import { logger } from "@/lib/logger";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";

const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);

const GAMES = [
  { id: "cs2", name: "Counter-Strike 2", icon: "https://avatars.githubusercontent.com/u/168373383" },
  { id: "vlrnt", name: "Valorant", icon: "https://avatars.githubusercontent.com/u/168373383" },
  { id: "csgo", name: "CS:GO", icon: "https://avatars.githubusercontent.com/u/168373383" },
  { id: "lol", name: "League of Legends", icon: "https://avatars.githubusercontent.com/u/168373383" },
  { id: "dota2", name: "Dota 2", icon: "https://avatars.githubusercontent.com/u/168373383" },
];

interface FormData {
  game: string;
  displayName: string;
  slug: string;
  symbol: string;
  description: string;
  visibility: string;
}

export default function LaunchYourSquadButton() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("details");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    game: "",
    displayName: "",
    slug: "",
    symbol: "",
    description: "",
    visibility: "public",
  });

  const handleOpen = () => {
    if (!session) {
      router.push("/signin");
    } else {
      onOpen();
    }
  };

  const handleAvatarUpload = (file: File) => {
    setAvatarFile(file);
    logger.info("Squad avatar selected", { fileName: file.name, size: file.size });
  };

  const handleDisplayNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const symbol = value
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 4);

    setFormData((prev) => ({
      ...prev,
      displayName: value,
      slug,
      symbol: prev.symbol || symbol,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.game) {
      setSubmitError("Please select a game");
      return false;
    }
    if (!formData.displayName || formData.displayName.length < 3) {
      setSubmitError("Team name must be at least 3 characters");
      return false;
    }
    if (!formData.slug) {
      setSubmitError("URL slug is required");
      return false;
    }
    if (!formData.symbol || formData.symbol.length > 5) {
      setSubmitError("Tag must be 1-5 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const squad = await sdk.squads.createSquad({
        game_id: formData.game,
        name: formData.displayName,
        symbol: formData.symbol,
        description: formData.description,
        visibility_type: formData.visibility,
      });

      if (!squad) {
        throw new Error("Failed to create squad");
      }

      logger.info("Squad created successfully", {
        squadId: squad.id,
        name: formData.displayName,
      });

      // Reset form
      setFormData({
        game: "",
        displayName: "",
        slug: "",
        symbol: "",
        description: "",
        visibility: "public",
      });
      setAvatarFile(null);
      setActiveTab("details");

      onClose();

      // Navigate to the new squad
      router.push(`/teams/${formData.slug}`);
    } catch (error: any) {
      logger.error("Failed to create squad", error);
      setSubmitError(error.message || "Failed to create squad. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedGame = GAMES.find((g) => g.id === formData.game);
  const progress = formData.game && formData.displayName && formData.symbol ? 100 : formData.displayName ? 66 : formData.game ? 33 : 0;

  return (
    <>
      <Button
        onPress={handleOpen}
        startContent={<Icon icon="solar:users-group-two-rounded-outline" width={18} />}
        color="primary"
        variant="ghost"
      >
        Launch Your Squad
      </Button>
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:users-group-two-rounded-bold-duotone" width={28} className="text-primary" />
                  <span>Create Your Squad</span>
                </div>
                <Progress value={progress} color="primary" size="sm" className="max-w-full" />
              </ModalHeader>
              <ModalBody>
                <Tabs
                  aria-label="Squad Creation Tabs"
                  selectedKey={activeTab}
                  onSelectionChange={(key) => setActiveTab(key as string)}
                  classNames={{
                    tabList: "w-full relative rounded-none p-0 gap-4 lg:gap-6",
                    tab: "max-w-fit px-0 h-12",
                    cursor: "w-full",
                    tabContent: "text-default-400",
                  }}
                  radius="full"
                  variant="underlined"
                >
                  <Tab key="details" title="Details">
                    <div className="flex flex-col gap-4 py-4">
                      {/* Game Selection */}
                      <Select
                        label="Game"
                        placeholder="Select a game"
                        selectedKeys={formData.game ? [formData.game] : []}
                        onSelectionChange={(keys) =>
                          setFormData((prev) => ({ ...prev, game: Array.from(keys)[0] as string }))
                        }
                        variant="bordered"
                        isRequired
                        startContent={selectedGame && <Avatar src={selectedGame.icon} size="sm" className="w-6 h-6" />}
                      >
                        {GAMES.map((game) => (
                          <SelectItem
                            key={game.id}
                            value={game.id}
                            startContent={<Avatar src={game.icon} size="sm" className="w-6 h-6" />}
                          >
                            {game.name}
                          </SelectItem>
                        ))}
                      </Select>

                      <div className="flex gap-4">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-2 w-1/3">
                          <AvatarUploader onUpload={handleAvatarUpload} />
                          <p className="text-xs text-default-400">Squad Logo</p>
                        </div>

                        {/* Form Fields */}
                        <div className="flex flex-col gap-3 flex-1">
                          <Input
                            label="Team Name"
                            placeholder="Enter team name"
                            value={formData.displayName}
                            onValueChange={handleDisplayNameChange}
                            variant="bordered"
                            isRequired
                            startContent={<span className="text-default-400">@</span>}
                          />
                          <Input
                            label="URL Slug"
                            placeholder="team-url"
                            value={formData.slug}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, slug: value }))}
                            variant="bordered"
                            isRequired
                            startContent={<span className="text-xs text-default-400">leetgaming.pro/teams/</span>}
                          />
                          <Input
                            label="Tag"
                            placeholder="TAG"
                            value={formData.symbol}
                            onValueChange={(value) =>
                              setFormData((prev) => ({ ...prev, symbol: value.toUpperCase().slice(0, 5) }))
                            }
                            variant="bordered"
                            isRequired
                            maxLength={5}
                            startContent={<span className="text-default-400">#</span>}
                            description="1-5 characters"
                          />
                        </div>
                      </div>

                      <Textarea
                        label="Description"
                        placeholder="Tell us about your squad..."
                        value={formData.description}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
                        variant="bordered"
                        minRows={3}
                        maxLength={500}
                        description={`${formData.description.length}/500`}
                      />
                    </div>
                  </Tab>
                  <Tab key="members" title="Members">
                    <div className="py-4">
                      <PlayerSearchInput />
                    </div>
                  </Tab>
                  <Tab key="preview" title="Preview">
                    <div className="py-4">
                      <Card className="bg-gradient-to-br from-primary-50 to-secondary-50">
                        <CardBody className="gap-4">
                          <div className="flex items-center gap-4">
                            <Avatar
                              src={avatarFile ? URL.createObjectURL(avatarFile) : undefined}
                              showFallback
                              name={formData.displayName}
                              size="lg"
                              className="w-16 h-16"
                            />
                            <div>
                              <h3 className="text-xl font-bold">{formData.displayName || "Team Name"}</h3>
                              <div className="flex gap-2 mt-1">
                                {formData.symbol && (
                                  <Chip size="sm" variant="flat">
                                    #{formData.symbol}
                                  </Chip>
                                )}
                                {formData.game && (
                                  <Chip size="sm" variant="flat" color="primary">
                                    {GAMES.find((g) => g.id === formData.game)?.name}
                                  </Chip>
                                )}
                              </div>
                            </div>
                          </div>
                          {formData.description && (
                            <p className="text-sm text-default-600">{formData.description}</p>
                          )}
                          <p className="text-xs text-default-400">
                            leetgaming.pro/teams/{formData.slug || "your-team"}
                          </p>
                        </CardBody>
                      </Card>
                    </div>
                  </Tab>
                </Tabs>

                {submitError && (
                  <Card className="bg-danger-50 border border-danger-200">
                    <CardBody className="py-3">
                      <div className="flex items-center gap-2 text-danger">
                        <Icon icon="solar:danger-triangle-bold" width={20} />
                        <p className="text-sm">{submitError}</p>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onCloseModal} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  startContent={!isSubmitting && <Icon icon="solar:check-circle-bold" width={20} />}
                >
                  {isSubmitting ? "Creating..." : "Create Squad"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

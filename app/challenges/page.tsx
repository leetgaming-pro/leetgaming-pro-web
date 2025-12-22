"use client";

/**
 * Challenges Page
 * Lists all active challenges (VAR reviews, disputes, round restarts)
 * Follows LeetGaming PRO branding and UI standards
 */

import React, { useEffect, useState, useCallback } from "react";
import { useOptionalAuth } from "@/hooks/use-auth";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Avatar,
  Button,
  Spinner,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Pagination,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { title, subtitle } from "@/components/primitives";
import { PageContainer } from "@/components/layout/page-container";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import {
  Challenge,
  ChallengeStatus,
  ChallengeType,
  ChallengePriority,
} from "@/types/replay-api/challenge.types";

const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);

// Status colors for visual feedback
const statusColors: Record<ChallengeStatus, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  pending: "warning",
  under_review: "primary",
  voting: "secondary",
  resolved: "success",
  cancelled: "default",
  escalated: "danger",
};

// Type icons for challenge types
const typeIcons: Record<ChallengeType, string> = {
  var_review: "solar:video-frame-play-vertical-bold",
  round_restart: "solar:refresh-circle-bold",
  bug_report: "solar:bug-bold",
  admin_decision: "solar:shield-user-bold",
  player_dispute: "solar:users-group-rounded-bold",
};

// Priority colors
const priorityColors: Record<ChallengePriority, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  low: "default",
  normal: "primary",
  high: "warning",
  critical: "danger",
};

export default function ChallengesPage() {
  const { user, isAuthenticated } = useOptionalAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ChallengeType | "">("");
  const [statusFilter, setStatusFilter] = useState<ChallengeStatus | "">("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const ITEMS_PER_PAGE = 10;

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, string | number> = {
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
      };

      if (typeFilter) filters.type = typeFilter;
      if (statusFilter) filters.status = statusFilter;
      if (searchQuery) filters.search = searchQuery;
      if (activeTab === "my-challenges" && user?.id) {
        filters.challenger_id = user.id;
      }

      const result = await sdk.challenges.list(filters);
      if (result) {
        setChallenges(result.items);
        setTotalPages(Math.ceil(result.total / ITEMS_PER_PAGE));
      }
    } catch (err) {
      console.error("Failed to fetch challenges:", err);
      setError("Failed to load challenges. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter, searchQuery, activeTab, user?.id]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleViewChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    onOpen();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type: ChallengeType) => {
    const labels: Record<ChallengeType, string> = {
      var_review: "VAR Review",
      round_restart: "Round Restart",
      bug_report: "Bug Report",
      admin_decision: "Admin Decision",
      player_dispute: "Player Dispute",
    };
    return labels[type] || type;
  };

  return (
    <PageContainer maxWidth="7xl" padding="md">
      <div className="flex w-full flex-col items-center gap-8 py-8">
        {/* Header */}
        <div className="flex w-full flex-col items-center text-center gap-4">
          <div
            className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)",
            }}
          >
            <Icon
              icon="solar:shield-check-bold"
              width={36}
              className="text-[#F5F0E1] dark:text-[#34445C]"
            />
          </div>
          <h2 className="text-[#FF4654] dark:text-[#DCFF37] font-medium">
            Match Integrity
          </h2>
          <h1
            className={title({
              size: "lg",
              class: "text-[#34445C] dark:text-[#F5F0E1]",
            })}
          >
            Challenges
          </h1>
          <p className={subtitle({ class: "mt-2 max-w-2xl" })}>
            Submit VAR reviews, request round restarts, report bugs, or dispute
            match outcomes. Our transparent challenge system ensures fair play.
          </p>
        </div>

        {/* Tabs */}
        <div className="w-full max-w-6xl">
          <Tabs
            aria-label="Challenge tabs"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            classNames={{
              tabList:
                "bg-default-100 dark:bg-default-50/10 p-1 rounded-none",
              cursor: "bg-[#FF4654] dark:bg-[#DCFF37] rounded-none",
              tab: "h-10 rounded-none",
              tabContent:
                "group-data-[selected=true]:text-white dark:group-data-[selected=true]:text-[#34445C]",
            }}
          >
            <Tab
              key="all"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:list-bold" width={18} />
                  <span>All Challenges</span>
                </div>
              }
            />
            <Tab
              key="my-challenges"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:user-bold" width={18} />
                  <span>My Challenges</span>
                </div>
              }
            />
            <Tab
              key="pending"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:clock-circle-bold" width={18} />
                  <span>Pending Review</span>
                </div>
              }
            />
            <Tab
              key="voting"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="solar:hand-stars-bold" width={18} />
                  <span>Open for Voting</span>
                </div>
              }
            />
          </Tabs>
        </div>

        {/* Filters */}
        <div className="w-full max-w-6xl">
          <Card className="bg-default-50/50 dark:bg-default-50/10 rounded-none border border-default-200 dark:border-default-100/10">
            <CardBody className="gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search challenges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startContent={
                    <Icon
                      icon="solar:magnifer-linear"
                      className="text-default-400"
                    />
                  }
                  classNames={{
                    inputWrapper:
                      "bg-default-100 dark:bg-default-50/10 rounded-none border border-default-200 dark:border-default-100/10",
                  }}
                />
                <Select
                  placeholder="Challenge Type"
                  selectedKeys={typeFilter ? [typeFilter] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as ChallengeType | undefined;
                    setTypeFilter(value || "");
                  }}
                  classNames={{
                    trigger:
                      "bg-default-100 dark:bg-default-50/10 rounded-none border border-default-200 dark:border-default-100/10",
                  }}
                >
                  <SelectItem key="var_review">VAR Review</SelectItem>
                  <SelectItem key="round_restart">Round Restart</SelectItem>
                  <SelectItem key="bug_report">Bug Report</SelectItem>
                  <SelectItem key="admin_decision">Admin Decision</SelectItem>
                  <SelectItem key="player_dispute">Player Dispute</SelectItem>
                </Select>
                <Select
                  placeholder="Status"
                  selectedKeys={statusFilter ? [statusFilter] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as ChallengeStatus | undefined;
                    setStatusFilter(value || "");
                  }}
                  classNames={{
                    trigger:
                      "bg-default-100 dark:bg-default-50/10 rounded-none border border-default-200 dark:border-default-100/10",
                  }}
                >
                  <SelectItem key="pending">Pending</SelectItem>
                  <SelectItem key="under_review">Under Review</SelectItem>
                  <SelectItem key="voting">Voting</SelectItem>
                  <SelectItem key="resolved">Resolved</SelectItem>
                  <SelectItem key="cancelled">Cancelled</SelectItem>
                  <SelectItem key="escalated">Escalated</SelectItem>
                </Select>
                <Button
                  className="bg-[#FF4654] dark:bg-[#DCFF37] text-white dark:text-[#34445C] rounded-none font-medium"
                  startContent={<Icon icon="solar:add-circle-bold" width={20} />}
                  onPress={() => {
                    // Navigate to create challenge page or open modal
                    window.location.href = "/match-making";
                  }}
                >
                  New Challenge
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Challenges Table */}
        <div className="w-full max-w-6xl">
          <Card className="bg-default-50/50 dark:bg-default-50/10 rounded-none border border-default-200 dark:border-default-100/10">
            <CardHeader className="flex justify-between items-center border-b border-default-200 dark:border-default-100/10">
              <h3 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                Active Challenges
              </h3>
              <Chip size="sm" variant="flat" className="rounded-none">
                {challenges.length} Results
              </Chip>
            </CardHeader>
            <CardBody className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner
                    size="lg"
                    classNames={{
                      circle1: "border-b-[#FF4654] dark:border-b-[#DCFF37]",
                      circle2: "border-b-[#FF4654] dark:border-b-[#DCFF37]",
                    }}
                  />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Icon
                    icon="solar:danger-triangle-bold"
                    width={48}
                    className="text-danger"
                  />
                  <p className="text-danger">{error}</p>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={fetchChallenges}
                    className="rounded-none"
                  >
                    Retry
                  </Button>
                </div>
              ) : challenges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Icon
                    icon="solar:shield-check-bold"
                    width={48}
                    className="text-default-300"
                  />
                  <p className="text-default-500">No challenges found</p>
                  <p className="text-default-400 text-sm">
                    All matches are running smoothly!
                  </p>
                </div>
              ) : (
                <Table
                  aria-label="Challenges table"
                  classNames={{
                    wrapper: "bg-transparent shadow-none rounded-none",
                    th: "bg-default-100 dark:bg-default-50/10 text-[#34445C] dark:text-[#F5F0E1] rounded-none first:rounded-none last:rounded-none",
                    td: "py-3",
                  }}
                >
                  <TableHeader>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>TITLE</TableColumn>
                    <TableColumn>MATCH</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>PRIORITY</TableColumn>
                    <TableColumn>VOTES</TableColumn>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {challenges.map((challenge) => (
                      <TableRow key={challenge.id}>
                        <TableCell>
                          <Tooltip content={getTypeLabel(challenge.type)}>
                            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#FF4654]/10 to-[#FFC700]/10 dark:from-[#DCFF37]/10 dark:to-[#34445C]/10">
                              <Icon
                                icon={typeIcons[challenge.type]}
                                width={24}
                                className="text-[#FF4654] dark:text-[#DCFF37]"
                              />
                            </div>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-[#34445C] dark:text-[#F5F0E1]">
                              {challenge.title}
                            </span>
                            <span className="text-xs text-default-400 line-clamp-1">
                              {challenge.description}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            variant="flat"
                            className="rounded-none"
                          >
                            {challenge.match_id?.slice(0, 8) || "N/A"}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={statusColors[challenge.status]}
                            variant="flat"
                            className="rounded-none capitalize"
                          >
                            {challenge.status.replace("_", " ")}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={priorityColors[challenge.priority]}
                            variant="dot"
                            className="rounded-none capitalize"
                          >
                            {challenge.priority}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Icon
                              icon="solar:hand-stars-bold"
                              className="text-default-400"
                              width={16}
                            />
                            <span className="text-sm">
                              {challenge.votes?.length || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-default-500">
                            {formatDate(challenge.created_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Tooltip content="View Details">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="rounded-none"
                                onPress={() => handleViewChallenge(challenge)}
                              >
                                <Icon icon="solar:eye-bold" width={18} />
                              </Button>
                            </Tooltip>
                            {challenge.status === "voting" && (
                              <Tooltip content="Cast Vote">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  className="rounded-none text-[#FF4654] dark:text-[#DCFF37]"
                                >
                                  <Icon
                                    icon="solar:hand-stars-bold"
                                    width={18}
                                  />
                                </Button>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            total={totalPages}
            page={page}
            onChange={setPage}
            classNames={{
              cursor:
                "bg-[#FF4654] dark:bg-[#DCFF37] text-white dark:text-[#34445C] rounded-none",
              item: "rounded-none",
            }}
          />
        )}

        {/* Challenge Detail Modal */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="3xl"
          classNames={{
            base: "bg-background rounded-none",
            header: "border-b border-default-200 dark:border-default-100/10",
            body: "py-6",
            footer: "border-t border-default-200 dark:border-default-100/10",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                      }}
                    >
                      <Icon
                        icon={
                          selectedChallenge
                            ? typeIcons[selectedChallenge.type]
                            : "solar:shield-check-bold"
                        }
                        width={24}
                        className="text-[#F5F0E1] dark:text-[#34445C]"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                        {selectedChallenge?.title}
                      </h3>
                      <p className="text-sm text-default-500">
                        {selectedChallenge
                          ? getTypeLabel(selectedChallenge.type)
                          : ""}
                      </p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {selectedChallenge && (
                    <div className="space-y-6">
                      {/* Status & Priority */}
                      <div className="flex items-center gap-4">
                        <Chip
                          color={statusColors[selectedChallenge.status]}
                          variant="flat"
                          className="rounded-none capitalize"
                        >
                          {selectedChallenge.status.replace("_", " ")}
                        </Chip>
                        <Chip
                          color={priorityColors[selectedChallenge.priority]}
                          variant="dot"
                          className="rounded-none capitalize"
                        >
                          {selectedChallenge.priority} Priority
                        </Chip>
                      </div>

                      {/* Description */}
                      <div>
                        <h4 className="text-sm font-medium text-default-500 mb-2">
                          Description
                        </h4>
                        <p className="text-[#34445C] dark:text-[#F5F0E1]">
                          {selectedChallenge.description}
                        </p>
                      </div>

                      {/* Match Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-default-500 mb-2">
                            Match ID
                          </h4>
                          <Chip variant="flat" className="rounded-none">
                            {selectedChallenge.match_id || "N/A"}
                          </Chip>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-default-500 mb-2">
                            Round Number
                          </h4>
                          <Chip variant="flat" className="rounded-none">
                            Round {selectedChallenge.round_number || "N/A"}
                          </Chip>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-default-500 mb-2">
                            Submitted
                          </h4>
                          <p className="text-sm">
                            {formatDate(selectedChallenge.created_at)}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-default-500 mb-2">
                            Last Updated
                          </h4>
                          <p className="text-sm">
                            {formatDate(selectedChallenge.updated_at)}
                          </p>
                        </div>
                      </div>

                      {/* Evidence */}
                      {selectedChallenge.evidence &&
                        selectedChallenge.evidence.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-default-500 mb-2">
                              Evidence ({selectedChallenge.evidence.length})
                            </h4>
                            <div className="space-y-2">
                              {selectedChallenge.evidence.map((ev, idx) => (
                                <Card
                                  key={idx}
                                  className="bg-default-100 dark:bg-default-50/10 rounded-none"
                                >
                                  <CardBody className="py-3">
                                    <div className="flex items-center gap-3">
                                      <Icon
                                        icon={
                                          ev.type === "screenshot"
                                            ? "solar:gallery-bold"
                                            : ev.type === "video"
                                              ? "solar:videocamera-bold"
                                              : ev.type === "replay_clip"
                                                ? "solar:play-circle-bold"
                                                : "solar:document-bold"
                                        }
                                        width={20}
                                        className="text-default-500"
                                      />
                                      <span className="text-sm capitalize">
                                        {ev.type.replace("_", " ")}
                                      </span>
                                      {ev.description && (
                                        <span className="text-xs text-default-400">
                                          - {ev.description}
                                        </span>
                                      )}
                                    </div>
                                  </CardBody>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Votes Summary */}
                      {selectedChallenge.votes &&
                        selectedChallenge.votes.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-default-500 mb-2">
                              Votes ({selectedChallenge.votes.length})
                            </h4>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Icon
                                  icon="solar:like-bold"
                                  className="text-success"
                                  width={20}
                                />
                                <span className="text-success font-medium">
                                  {
                                    selectedChallenge.votes.filter(
                                      (v) => v.approved
                                    ).length
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Icon
                                  icon="solar:dislike-bold"
                                  className="text-danger"
                                  width={20}
                                />
                                <span className="text-danger font-medium">
                                  {
                                    selectedChallenge.votes.filter(
                                      (v) => !v.approved
                                    ).length
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="light"
                    onPress={onClose}
                    className="rounded-none"
                  >
                    Close
                  </Button>
                  {selectedChallenge?.status === "voting" && (
                    <>
                      <Button
                        color="danger"
                        variant="flat"
                        className="rounded-none"
                        startContent={
                          <Icon icon="solar:dislike-bold" width={18} />
                        }
                      >
                        Reject
                      </Button>
                      <Button
                        className="bg-[#FF4654] dark:bg-[#DCFF37] text-white dark:text-[#34445C] rounded-none"
                        startContent={
                          <Icon icon="solar:like-bold" width={18} />
                        }
                      >
                        Approve
                      </Button>
                    </>
                  )}
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </PageContainer>
  );
}


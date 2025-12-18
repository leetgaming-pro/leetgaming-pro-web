/**
 * Scrim Scheduler Component
 * Team practice match scheduling system
 * Per PRD D.5.3 - Scrim Scheduler (Missing)
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Textarea,
  Badge,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export type ScrimStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";
export type ScrimType = "practice" | "ranked" | "tournament_prep";

export interface ScrimRequest {
  id: string;
  requestingTeam: TeamInfo;
  receivingTeam: TeamInfo;
  proposedDate: Date;
  alternativeDates?: Date[];
  game: string;
  format: string; // e.g., 'Bo3', 'Bo5', 'Practice rounds'
  mapPool: string[];
  region: string;
  status: ScrimStatus;
  type: ScrimType;
  notes?: string;
  discordChannel?: string;
  serverInfo?: string;
  createdAt: Date;
  confirmedAt?: Date;
}

export interface TeamInfo {
  id: string;
  name: string;
  tag: string;
  logo?: string;
  rating: number;
  region: string;
  members: TeamMember[];
}

export interface TeamMember {
  id: string;
  username: string;
  avatar?: string;
  role: string;
  isOnline?: boolean;
}

export interface ScrimSchedulerProps {
  myTeam: TeamInfo;
  pendingRequests: ScrimRequest[];
  upcomingScrims: ScrimRequest[];
  pastScrims: ScrimRequest[];
  availableTeams: TeamInfo[];
  onCreateScrim: (scrim: Partial<ScrimRequest>) => void;
  onAcceptScrim: (scrimId: string, confirmedDate: Date) => void;
  onDeclineScrim: (scrimId: string, reason?: string) => void;
  onCancelScrim: (scrimId: string) => void;
}

// ============================================================================
// Constants
// ============================================================================

const GAMES = [
  { key: "cs2", label: "Counter-Strike 2" },
  { key: "valorant", label: "Valorant" },
];

const FORMATS = [
  { key: "practice", label: "Practice Rounds" },
  { key: "bo1", label: "Best of 1" },
  { key: "bo3", label: "Best of 3" },
  { key: "bo5", label: "Best of 5" },
];

const CS2_MAPS = [
  "Mirage",
  "Inferno",
  "Nuke",
  "Overpass",
  "Ancient",
  "Anubis",
  "Vertigo",
];
const VALORANT_MAPS = [
  "Ascent",
  "Bind",
  "Haven",
  "Split",
  "Icebox",
  "Breeze",
  "Fracture",
  "Pearl",
  "Lotus",
  "Sunset",
];

const STATUS_COLORS: Record<
  ScrimStatus,
  "default" | "primary" | "warning" | "success" | "danger"
> = {
  pending: "warning",
  confirmed: "success",
  in_progress: "primary",
  completed: "default",
  cancelled: "danger",
};

// ============================================================================
// Helper Components
// ============================================================================

function TeamCard({
  team,
  isSelected,
  onSelect,
}: {
  team: TeamInfo;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <Card
      isPressable={!!onSelect}
      isHoverable={!!onSelect}
      className={`${isSelected ? "border-2 border-primary" : ""}`}
      onClick={onSelect}
    >
      <CardBody className="p-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={team.logo}
            name={team.tag}
            size="lg"
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{team.name}</span>
              <Chip size="sm" variant="flat">
                [{team.tag}]
              </Chip>
            </div>
            <div className="flex items-center gap-2 text-sm text-default-500">
              <Icon icon="solar:star-bold" className="w-4 h-4 text-warning" />
              <span>{team.rating} Rating</span>
              <span>•</span>
              <span>{team.region}</span>
            </div>
          </div>
          {isSelected && (
            <Icon
              icon="solar:check-circle-bold"
              className="w-6 h-6 text-primary"
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function ScrimCard({
  scrim,
  isMyRequest,
  onAccept,
  onDecline,
  onCancel,
  onViewDetails,
}: {
  scrim: ScrimRequest;
  isMyRequest: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  onViewDetails: () => void;
}) {
  const otherTeam = isMyRequest ? scrim.receivingTeam : scrim.requestingTeam;
  const isPending = scrim.status === "pending";
  const canRespond = isPending && !isMyRequest;
  const canCancel = isPending && isMyRequest;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-start gap-4">
          <Avatar
            src={otherTeam.logo}
            name={otherTeam.tag}
            size="lg"
            className="flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{otherTeam.name}</span>
              <Chip
                size="sm"
                color={STATUS_COLORS[scrim.status]}
                variant="flat"
              >
                {scrim.status.replace("_", " ")}
              </Chip>
              {isMyRequest && (
                <Chip size="sm" variant="bordered">
                  Sent by you
                </Chip>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2 text-sm text-default-500 flex-wrap">
              <div className="flex items-center gap-1">
                <Icon icon="solar:calendar-bold" className="w-4 h-4" />
                <span>{new Date(scrim.proposedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
                <span>
                  {new Date(scrim.proposedDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Icon icon="solar:gamepad-bold" className="w-4 h-4" />
                <span>{scrim.format}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {scrim.mapPool.slice(0, 3).map((map) => (
                <Chip key={map} size="sm" variant="flat">
                  {map}
                </Chip>
              ))}
              {scrim.mapPool.length > 3 && (
                <Chip size="sm" variant="flat">
                  +{scrim.mapPool.length - 3}
                </Chip>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button size="sm" variant="flat" onClick={onViewDetails}>
              Details
            </Button>

            {canRespond && (
              <>
                <Button size="sm" color="success" onClick={onAccept}>
                  Accept
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onClick={onDecline}
                >
                  Decline
                </Button>
              </>
            )}

            {canCancel && (
              <Button
                size="sm"
                color="danger"
                variant="flat"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function CreateScrimModal({
  isOpen,
  onClose,
  availableTeams,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  availableTeams: TeamInfo[];
  onSubmit: (data: Partial<ScrimRequest>) => void;
}) {
  const [selectedTeam, setSelectedTeam] = useState<TeamInfo | null>(null);
  const [game, setGame] = useState<string>("cs2");
  const [format, setFormat] = useState<string>("bo3");
  const [selectedMaps, setSelectedMaps] = useState<string[]>([]);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const maps = game === "cs2" ? CS2_MAPS : VALORANT_MAPS;

  const filteredTeams = useMemo(() => {
    if (!searchQuery) return availableTeams;
    const query = searchQuery.toLowerCase();
    return availableTeams.filter(
      (team) =>
        team.name.toLowerCase().includes(query) ||
        team.tag.toLowerCase().includes(query)
    );
  }, [availableTeams, searchQuery]);

  const handleSubmit = () => {
    if (!selectedTeam || !date || !time) return;

    const proposedDate = new Date(`${date}T${time}`);

    onSubmit({
      receivingTeam: selectedTeam,
      proposedDate,
      game,
      format,
      mapPool: selectedMaps,
      notes,
      type: "practice",
    });

    onClose();
  };

  const isValid = selectedTeam && date && time && selectedMaps.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Schedule a Scrim</ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Team Selection */}
            <div>
              <h4 className="font-semibold mb-3">Select Opponent</h4>
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={
                  <Icon
                    icon="solar:magnifer-bold"
                    className="text-default-400"
                  />
                }
                className="mb-3"
              />
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {filteredTeams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    isSelected={selectedTeam?.id === team.id}
                    onSelect={() => setSelectedTeam(team)}
                  />
                ))}
              </div>
            </div>

            {/* Game & Format */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Game"
                selectedKeys={[game]}
                onChange={(e) => {
                  setGame(e.target.value);
                  setSelectedMaps([]);
                }}
              >
                {GAMES.map((g) => (
                  <SelectItem key={g.key}>{g.label}</SelectItem>
                ))}
              </Select>

              <Select
                label="Format"
                selectedKeys={[format]}
                onChange={(e) => setFormat(e.target.value)}
              >
                {FORMATS.map((f) => (
                  <SelectItem key={f.key}>{f.label}</SelectItem>
                ))}
              </Select>
            </div>

            {/* Map Pool */}
            <div>
              <h4 className="font-semibold mb-2">Map Pool</h4>
              <div className="flex flex-wrap gap-2">
                {maps.map((map) => (
                  <Chip
                    key={map}
                    variant={selectedMaps.includes(map) ? "solid" : "bordered"}
                    color={selectedMaps.includes(map) ? "primary" : "default"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedMaps((prev) =>
                        prev.includes(map)
                          ? prev.filter((m) => m !== map)
                          : [...prev, map]
                      );
                    }}
                  >
                    {map}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <Input
                type="time"
                label="Time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            {/* Notes */}
            <Textarea
              label="Notes (Optional)"
              placeholder="Any specific requirements, server preferences, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxRows={3}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSubmit} isDisabled={!isValid}>
            Send Request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ScrimDetailsModal({
  scrim,
  isOpen,
  onClose,
  isMyRequest,
  onAccept,
  onDecline,
  onCancel,
}: {
  scrim: ScrimRequest | null;
  isOpen: boolean;
  onClose: () => void;
  isMyRequest: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
}) {
  if (!scrim) return null;

  const otherTeam = isMyRequest ? scrim.receivingTeam : scrim.requestingTeam;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>Scrim Details</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Teams */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={scrim.requestingTeam.logo}
                  name={scrim.requestingTeam.tag}
                  size="lg"
                />
                <div>
                  <p className="font-semibold">{scrim.requestingTeam.name}</p>
                  <p className="text-sm text-default-500">Requesting Team</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-default-300">VS</div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold">{scrim.receivingTeam.name}</p>
                  <p className="text-sm text-default-500">Receiving Team</p>
                </div>
                <Avatar
                  src={scrim.receivingTeam.logo}
                  name={scrim.receivingTeam.tag}
                  size="lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-default-100 rounded-lg">
                <p className="text-sm text-default-500">Date & Time</p>
                <p className="font-semibold">
                  {new Date(scrim.proposedDate).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-default-100 rounded-lg">
                <p className="text-sm text-default-500">Format</p>
                <p className="font-semibold">{scrim.format}</p>
              </div>
              <div className="p-3 bg-default-100 rounded-lg">
                <p className="text-sm text-default-500">Game</p>
                <p className="font-semibold">
                  {GAMES.find((g) => g.key === scrim.game)?.label || scrim.game}
                </p>
              </div>
              <div className="p-3 bg-default-100 rounded-lg">
                <p className="text-sm text-default-500">Status</p>
                <Chip color={STATUS_COLORS[scrim.status]} variant="flat">
                  {scrim.status.replace("_", " ")}
                </Chip>
              </div>
            </div>

            {/* Map Pool */}
            <div>
              <p className="text-sm text-default-500 mb-2">Map Pool</p>
              <div className="flex flex-wrap gap-2">
                {scrim.mapPool.map((map) => (
                  <Chip key={map} variant="flat">
                    {map}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Roster */}
            <div>
              <p className="text-sm text-default-500 mb-2">Opponent Roster</p>
              <div className="flex flex-wrap gap-2">
                {otherTeam.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 p-2 bg-default-100 rounded-lg"
                  >
                    <Badge
                      content=""
                      color={member.isOnline ? "success" : "default"}
                      shape="circle"
                      placement="bottom-right"
                    >
                      <Avatar
                        src={member.avatar}
                        name={member.username}
                        size="sm"
                      />
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{member.username}</p>
                      <p className="text-xs text-default-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {scrim.notes && (
              <div className="p-3 bg-default-100 rounded-lg">
                <p className="text-sm text-default-500">Notes</p>
                <p>{scrim.notes}</p>
              </div>
            )}

            {scrim.serverInfo && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-default-500">Server Info</p>
                <code className="text-sm">{scrim.serverInfo}</code>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          {scrim.status === "pending" && !isMyRequest && (
            <>
              <Button color="danger" variant="flat" onClick={onDecline}>
                Decline
              </Button>
              <Button color="success" onClick={onAccept}>
                Accept
              </Button>
            </>
          )}
          {scrim.status === "pending" && isMyRequest && (
            <Button color="danger" variant="flat" onClick={onCancel}>
              Cancel Request
            </Button>
          )}
          <Button variant="flat" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ScrimScheduler({
  myTeam,
  pendingRequests,
  upcomingScrims,
  pastScrims,
  availableTeams,
  onCreateScrim,
  onAcceptScrim,
  onDeclineScrim,
  onCancelScrim,
}: ScrimSchedulerProps) {
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [selectedScrim, setSelectedScrim] = useState<ScrimRequest | null>(null);

  const createModal = useDisclosure();
  const detailsModal = useDisclosure();

  const incomingRequests = pendingRequests.filter(
    (s) => s.receivingTeam.id === myTeam.id
  );
  const outgoingRequests = pendingRequests.filter(
    (s) => s.requestingTeam.id === myTeam.id
  );

  const handleAccept = (scrim: ScrimRequest) => {
    onAcceptScrim(scrim.id, scrim.proposedDate);
    detailsModal.onClose();
  };

  const handleDecline = (scrim: ScrimRequest) => {
    onDeclineScrim(scrim.id);
    detailsModal.onClose();
  };

  const handleCancel = (scrim: ScrimRequest) => {
    onCancelScrim(scrim.id);
    detailsModal.onClose();
  };

  const openDetails = (scrim: ScrimRequest) => {
    setSelectedScrim(scrim);
    detailsModal.onOpen();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scrim Scheduler</h2>
          <p className="text-default-500">
            Schedule practice matches with other teams
          </p>
        </div>
        <Button
          color="primary"
          startContent={
            <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
          }
          onClick={createModal.onOpen}
        >
          Schedule Scrim
        </Button>
      </div>

      {/* Pending Requests Alert */}
      {incomingRequests.length > 0 && (
        <Card className="bg-warning/10 border-none">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <Icon icon="solar:bell-bold" className="w-6 h-6 text-warning" />
              <div className="flex-1">
                <p className="font-semibold">
                  {incomingRequests.length} Pending Scrim Request
                  {incomingRequests.length > 1 ? "s" : ""}
                </p>
                <p className="text-sm text-default-500">
                  Teams are waiting for your response
                </p>
              </div>
              <Button
                size="sm"
                color="warning"
                variant="flat"
                onClick={() => setActiveTab("pending")}
              >
                View Requests
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
      >
        <Tab
          key="upcoming"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:calendar-mark-bold" className="w-4 h-4" />
              <span>Upcoming</span>
              {upcomingScrims.length > 0 && (
                <Chip size="sm" variant="flat">
                  {upcomingScrims.length}
                </Chip>
              )}
            </div>
          }
        />
        <Tab
          key="pending"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
              <span>Pending</span>
              {pendingRequests.length > 0 && (
                <Chip size="sm" color="warning" variant="flat">
                  {pendingRequests.length}
                </Chip>
              )}
            </div>
          }
        />
        <Tab
          key="history"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:history-bold" className="w-4 h-4" />
              <span>History</span>
            </div>
          }
        />
      </Tabs>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "upcoming" && (
            <div className="space-y-3">
              {upcomingScrims.length === 0 ? (
                <Card>
                  <CardBody className="py-12 text-center">
                    <Icon
                      icon="solar:calendar-bold"
                      className="w-12 h-12 mx-auto text-default-300 mb-4"
                    />
                    <p className="text-lg font-semibold">No Upcoming Scrims</p>
                    <p className="text-default-500 mb-4">
                      Schedule a practice match with another team
                    </p>
                    <Button color="primary" onClick={createModal.onOpen}>
                      Schedule Scrim
                    </Button>
                  </CardBody>
                </Card>
              ) : (
                upcomingScrims.map((scrim) => (
                  <ScrimCard
                    key={scrim.id}
                    scrim={scrim}
                    isMyRequest={scrim.requestingTeam.id === myTeam.id}
                    onViewDetails={() => openDetails(scrim)}
                    onCancel={() => handleCancel(scrim)}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "pending" && (
            <div className="space-y-6">
              {incomingRequests.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon icon="solar:inbox-in-bold" className="w-5 h-5" />
                    Incoming Requests
                  </h4>
                  <div className="space-y-3">
                    {incomingRequests.map((scrim) => (
                      <ScrimCard
                        key={scrim.id}
                        scrim={scrim}
                        isMyRequest={false}
                        onViewDetails={() => openDetails(scrim)}
                        onAccept={() => handleAccept(scrim)}
                        onDecline={() => handleDecline(scrim)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {outgoingRequests.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon icon="solar:inbox-out-bold" className="w-5 h-5" />
                    Sent Requests
                  </h4>
                  <div className="space-y-3">
                    {outgoingRequests.map((scrim) => (
                      <ScrimCard
                        key={scrim.id}
                        scrim={scrim}
                        isMyRequest={true}
                        onViewDetails={() => openDetails(scrim)}
                        onCancel={() => handleCancel(scrim)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pendingRequests.length === 0 && (
                <Card>
                  <CardBody className="py-12 text-center">
                    <Icon
                      icon="solar:inbox-bold"
                      className="w-12 h-12 mx-auto text-default-300 mb-4"
                    />
                    <p className="text-lg font-semibold">No Pending Requests</p>
                    <p className="text-default-500">
                      All scrim requests have been handled
                    </p>
                  </CardBody>
                </Card>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {pastScrims.length === 0 ? (
                <Card>
                  <CardBody className="py-12 text-center">
                    <Icon
                      icon="solar:history-bold"
                      className="w-12 h-12 mx-auto text-default-300 mb-4"
                    />
                    <p className="text-lg font-semibold">No Scrim History</p>
                    <p className="text-default-500">
                      Completed scrims will appear here
                    </p>
                  </CardBody>
                </Card>
              ) : (
                pastScrims.map((scrim) => (
                  <ScrimCard
                    key={scrim.id}
                    scrim={scrim}
                    isMyRequest={scrim.requestingTeam.id === myTeam.id}
                    onViewDetails={() => openDetails(scrim)}
                  />
                ))
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <CreateScrimModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        availableTeams={availableTeams}
        onSubmit={onCreateScrim}
      />

      <ScrimDetailsModal
        scrim={selectedScrim}
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.onClose}
        isMyRequest={selectedScrim?.requestingTeam.id === myTeam.id}
        onAccept={selectedScrim ? () => handleAccept(selectedScrim) : undefined}
        onDecline={
          selectedScrim ? () => handleDecline(selectedScrim) : undefined
        }
        onCancel={selectedScrim ? () => handleCancel(selectedScrim) : undefined}
      />
    </div>
  );
}

export default ScrimScheduler;

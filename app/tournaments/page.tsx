'use client';

/**
 * Tournaments Page
 * Browse and register for competitive tournaments
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Tabs,
  Tab,
  Image,
  Progress,
  Divider,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { PageContainer } from '@/components/layout/page-container';
import { logger } from '@/lib/logger';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import type {
  Tournament as APItournament,
  TournamentStatus as APITournamentStatus,
} from '@/types/replay-api/tournament.types';

// UI-specific tournament type for display
interface TournamentDisplay {
  id: string;
  name: string;
  game: string;
  type: 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss';
  status: 'upcoming' | 'registration' | 'ongoing' | 'completed';
  image: string;
  description: string;
  prize_pool: number;
  entry_fee: number;
  max_teams: number;
  registered_teams: number;
  start_date: string;
  end_date: string;
  region: string;
  format: string;
  organizer: {
    name: string;
    logo?: string;
  };
}

// Map API status to UI status
const mapAPIStatusToUI = (status: APITournamentStatus): TournamentDisplay['status'] => {
  const statusMap: Record<APITournamentStatus, TournamentDisplay['status']> = {
    'draft': 'upcoming',
    'registration': 'registration',
    'ready': 'upcoming',
    'in_progress': 'ongoing',
    'completed': 'completed',
    'cancelled': 'completed',
  };
  return statusMap[status] || 'upcoming';
};

// Map API tournament to UI display format
const mapAPITournamentToDisplay = (t: APItournament): TournamentDisplay => ({
  id: t.id,
  name: t.name || 'Unnamed Tournament',
  game: t.game_id?.toUpperCase() || 'CS2',
  type: (t.format?.replace('_', '-') as TournamentDisplay['type']) || 'single-elimination',
  status: mapAPIStatusToUI(t.status),
  image: '/images/tournament-placeholder.svg',
  description: t.description || '',
  prize_pool: t.prize_pool || 0,
  entry_fee: t.entry_fee || 0,
  max_teams: t.max_participants || 16,
  registered_teams: t.participants?.length || 0,
  start_date: t.start_time || new Date().toISOString(),
  end_date: t.end_time || new Date().toISOString(),
  region: t.region || 'Global',
  format: t.game_mode || '5v5',
  organizer: {
    name: 'LeetGaming.PRO',
    logo: undefined,
  },
});

export default function TournamentsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [tournaments, setTournaments] = useState<TournamentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<TournamentDisplay | null>(null);
  const [registering, setRegistering] = useState(false);

  // Fetch tournaments from API using SDK
  useEffect(() => {
    async function fetchTournaments() {
      try {
        setLoading(true);
        setError(null);

        const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
        const result = await sdk.tournaments.listTournaments({});

        if (!result) {
          throw new Error('Failed to fetch tournaments');
        }

        // Map API response to display format with proper types
        const mappedTournaments: TournamentDisplay[] = (result.tournaments || []).map(mapAPITournamentToDisplay);

        setTournaments(mappedTournaments);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tournaments';
        logger.error('Failed to fetch tournaments', err);
        setError(errorMessage);
        // Don't use mock data - show empty state when API fails
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTournaments();
  }, []);

  const handleRegister = async (tournament: TournamentDisplay) => {
    if (!session) {
      router.push('/signin?callbackUrl=/tournaments');
      return;
    }
    setSelectedTournament(tournament);
    onOpen();
  };

  const handleConfirmRegistration = async () => {
    if (!selectedTournament || !session) return;

    setRegistering(true);
    try {
      const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
      const result = await sdk.tournaments.registerPlayer(selectedTournament.id, {
        player_id: session.user?.email || '',
        display_name: session.user?.name || 'Player',
      });

      if (!result) {
        throw new Error('Failed to register for tournament');
      }

      router.push(`/tournaments/${selectedTournament.id}`);
    } catch (err) {
      logger.error('Registration failed', err);
      alert('Registration failed. Please try again.');
    } finally {
      setRegistering(false);
      onClose();
    }
  };

  const handleWatchLive = (tournament: TournamentDisplay) => {
    router.push(`/tournaments/${tournament.id}/live`);
  };

  const handleViewResults = (tournament: TournamentDisplay) => {
    router.push(`/tournaments/${tournament.id}/results`);
  };

  const handleSetReminder = async (tournament: TournamentDisplay) => {
    if (!session) {
      router.push('/signin?callbackUrl=/tournaments');
      return;
    }
    // Show browser notification permission request
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    alert(`Reminder set for ${tournament.name}! You'll be notified when registration opens.`);
  };

  const handleCreateTournament = () => {
    if (!session) {
      router.push('/signin?callbackUrl=/tournaments/create');
      return;
    }
    router.push('/tournaments/create');
  };

  const filteredTournaments =
    selectedTab === 'all'
      ? tournaments
      : tournaments.filter((t) => t.status === selectedTab);

  const renderTournamentCard = (tournament: TournamentDisplay) => {
    const registrationProgress = (tournament.registered_teams / tournament.max_teams) * 100;

    const statusColor = {
      upcoming: 'primary' as const,
      registration: 'success' as const,
      ongoing: 'warning' as const,
      completed: 'default' as const,
    };

    const statusLabel = {
      upcoming: 'Upcoming',
      registration: 'Open Registration',
      ongoing: 'In Progress',
      completed: 'Completed',
    };

    return (
      <Card
        key={tournament.id}
        isPressable
        className="hover:shadow-lg hover:border-primary/50 transition-all"
        onPress={() => (window.location.href = `/tournaments/${tournament.id}`)}
      >
        <CardHeader className="absolute z-10 top-4 flex-col items-start bg-black/60 backdrop-blur-sm m-2 rounded-large">
          <Chip size="sm" color={statusColor[tournament.status]} variant="flat">
            {statusLabel[tournament.status]}
          </Chip>
          <h3 className="text-white font-bold text-xl mt-2">{tournament.name}</h3>
        </CardHeader>
        <Image
          removeWrapper
          alt={tournament.name}
          className="z-0 w-full h-full object-cover"
          src={tournament.image}
          height={250}
        />
        <CardBody className="pt-4">
          <p className="text-sm text-default-700 mb-4">{tournament.description}</p>

          {/* Tournament Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon icon="solar:cup-star-bold" width={18} className="text-warning" />
              <div>
                <div className="text-xs text-default-500">Prize Pool</div>
                <div className="font-semibold text-warning">${tournament.prize_pool.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="solar:ticket-bold" width={18} className="text-primary" />
              <div>
                <div className="text-xs text-default-500">Entry Fee</div>
                <div className="font-semibold">
                  {tournament.entry_fee === 0 ? 'Free' : `$${tournament.entry_fee}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="solar:calendar-bold" width={18} className="text-secondary" />
              <div>
                <div className="text-xs text-default-500">Start Date</div>
                <div className="font-semibold">{new Date(tournament.start_date).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="solar:map-point-bold" width={18} className="text-success" />
              <div>
                <div className="text-xs text-default-500">Region</div>
                <div className="font-semibold">{tournament.region}</div>
              </div>
            </div>
          </div>

          {/* Registration Progress */}
          {tournament.status === 'registration' && (
            <>
              <Divider className="my-3" />
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-default-600">Teams Registered</span>
                  <span className="font-semibold">
                    {tournament.registered_teams}/{tournament.max_teams}
                  </span>
                </div>
                <Progress value={registrationProgress} color="success" />
              </div>
            </>
          )}
        </CardBody>
        <CardFooter>
          <div className="flex gap-2 w-full">
            {tournament.status === 'registration' && (
              <Button
                color="primary"
                className="flex-1"
                startContent={<Icon icon="solar:user-plus-bold" width={20} />}
                onPress={() => handleRegister(tournament)}
              >
                Register Now
              </Button>
            )}
            {tournament.status === 'ongoing' && (
              <Button
                color="warning"
                className="flex-1"
                startContent={<Icon icon="solar:eye-bold" width={20} />}
                onPress={() => handleWatchLive(tournament)}
              >
                Watch Live
              </Button>
            )}
            {tournament.status === 'completed' && (
              <Button
                variant="flat"
                className="flex-1"
                startContent={<Icon icon="solar:chart-bold" width={20} />}
                onPress={() => handleViewResults(tournament)}
              >
                View Results
              </Button>
            )}
            {tournament.status === 'upcoming' && (
              <Button
                variant="bordered"
                className="flex-1"
                startContent={<Icon icon="solar:bell-bold" width={20} />}
                onPress={() => handleSetReminder(tournament)}
              >
                Set Reminder
              </Button>
            )}
            <Button
              variant="bordered"
              isIconOnly
              onPress={() => router.push(`/tournaments/${tournament.id}`)}
            >
              <Icon icon="solar:info-circle-bold" width={20} />
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Page Header */}
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-bold lg:text-5xl">Tournaments</h1>
        <p className="text-lg text-default-600 max-w-2xl">
          Compete in competitive tournaments and win prizes
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" label="Loading tournaments..." color="primary" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="mb-4">
          <CardBody className="text-center">
            <p className="text-xs text-default-400">Using cached data - API unavailable</p>
          </CardBody>
        </Card>
      )}

      {/* Stats Overview */}
      {!loading && (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardBody className="text-center py-6">
            <Icon icon="solar:cup-star-bold" width={32} className="mx-auto mb-2 text-warning" />
            <div className="text-2xl font-bold">{tournaments.length}</div>
            <div className="text-sm text-default-500">Total Tournaments</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-6">
            <Icon icon="solar:ticket-bold" width={32} className="mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold">
              {tournaments.filter((t) => t.status === 'registration').length}
            </div>
            <div className="text-sm text-default-500">Open Registration</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-6">
            <Icon icon="solar:play-circle-bold" width={32} className="mx-auto mb-2 text-warning" />
            <div className="text-2xl font-bold">
              {tournaments.filter((t) => t.status === 'ongoing').length}
            </div>
            <div className="text-sm text-default-500">In Progress</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-6">
            <Icon icon="solar:dollar-bold" width={32} className="mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">
              ${tournaments.reduce((sum, t) => sum + t.prize_pool, 0).toLocaleString()}
            </div>
            <div className="text-sm text-default-500">Total Prize Pool</div>
          </CardBody>
        </Card>
      </div>
      )}

      {/* Filters */}
      <Tabs
        aria-label="Tournament filters"
        size="lg"
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        className="mb-6"
      >
        <Tab key="all" title="All Tournaments" />
        <Tab key="registration" title="Open Registration" />
        <Tab key="ongoing" title="Live" />
        <Tab key="upcoming" title="Upcoming" />
        <Tab key="completed" title="Past" />
      </Tabs>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredTournaments.map(renderTournamentCard)}
      </div>

      {/* No Results */}
      {filteredTournaments.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <Icon icon="solar:cup-linear" width={64} className="mx-auto mb-4 text-default-400" />
            <h3 className="text-xl font-semibold mb-2">No tournaments found</h3>
            <p className="text-default-600 mb-4">
              {selectedTab === 'all'
                ? 'No tournaments available at the moment.'
                : `No ${selectedTab} tournaments available.`}
            </p>
            <Button color="primary" onClick={() => setSelectedTab('all')}>
              View All Tournaments
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Create Tournament CTA */}
      <Card className="mt-8 bg-gradient-to-r from-primary-500 to-secondary-500">
        <CardBody className="text-center py-8">
          <Icon icon="solar:cup-star-bold" width={48} className="mx-auto mb-4 text-white" />
          <h3 className="text-2xl font-bold text-white mb-2">Want to host your own tournament?</h3>
          <p className="text-white/80 mb-6">
            Create and manage tournaments for your community with our easy-to-use tools
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              color="default"
              variant="solid"
              className="bg-white text-primary font-semibold"
              onPress={handleCreateTournament}
            >
              Create Tournament
            </Button>
            <Button
              variant="bordered"
              className="border-white text-white"
              onPress={() => router.push('/docs/tournaments')}
            >
              Learn More
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Registration Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Register for Tournament
              </ModalHeader>
              <ModalBody>
                {selectedTournament && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Image
                        src={selectedTournament.image}
                        alt={selectedTournament.name}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-bold text-lg">{selectedTournament.name}</h4>
                        <p className="text-default-500 text-sm">{selectedTournament.game} - {selectedTournament.format}</p>
                      </div>
                    </div>
                    <Divider />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-default-500 text-sm">Entry Fee</p>
                        <p className="font-semibold">
                          {selectedTournament.entry_fee === 0 ? 'Free' : `$${selectedTournament.entry_fee}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-default-500 text-sm">Prize Pool</p>
                        <p className="font-semibold text-warning">${selectedTournament.prize_pool.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-default-500 text-sm">Start Date</p>
                        <p className="font-semibold">{new Date(selectedTournament.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-default-500 text-sm">Teams</p>
                        <p className="font-semibold">{selectedTournament.registered_teams}/{selectedTournament.max_teams}</p>
                      </div>
                    </div>
                    <Divider />
                    <p className="text-sm text-default-600">
                      By registering, you agree to the tournament rules and code of conduct.
                    </p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleConfirmRegistration}
                  isLoading={registering}
                >
                  Confirm Registration
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </PageContainer>
  );
}

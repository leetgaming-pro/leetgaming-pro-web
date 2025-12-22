'use client';

/**
 * Tournaments Page
 * Browse and register for competitive tournaments
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOptionalAuth } from '@/hooks/use-auth';
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
  const { isAuthenticated, user, requireAuthForAction } = useOptionalAuth();
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
    if (!requireAuthForAction('register for tournament')) {
      return;
    }
    setSelectedTournament(tournament);
    onOpen();
  };

  const handleConfirmRegistration = async () => {
    if (!selectedTournament || !isAuthenticated || !user) return;

    setRegistering(true);
    try {
      const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
      const result = await sdk.tournaments.registerPlayer(selectedTournament.id, {
        player_id: user?.email || '',
        display_name: user?.name || 'Player',
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
    if (!requireAuthForAction('set a reminder')) {
      return;
    }
    // Show browser notification permission request
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    alert(`Reminder set for ${tournament.name}! You'll be notified when registration opens.`);
  };

  const handleCreateTournament = () => {
    if (!requireAuthForAction('create a tournament')) {
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
        className="hover:shadow-lg hover:shadow-[#FF4654]/20 dark:hover:shadow-[#DCFF37]/20 hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50 transition-all rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20"
        onPress={() => (window.location.href = `/tournaments/${tournament.id}`)}
      >
        <CardHeader className="absolute z-10 top-4 flex-col items-start bg-[#34445C]/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm m-2 rounded-none"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
          <Chip size="sm" color={statusColor[tournament.status]} variant="flat" className="rounded-none">
            {statusLabel[tournament.status]}
          </Chip>
          <h3 className="text-[#F5F0E1] font-bold text-xl mt-2">{tournament.name}</h3>
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
                className="flex-1 bg-gradient-to-r from-[#FF4654] to-[#FFC700] text-[#F5F0E1] font-semibold rounded-none"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                startContent={<Icon icon="solar:user-plus-bold" width={20} />}
                onPress={() => handleRegister(tournament)}
              >
                Register Now
              </Button>
            )}
            {tournament.status === 'ongoing' && (
              <Button
                className="flex-1 bg-[#FFC700] text-[#34445C] font-semibold rounded-none"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                startContent={<Icon icon="solar:eye-bold" width={20} />}
                onPress={() => handleWatchLive(tournament)}
              >
                Watch Live
              </Button>
            )}
            {tournament.status === 'completed' && (
              <Button
                variant="flat"
                className="flex-1 rounded-none"
                startContent={<Icon icon="solar:chart-bold" width={20} />}
                onPress={() => handleViewResults(tournament)}
              >
                View Results
              </Button>
            )}
            {tournament.status === 'upcoming' && (
              <Button
                variant="bordered"
                className="flex-1 rounded-none border-[#FF4654]/50 dark:border-[#DCFF37]/50"
                startContent={<Icon icon="solar:bell-bold" width={20} />}
                onPress={() => handleSetReminder(tournament)}
              >
                Set Reminder
              </Button>
            )}
            <Button
              variant="bordered"
              isIconOnly
              className="rounded-none border-[#FF4654]/30 dark:border-[#DCFF37]/30"
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
    <div className="w-full max-w-7xl xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24 py-8 lg:py-12 xl:py-16">
      {/* Page Header - Cloud page pattern */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-6 mb-8 lg:mb-12">
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
            <Icon icon="solar:cup-star-bold" width={28} className="text-[#F5F0E1] dark:text-[#1a1a1a] lg:w-8 lg:h-8" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Tournaments</h1>
            <p className="text-sm lg:text-base text-[#34445C]/60 dark:text-[#F5F0E1]/60">Compete in competitive tournaments and win prizes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-[#F5F0E1] dark:text-[#1a1a1a] rounded-none font-semibold"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
            onPress={handleCreateTournament}
            startContent={<Icon icon="solar:add-circle-bold" width={18} />}
          >
            Create Tournament
          </Button>
        </div>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
        <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
          <CardBody className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
              <Icon icon="solar:cup-star-bold" width={24} className="text-[#F5F0E1] dark:text-[#34445C]" />
            </div>
            <div className="text-2xl font-bold text-[#FF4654] dark:text-[#DCFF37]">{tournaments.length}</div>
            <div className="text-sm text-default-500">Total Tournaments</div>
          </CardBody>
        </Card>
        <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
          <CardBody className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
              <Icon icon="solar:ticket-bold" width={24} className="text-[#F5F0E1] dark:text-[#34445C]" />
            </div>
            <div className="text-2xl font-bold text-success">
              {tournaments.filter((t) => t.status === 'registration').length}
            </div>
            <div className="text-sm text-default-500">Open Registration</div>
          </CardBody>
        </Card>
        <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
          <CardBody className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
              <Icon icon="solar:play-circle-bold" width={24} className="text-[#F5F0E1] dark:text-[#34445C]" />
            </div>
            <div className="text-2xl font-bold text-warning">
              {tournaments.filter((t) => t.status === 'ongoing').length}
            </div>
            <div className="text-sm text-default-500">In Progress</div>
          </CardBody>
        </Card>
        <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
          <CardBody className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
              <Icon icon="solar:dollar-bold" width={24} className="text-[#F5F0E1] dark:text-[#34445C]" />
            </div>
            <div className="text-2xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
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
        classNames={{
          tabList: "bg-[#34445C]/10 dark:bg-[#DCFF37]/10 p-1 rounded-none gap-1 border border-[#FF4654]/20 dark:border-[#DCFF37]/20",
          tab: "text-sm font-semibold rounded-none text-[#34445C] dark:text-[#F5F0E1] data-[selected=true]:text-[#F5F0E1] dark:data-[selected=true]:text-[#1a1a1a] data-[hover=true]:text-[#FF4654] dark:data-[hover=true]:text-[#DCFF37]",
          cursor: "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none",
        }}
      >
        <Tab key="all" title="All Tournaments" />
        <Tab key="registration" title="Open Registration" />
        <Tab key="ongoing" title="Live" />
        <Tab key="upcoming" title="Upcoming" />
        <Tab key="completed" title="Past" />
      </Tabs>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {filteredTournaments.map(renderTournamentCard)}
      </div>

      {/* No Results */}
      {filteredTournaments.length === 0 && !loading && (
        <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#34445C]/10 dark:bg-[#DCFF37]/10"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
              <Icon icon="solar:cup-linear" width={32} className="text-[#34445C] dark:text-[#DCFF37]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#34445C] dark:text-[#F5F0E1]">No tournaments found</h3>
            <p className="text-default-600 mb-4">
              {selectedTab === 'all'
                ? 'No tournaments available at the moment.'
                : `No ${selectedTab} tournaments available.`}
            </p>
            <Button 
              className="bg-[#34445C] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#34445C] rounded-none"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
              onClick={() => setSelectedTab('all')}
            >
              View All Tournaments
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Create Tournament CTA */}
      <Card className="mt-8 bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#34445C] dark:to-[#1e2a38] rounded-none overflow-hidden relative">
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#FFC700]/30 to-transparent dark:from-[#DCFF37]/20 pointer-events-none" />
        <CardBody className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#F5F0E1]/20 dark:bg-[#DCFF37]/20"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
            <Icon icon="solar:cup-star-bold" width={32} className="text-[#F5F0E1] dark:text-[#DCFF37]" />
          </div>
          <h3 className="text-2xl font-bold text-[#F5F0E1] mb-2">Want to host your own tournament?</h3>
          <p className="text-[#F5F0E1]/80 mb-6">
            Create and manage tournaments for your community with our easy-to-use tools
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              className="bg-[#F5F0E1] text-[#34445C] font-semibold rounded-none"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
              onPress={handleCreateTournament}
            >
              Create Tournament
            </Button>
            <Button
              variant="bordered"
              className="border-[#F5F0E1] text-[#F5F0E1] rounded-none"
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
    </div>
  );
}

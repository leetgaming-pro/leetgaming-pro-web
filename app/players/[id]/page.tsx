'use client';

/**
 * Player Profile Detail Page
 * Comprehensive player statistics, match history, and achievements
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Button,
  Chip,
  Tabs,
  Tab,
  Progress,
  Skeleton,
  Image,
  Divider,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { PageContainer } from '@/components/layouts/centered-content';
import { ShareButton } from '@/components/share/share-button';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);

import { PlayerProfile as PlayerProfileBase } from '@/types/replay-api/entities.types';

/** Extended player profile from API response - uses Omit to avoid type conflicts with base Date properties */
interface PlayerAPIResponse extends Omit<PlayerProfileBase, 'created_at' | 'updated_at'> {
  player_id?: string;
  name?: string;
  steam_id?: string;
  discord_id?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
  rating?: number;
  stats?: {
    matches_played?: number;
    wins?: number;
    losses?: number;
    kills?: number;
    deaths?: number;
    assists?: number;
    headshot_percentage?: number;
    accuracy?: number;
    adr?: number;
  };
}

interface PlayerProfile {
  id: string;
  nickname: string;
  avatar: string;
  description: string;
  roles: string[];
  steam_id?: string;
  discord_id?: string;
  country?: string;
  join_date: string;
  stats: {
    matches_played: number;
    wins: number;
    losses: number;
    kills: number;
    deaths: number;
    assists: number;
    headshot_percentage: number;
    accuracy: number;
    adr: number; // Average Damage per Round
    rating: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earned_at: string;
  }>;
  recent_matches: Array<{
    id: string;
    date: string;
    map: string;
    result: 'win' | 'loss' | 'tie';
    score: string;
    kills: number;
    deaths: number;
    assists: number;
  }>;
}

export default function PlayerDetailPage() {
  const params = useParams();
  const playerId = params.id as string;
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayerProfile() {
      try {
        setLoading(true);
        setError(null);

        // Fetch player from API
        const response = await sdk.playerProfiles.getPlayerProfile(playerId);
        const playerData = response as PlayerAPIResponse | null;

        if (playerData) {
          // Map API response to PlayerProfile interface
          const createdAt = playerData.created_at
            ? (typeof playerData.created_at === 'string' ? playerData.created_at : new Date(playerData.created_at).toISOString())
            : new Date().toISOString();

          const apiPlayer: PlayerProfile = {
            id: playerData.player_id || playerId,
            nickname: playerData.nickname || playerData.name || 'Unknown Player',
            avatar: playerData.avatar_uri || `https://i.pravatar.cc/150?u=${playerId}`,
            description: playerData.description || 'A competitive esports player.',
            roles: playerData.roles || ['Player'],
            steam_id: playerData.steam_id,
            discord_id: playerData.discord_id,
            country: playerData.country || 'Global',
            join_date: createdAt,
            stats: {
              matches_played: playerData.stats?.matches_played || 0,
              wins: playerData.stats?.wins || 0,
              losses: playerData.stats?.losses || 0,
              kills: playerData.stats?.kills || 0,
              deaths: playerData.stats?.deaths || 0,
              assists: playerData.stats?.assists || 0,
              headshot_percentage: playerData.stats?.headshot_percentage || 0,
              accuracy: playerData.stats?.accuracy || 0,
              adr: playerData.stats?.adr || 0,
              rating: playerData.rating || 1.0,
            },
            achievements: [], // Achievements need separate API - empty for now
            recent_matches: [], // Match history needs separate API - empty for now
          };
          setPlayer(apiPlayer);
        } else {
          // Player not found - show error state
          setError('Player not found');
          setPlayer(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load player profile';
        logger.error('Failed to load player profile', err);
        setError(errorMessage);
        // No fallback to mock data - show error state instead
        setPlayer(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayerProfile();
  }, [playerId]);

  if (loading) {
    return (
      <PageContainer maxWidth="7xl">
        <div className="space-y-6">
          <Skeleton className="w-full h-64 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="w-full h-32 rounded-xl" />
            <Skeleton className="w-full h-32 rounded-xl" />
            <Skeleton className="w-full h-32 rounded-xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !player) {
    return (
      <PageContainer maxWidth="7xl">
        <Card>
          <CardBody className="text-center py-12">
            <Icon icon="solar:ghost-linear" width={64} className="mx-auto mb-4 text-danger" />
            <p className="text-lg text-danger">{error || 'Player not found'}</p>
            <Button className="mt-4" color="primary" onClick={() => (window.location.href = '/players')}>
              Back to Players
            </Button>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  const winRate = ((player.stats.wins / player.stats.matches_played) * 100).toFixed(1);
  const kd = (player.stats.kills / player.stats.deaths).toFixed(2);

  return (
    <PageContainer maxWidth="7xl">
      {/* Header Card */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar src={player.avatar} className="w-32 h-32" />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{player.nickname}</h1>
                {player.country && (
                  <Chip size="sm" variant="flat" startContent={<span className="text-lg">🇺🇸</span>}>
                    {player.country}
                  </Chip>
                )}
              </div>
              <p className="text-default-600 mb-4">{player.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {player.roles.map((role) => (
                  <Chip key={role} color="primary" variant="flat">
                    {role}
                  </Chip>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-default-500">
                {player.steam_id && (
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:gameboy-bold" width={16} />
                    <span>Steam: {player.steam_id.slice(-8)}</span>
                  </div>
                )}
                {player.discord_id && (
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:chat-round-bold" width={16} />
                    <span>{player.discord_id}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Icon icon="solar:calendar-bold" width={16} />
                  <span>Joined {new Date(player.join_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button color="primary" startContent={<Icon icon="solar:user-plus-bold" width={20} />}>
                Add Friend
              </Button>
              <Button variant="bordered" startContent={<Icon icon="solar:chat-round-bold" width={20} />}>
                Message
              </Button>
              <ShareButton
                contentType="player"
                contentId={playerId}
                title={player.nickname}
                description={player.description}
                variant="bordered"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="text-center py-6">
            <div className="text-3xl font-bold text-primary">{player.stats.matches_played}</div>
            <div className="text-sm text-default-500">Matches</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-6">
            <div className="text-3xl font-bold text-success">{winRate}%</div>
            <div className="text-sm text-default-500">Win Rate</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-6">
            <div className="text-3xl font-bold text-warning">{kd}</div>
            <div className="text-sm text-default-500">K/D Ratio</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-6">
            <div className="text-3xl font-bold text-secondary">{player.stats.rating}</div>
            <div className="text-sm text-default-500">Rating</div>
          </CardBody>
        </Card>
      </div>

      {/* Detailed Stats & Content */}
      <Tabs aria-label="Player tabs" size="lg" className="mb-6">
        <Tab key="overview" title="Overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Combat Stats */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold">Combat Statistics</h3>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Headshot %</span>
                    <span className="font-semibold">{player.stats.headshot_percentage}%</span>
                  </div>
                  <Progress value={player.stats.headshot_percentage} color="danger" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Accuracy</span>
                    <span className="font-semibold">{player.stats.accuracy}%</span>
                  </div>
                  <Progress value={player.stats.accuracy} color="warning" />
                </div>
                <Divider />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-success">{player.stats.kills}</div>
                    <div className="text-xs text-default-500">Kills</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-danger">{player.stats.deaths}</div>
                    <div className="text-xs text-default-500">Deaths</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{player.stats.assists}</div>
                    <div className="text-xs text-default-500">Assists</div>
                  </div>
                </div>
                <Divider />
                <div className="flex justify-between">
                  <span>ADR (Avg Damage/Round)</span>
                  <span className="font-semibold text-primary">{player.stats.adr}</span>
                </div>
              </CardBody>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold">Achievements</h3>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-3">
                {player.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-default-100 rounded-lg">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <Icon icon={achievement.icon} width={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{achievement.name}</div>
                      <div className="text-xs text-default-500">{achievement.description}</div>
                    </div>
                    <div className="text-xs text-default-400">
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </CardBody>
              <CardFooter>
                <Button variant="flat" className="w-full">
                  View All Achievements
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Tab>

        <Tab key="matches" title="Match History">
          <Card>
            <CardBody>
              <div className="space-y-3">
                {player.recent_matches.map((match) => (
                  <Card key={match.id} isPressable className="hover:bg-default-100">
                    <CardBody>
                      <div className="flex items-center gap-4">
                        <Chip
                          color={match.result === 'win' ? 'success' : match.result === 'loss' ? 'danger' : 'default'}
                          variant="flat"
                          size="lg"
                        >
                          {match.result.toUpperCase()}
                        </Chip>
                        <div className="flex-1">
                          <div className="font-semibold">{match.map}</div>
                          <div className="text-sm text-default-500">
                            {new Date(match.date).toLocaleDateString()} • Score: {match.score}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="text-success font-semibold">{match.kills}</span> /{' '}
                            <span className="text-danger font-semibold">{match.deaths}</span> /{' '}
                            <span className="text-primary font-semibold">{match.assists}</span>
                          </div>
                          <div className="text-xs text-default-500">K / D / A</div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
            <CardFooter>
              <Button variant="flat" className="w-full">
                Load More Matches
              </Button>
            </CardFooter>
          </Card>
        </Tab>

        <Tab key="stats" title="Detailed Stats">
          <Card>
            <CardBody className="text-center py-12">
              <Icon icon="solar:chart-2-bold" width={64} className="mx-auto mb-4 text-default-400" />
              <p className="text-lg text-default-600">Advanced statistics coming soon</p>
              <p className="text-sm text-default-400 mt-2">
                Heatmaps, weapon stats, performance trends, and more
              </p>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </PageContainer>
  );
}

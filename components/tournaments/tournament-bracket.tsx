'use client';

/**
 * Tournament Bracket Component
 * Displays single/double elimination tournament brackets
 */

import React from 'react';
import { Card, CardBody, Chip, Avatar } from '@nextui-org/react';
import { Icon } from '@iconify/react';

export interface BracketMatch {
  id: string;
  round: number;
  position: number;
  team1?: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  };
  team2?: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  };
  winner?: string; // team id
  status: 'pending' | 'ongoing' | 'completed';
  scheduledAt?: string;
  playedAt?: string;
  nextMatchId?: string;
}

export interface TournamentBracketProps {
  /** All matches in the bracket */
  matches: BracketMatch[];
  /** Tournament type */
  type?: 'single-elimination' | 'double-elimination';
  /** Number of rounds */
  rounds: number;
  /** Title for the bracket */
  title?: string;
  /** Callback when match is clicked */
  onMatchClick?: (match: BracketMatch) => void;
}

export function TournamentBracket({
  matches,
  type = 'single-elimination',
  rounds,
  title,
  onMatchClick,
}: TournamentBracketProps) {
  // Group matches by round
  const matchesByRound: BracketMatch[][] = Array.from({ length: rounds }, (_, i) =>
    matches.filter((m) => m.round === i + 1).sort((a, b) => a.position - b.position)
  );

  const renderTeam = (
    team: BracketMatch['team1'],
    isWinner: boolean,
    matchStatus: BracketMatch['status']
  ) => {
    if (!team) {
      return (
        <div className="flex items-center gap-2 p-2 bg-default-100 rounded-lg opacity-50">
          <div className="w-6 h-6 rounded-full bg-default-200" />
          <span className="text-sm text-default-400">TBD</span>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center justify-between gap-2 p-2 rounded-lg transition-all ${
          isWinner
            ? 'bg-success/10 border-2 border-success'
            : matchStatus === 'completed'
            ? 'bg-default-100 opacity-60'
            : 'bg-default-100 hover:bg-default-200'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {team.logo ? (
            <Avatar src={team.logo} size="sm" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon icon="solar:users-group-rounded-bold" width={14} className="text-primary" />
            </div>
          )}
          <span className={`text-sm font-medium truncate ${isWinner ? 'text-success' : ''}`}>
            {team.name}
          </span>
        </div>
        {team.score !== undefined && (
          <span className={`text-lg font-bold ${isWinner ? 'text-success' : 'text-default-600'}`}>
            {team.score}
          </span>
        )}
      </div>
    );
  };

  const renderMatch = (match: BracketMatch) => {
    const team1IsWinner = match.winner === match.team1?.id;
    const team2IsWinner = match.winner === match.team2?.id;

    return (
      <Card
        key={match.id}
        isPressable={!!onMatchClick}
        onPress={() => onMatchClick?.(match)}
        className="mb-4 min-w-[240px]"
      >
        <CardBody className="p-3">
          <div className="space-y-2">
            {/* Match Status */}
            <div className="flex items-center justify-between mb-2">
              <Chip
                size="sm"
                variant="flat"
                color={
                  match.status === 'completed'
                    ? 'success'
                    : match.status === 'ongoing'
                    ? 'warning'
                    : 'default'
                }
              >
                {match.status === 'completed'
                  ? 'Final'
                  : match.status === 'ongoing'
                  ? 'Live'
                  : 'Pending'}
              </Chip>
              {match.scheduledAt && match.status === 'pending' && (
                <span className="text-xs text-default-500">
                  {new Date(match.scheduledAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Teams */}
            {renderTeam(match.team1, team1IsWinner, match.status)}
            <div className="flex justify-center">
              <div className="text-xs text-default-400">vs</div>
            </div>
            {renderTeam(match.team2, team2IsWinner, match.status)}
          </div>
        </CardBody>
      </Card>
    );
  };

  const getRoundLabel = (roundIndex: number) => {
    const roundNumber = roundIndex + 1;
    const totalRounds = rounds;

    if (roundNumber === totalRounds) return 'Final';
    if (roundNumber === totalRounds - 1) return 'Semi-Final';
    if (roundNumber === totalRounds - 2) return 'Quarter-Final';
    return `Round ${roundNumber}`;
  };

  return (
    <div className="tournament-bracket">
      {title && (
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <Chip variant="flat" color="primary">
            {type === 'single-elimination' ? 'Single Elimination' : 'Double Elimination'}
          </Chip>
        </div>
      )}

      <div className="bracket-container overflow-x-auto">
        <div className="flex gap-8 min-w-max p-4">
          {matchesByRound.map((roundMatches, roundIndex) => (
            <div key={roundIndex} className="bracket-round flex flex-col">
              {/* Round Header */}
              <div className="mb-4 text-center">
                <h3 className="text-lg font-semibold">{getRoundLabel(roundIndex)}</h3>
                <p className="text-xs text-default-500">{roundMatches.length} matches</p>
              </div>

              {/* Matches */}
              <div
                className="flex flex-col justify-around flex-1"
                style={{
                  gap: `${Math.pow(2, roundIndex) * 20}px`,
                }}
              >
                {roundMatches.map((match) => renderMatch(match))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <Chip size="sm" variant="flat" color="success">
            Final
          </Chip>
          <span className="text-default-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <Chip size="sm" variant="flat" color="warning">
            Live
          </Chip>
          <span className="text-default-600">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <Chip size="sm" variant="flat" color="default">
            Pending
          </Chip>
          <span className="text-default-600">Not Started</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Score Permissions Unit Tests
 *
 * Tests getScorePermissions() for all status × role combinations,
 * ensuring financial-grade RBAC correctness.
 */

import { getScorePermissions, type MatchResult } from './scores.types';

// --- Helpers ---

const userId = 'user-123';
const adminUser = { id: userId, isAdmin: true };
const regularUser = { id: userId, isAdmin: false };
const organizerId = 'org-456';
const organizerUser = { id: organizerId, isAdmin: false };

function makeResult(overrides: Partial<MatchResult> = {}): MatchResult {
  return {
    id: 'result-1',
    match_id: 'match-1',
    game_id: 'cs2',
    map_name: 'de_dust2',
    mode: 'competitive',
    source: 'tournament_admin',
    status: 'submitted',
    submitted_by: 'submitter-1',
    played_at: new Date().toISOString(),
    duration: 2700,
    is_draw: false,
    rounds_played: 28,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    team_results: [
      { team_id: 'team-a', team_name: 'Alpha', score: 16, position: 1, players: [userId] },
      { team_id: 'team-b', team_name: 'Beta', score: 12, position: 2, players: ['other-player'] },
    ],
    player_results: [
      { player_id: userId, team_id: 'team-a', score: 100, kills: 20, deaths: 15, assists: 5, rating: 1.15, is_mvp: true },
      { player_id: 'other-player', team_id: 'team-b', score: 80, kills: 15, deaths: 20, assists: 3, rating: 0.85, is_mvp: false },
    ],
    winner_team_id: 'team-a',
    dispute_count: 0,
    ...overrides,
  };
}

// --- No user / null result ---

describe('getScorePermissions', () => {
  describe('when no user is provided', () => {
    it('returns all false permissions', () => {
      const perms = getScorePermissions(makeResult(), null);
      expect(perms.canVerify).toBe(false);
      expect(perms.canDispute).toBe(false);
      expect(perms.canConciliate).toBe(false);
      expect(perms.canFinalize).toBe(false);
      expect(perms.canCancel).toBe(false);
      expect(perms.canSubmit).toBe(false);
    });

    it('returns false for user with undefined ID', () => {
      const perms = getScorePermissions(makeResult(), { id: undefined });
      expect(perms.canSubmit).toBe(false);
    });
  });

  describe('when result is null', () => {
    it('returns minimal permissions for admin', () => {
      const perms = getScorePermissions(null, adminUser);
      expect(perms.canSubmit).toBe(true);
      expect(perms.isAdmin).toBe(true);
      expect(perms.canVerify).toBe(false);
      expect(perms.canDispute).toBe(false);
      expect(perms.isParticipant).toBe(false);
    });

    it('returns no permissions for regular user', () => {
      const perms = getScorePermissions(null, regularUser);
      expect(perms.canSubmit).toBe(false);
    });
  });

  // --- Status-specific permission tests ---

  describe('submitted status', () => {
    const result = makeResult({ status: 'submitted' });

    it('admin can verify and cancel, cannot dispute/conciliate/finalize', () => {
      const perms = getScorePermissions(result, adminUser);
      expect(perms.canVerify).toBe(true);
      expect(perms.canCancel).toBe(true);
      expect(perms.canSubmit).toBe(true);
      expect(perms.canDispute).toBe(false);
      expect(perms.canConciliate).toBe(false);
      expect(perms.canFinalize).toBe(false);
    });

    it('participant cannot verify', () => {
      const perms = getScorePermissions(result, regularUser);
      expect(perms.canVerify).toBe(false);
      expect(perms.canDispute).toBe(false);
      expect(perms.isParticipant).toBe(true);
    });
  });

  describe('under_review status', () => {
    const result = makeResult({ status: 'under_review' });

    it('admin can verify', () => {
      const perms = getScorePermissions(result, adminUser);
      expect(perms.canVerify).toBe(true);
      expect(perms.canCancel).toBe(true);
    });
  });

  describe('verified status', () => {
    const result = makeResult({ status: 'verified' });

    it('admin can dispute, finalize, and cancel', () => {
      const perms = getScorePermissions(result, adminUser);
      expect(perms.canDispute).toBe(true);
      expect(perms.canFinalize).toBe(true);
      expect(perms.canCancel).toBe(true);
      expect(perms.canVerify).toBe(false);
      expect(perms.canConciliate).toBe(false);
    });

    it('participant can dispute but cannot finalize', () => {
      const perms = getScorePermissions(result, regularUser);
      expect(perms.canDispute).toBe(true);
      expect(perms.canFinalize).toBe(false);
      expect(perms.canCancel).toBe(false);
      expect(perms.isParticipant).toBe(true);
    });

    it('non-participant regular user cannot dispute', () => {
      const nonParticipant = { id: 'stranger-999', isAdmin: false };
      const perms = getScorePermissions(result, nonParticipant);
      expect(perms.canDispute).toBe(false);
      expect(perms.isParticipant).toBe(false);
    });
  });

  describe('disputed status', () => {
    const result = makeResult({ status: 'disputed', dispute_count: 1 });

    it('admin can conciliate and cancel, cannot finalize', () => {
      const perms = getScorePermissions(result, adminUser);
      expect(perms.canConciliate).toBe(true);
      expect(perms.canCancel).toBe(true);
      expect(perms.canFinalize).toBe(false);
      expect(perms.canDispute).toBe(false);
    });

    it('participant cannot conciliate', () => {
      const perms = getScorePermissions(result, regularUser);
      expect(perms.canConciliate).toBe(false);
    });
  });

  describe('conciliated status', () => {
    const result = makeResult({ status: 'conciliated' });

    it('admin can finalize, dispute again, and cancel', () => {
      const perms = getScorePermissions(result, adminUser);
      expect(perms.canFinalize).toBe(true);
      expect(perms.canDispute).toBe(true);
      expect(perms.canCancel).toBe(true);
    });

    it('participant can dispute again', () => {
      const perms = getScorePermissions(result, regularUser);
      expect(perms.canDispute).toBe(true);
    });
  });

  describe('finalized status', () => {
    const result = makeResult({ status: 'finalized' });

    it('admin cannot cancel finalized results', () => {
      const perms = getScorePermissions(result, adminUser);
      expect(perms.canCancel).toBe(false);
      expect(perms.canDispute).toBe(false);
      expect(perms.canFinalize).toBe(false);
      expect(perms.canVerify).toBe(false);
      expect(perms.canConciliate).toBe(false);
    });

    it('participant has no action permissions', () => {
      const perms = getScorePermissions(result, regularUser);
      expect(perms.canDispute).toBe(false);
      expect(perms.canCancel).toBe(false);
    });
  });

  describe('cancelled status', () => {
    const result = makeResult({ status: 'cancelled' });

    it('admin cannot cancel again', () => {
      const perms = getScorePermissions(result, adminUser);
      expect(perms.canCancel).toBe(false);
      expect(perms.canDispute).toBe(false);
      expect(perms.canFinalize).toBe(false);
    });
  });

  // --- Role-based tests ---

  describe('tournament organizer role', () => {
    it('organizer has admin-like permissions for tournament results', () => {
      const result = makeResult({ status: 'submitted', tournament_id: 'tourney-1' });
      const perms = getScorePermissions(result, organizerUser, [organizerId]);
      expect(perms.isOrganizer).toBe(true);
      expect(perms.canVerify).toBe(true);
      expect(perms.canSubmit).toBe(true);
      expect(perms.canCancel).toBe(true);
    });

    it('organizer has no special permissions without tournament context', () => {
      const result = makeResult({ status: 'submitted' });
      const perms = getScorePermissions(result, organizerUser, [organizerId]);
      expect(perms.isOrganizer).toBe(false);
      expect(perms.canVerify).toBe(false);
    });

    it('organizer not in list has no special permissions', () => {
      const result = makeResult({ status: 'submitted', tournament_id: 'tourney-1' });
      const perms = getScorePermissions(result, organizerUser, ['other-org']);
      expect(perms.isOrganizer).toBe(false);
      expect(perms.canVerify).toBe(false);
    });
  });

  // --- Participant detection ---

  describe('participant detection', () => {
    it('detects participant via player_results', () => {
      const result = makeResult({ status: 'verified' });
      const perms = getScorePermissions(result, regularUser);
      expect(perms.isParticipant).toBe(true);
    });

    it('detects participant via team players array', () => {
      const altUser = { id: 'team-player-789', isAdmin: false };
      const result = makeResult({
        status: 'verified',
        team_results: [
          { team_id: 'team-a', team_name: 'Alpha', score: 16, position: 1, players: ['team-player-789'] },
          { team_id: 'team-b', team_name: 'Beta', score: 12, position: 2, players: ['other'] },
        ],
        player_results: [],
      });
      const perms = getScorePermissions(result, altUser);
      expect(perms.isParticipant).toBe(true);
    });

    it('non-participant correctly identified', () => {
      const stranger = { id: 'stranger-000', isAdmin: false };
      const result = makeResult({ status: 'verified' });
      const perms = getScorePermissions(result, stranger);
      expect(perms.isParticipant).toBe(false);
    });
  });

  // --- Comprehensive status × role matrix ---

  describe('complete status permission matrix', () => {
    const statuses = ['submitted', 'under_review', 'verified', 'disputed', 'conciliated', 'finalized', 'cancelled'] as const;

    statuses.forEach((status) => {
      it(`${status}: canSubmit is always status-independent for admin`, () => {
        const result = makeResult({ status });
        const perms = getScorePermissions(result, adminUser);
        expect(perms.canSubmit).toBe(true);
      });
    });

    it('canVerify only for submitted and under_review', () => {
      const verifiableStatuses = ['submitted', 'under_review'];
      statuses.forEach((status) => {
        const result = makeResult({ status });
        const perms = getScorePermissions(result, adminUser);
        expect(perms.canVerify).toBe(verifiableStatuses.includes(status));
      });
    });

    it('canDispute only for verified and conciliated', () => {
      const disputableStatuses = ['verified', 'conciliated'];
      statuses.forEach((status) => {
        const result = makeResult({ status });
        const perms = getScorePermissions(result, adminUser);
        expect(perms.canDispute).toBe(disputableStatuses.includes(status));
      });
    });

    it('canConciliate only for disputed', () => {
      statuses.forEach((status) => {
        const result = makeResult({ status });
        const perms = getScorePermissions(result, adminUser);
        expect(perms.canConciliate).toBe(status === 'disputed');
      });
    });

    it('canFinalize only for verified and conciliated', () => {
      const finalizableStatuses = ['verified', 'conciliated'];
      statuses.forEach((status) => {
        const result = makeResult({ status });
        const perms = getScorePermissions(result, adminUser);
        expect(perms.canFinalize).toBe(finalizableStatuses.includes(status));
      });
    });

    it('canCancel for all except finalized and cancelled', () => {
      const nonCancellable = ['finalized', 'cancelled'];
      statuses.forEach((status) => {
        const result = makeResult({ status });
        const perms = getScorePermissions(result, adminUser);
        expect(perms.canCancel).toBe(!nonCancellable.includes(status));
      });
    });
  });
});

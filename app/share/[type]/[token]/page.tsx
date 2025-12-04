'use client';

/**
 * Shared Content Page
 * Handles display of shared replays, matches, teams, players via share tokens
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, Button, Skeleton, Divider, Chip } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { PageContainer } from '@/components/layouts/centered-content';

interface SharedContent {
  content_type: 'replay' | 'match' | 'team' | 'player' | 'tournament';
  content_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export default function SharedContentPage() {
  const params = useParams();
  const contentType = params.type as string;
  const token = params.token as string;

  const [content, setContent] = useState<SharedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSharedContent() {
      try {
        // In production, fetch from API
        const response = await fetch(`/api/share/${contentType}/${token}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('This share link is invalid or has expired');
          }
          throw new Error('Failed to load shared content');
        }

        const data = await response.json();
        setContent(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load shared content';
        setError(errorMessage);
        // Show error state - no mock data fallback
        setContent(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSharedContent();
  }, [contentType, token]);

  if (loading) {
    return (
      <PageContainer maxWidth="7xl">
        <div className="space-y-6">
          <Skeleton className="w-full h-32 rounded-xl" />
          <Skeleton className="w-full h-96 rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  if (error && !content) {
    return (
      <PageContainer maxWidth="5xl">
        <Card>
          <CardBody className="text-center py-12">
            <Icon icon="solar:link-broken-linear" width={64} className="mx-auto mb-4 text-danger" />
            <h2 className="text-2xl font-bold mb-2">Link Not Found</h2>
            <p className="text-lg text-danger mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button color="primary" onClick={() => (window.location.href = '/')}>
                Go to Home
              </Button>
              <Button variant="bordered" onClick={() => (window.location.href = '/replays')}>
                Browse Replays
              </Button>
            </div>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  if (!content) {
    return null;
  }

  // Check if expired
  const isExpired = new Date(content.expires_at) < new Date();

  if (isExpired) {
    return (
      <PageContainer maxWidth="5xl">
        <Card>
          <CardBody className="text-center py-12">
            <Icon icon="solar:clock-circle-linear" width={64} className="mx-auto mb-4 text-warning" />
            <h2 className="text-2xl font-bold mb-2">Link Expired</h2>
            <p className="text-lg text-default-600 mb-6">
              This share link has expired and is no longer accessible.
            </p>
            <Button color="primary" onClick={() => (window.location.href = '/')}>
              Go to Home
            </Button>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  // Render different content based on type
  const renderContent = () => {
    switch (content.content_type) {
      case 'replay':
        return (
          <div className="space-y-6">
            {/* Shared Replay Header */}
            <Card className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon icon="solar:play-circle-bold" width={32} className="text-primary" />
                  <div>
                    <h1 className="text-2xl font-bold">Shared Replay</h1>
                    <p className="text-sm text-default-600">
                      {(content.metadata?.title as string) || `Replay #${content.content_id}`}
                    </p>
                  </div>
                </div>
                <Divider className="my-4" />
                <div className="flex flex-wrap gap-4 text-sm">
                  <Chip size="sm" variant="flat" startContent={<Icon icon="solar:calendar-bold" width={16} />}>
                    Shared {new Date(content.created_at).toLocaleDateString()}
                  </Chip>
                  <Chip size="sm" variant="flat" startContent={<Icon icon="solar:clock-circle-bold" width={16} />}>
                    Expires {new Date(content.expires_at).toLocaleDateString()}
                  </Chip>
                </div>
              </CardBody>
            </Card>

            {/* Replay Player Placeholder */}
            <Card>
              <CardBody className="aspect-video bg-default-100 flex items-center justify-center">
                <div className="text-center">
                  <Icon icon="solar:videocamera-record-bold" width={64} className="mx-auto mb-4 text-default-400" />
                  <p className="text-lg font-semibold mb-2">Replay Player</p>
                  <p className="text-sm text-default-500">
                    Replay ID: {content.content_id}
                  </p>
                  <Button
                    className="mt-4"
                    color="primary"
                    size="lg"
                    startContent={<Icon icon="solar:play-bold" width={20} />}
                    onClick={() => (window.location.href = `/replays/${content.content_id}`)}
                  >
                    View Full Replay
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-primary-500 to-secondary-500">
              <CardBody className="text-center py-8">
                <h3 className="text-xl font-bold text-white mb-2">Want to create your own replays?</h3>
                <p className="text-white/80 mb-4">
                  Join LeetGaming.PRO to record, analyze, and share your best gaming moments
                </p>
                <div className="flex gap-3 justify-center">
                  <Button color="default" variant="solid" className="bg-white text-primary font-semibold">
                    Sign Up Free
                  </Button>
                  <Button variant="bordered" className="border-white text-white">
                    Learn More
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        );

      case 'match':
        return (
          <div className="space-y-6">
            <Card>
              <CardBody className="text-center py-12">
                <Icon icon="solar:gameboy-bold" width={64} className="mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Shared Match</h2>
                <p className="text-default-600 mb-4">Match ID: {content.content_id}</p>
                <Button
                  color="primary"
                  onClick={() => (window.location.href = `/matches/${content.content_id}`)}
                >
                  View Match Details
                </Button>
              </CardBody>
            </Card>
          </div>
        );

      case 'player':
        return (
          <div className="space-y-6">
            <Card>
              <CardBody className="text-center py-12">
                <Icon icon="solar:user-bold" width={64} className="mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Shared Player Profile</h2>
                <p className="text-default-600 mb-4">Player ID: {content.content_id}</p>
                <Button
                  color="primary"
                  onClick={() => (window.location.href = `/players/${content.content_id}`)}
                >
                  View Player Profile
                </Button>
              </CardBody>
            </Card>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <Card>
              <CardBody className="text-center py-12">
                <Icon icon="solar:users-group-rounded-bold" width={64} className="mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Shared Team Profile</h2>
                <p className="text-default-600 mb-4">Team ID: {content.content_id}</p>
                <Button
                  color="primary"
                  onClick={() => (window.location.href = `/teams/${content.content_id}`)}
                >
                  View Team Profile
                </Button>
              </CardBody>
            </Card>
          </div>
        );

      case 'tournament':
        return (
          <div className="space-y-6">
            <Card>
              <CardBody className="text-center py-12">
                <Icon icon="solar:cup-star-bold" width={64} className="mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Shared Tournament</h2>
                <p className="text-default-600 mb-4">Tournament ID: {content.content_id}</p>
                <Button
                  color="primary"
                  onClick={() => (window.location.href = `/tournaments/${content.content_id}`)}
                >
                  View Tournament
                </Button>
              </CardBody>
            </Card>
          </div>
        );

      default:
        return (
          <Card>
            <CardBody className="text-center py-12">
              <Icon icon="solar:question-circle-linear" width={64} className="mx-auto mb-4 text-default-400" />
              <p className="text-lg">Unknown content type: {content.content_type}</p>
            </CardBody>
          </Card>
        );
    }
  };

  return (
    <PageContainer maxWidth="7xl">
      {renderContent()}
    </PageContainer>
  );
}

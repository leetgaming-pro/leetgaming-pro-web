
// 
// IF LOGGED-IN
// large top bar with % of storage used
//  
///
// main page (single-tab): dashboard
// -- Storage
// -- Private
//   -- Breakdown: Encrypted / Unencrypted
// -- Privately Shared
//   -- Breakdown: Encrypted / Unencrypted
//   (.. list namespaces ..) ::settings (edit namespace/vault) ::delete namespaces/item
// -- Public
//   (.. list files, configs etc ..) ::delete items/item
//     -- Breakdown: list Groups/Teams ::settings (edit team/vault)
// -- (Upgrade to Pro)


// side-buttons, new (create group/vault), settings (edit group/vault), delete group/vault

// if not logged in, show product page


// const HomePage: React.FC = () => {
//     return (
//       <div>

//       </div>
//     );
//   };

//   export default HomePage;



"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Tabs,
    Tab,
    Chip,
    ScrollShadow,
    CardBody,
    Card,
    CardHeader,
    CardFooter,
    Progress,
    Spinner,
    Button,
} from "@nextui-org/react";

import ReplaysTable from "@/components/files/replays-table/app";
import { Icon } from "@iconify/react";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";

const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);

/** Dashboard stats interface */
interface DashboardStats {
    totalReplays: number;
    publicReplays: number;
    privateReplays: number;
    sharedReplays: number;
    storageUsed: number;
    storageTotal: number;
}

/** Replay file from API */
interface ReplayFile {
    id: string;
    settings?: {
        visibility?: number;
    };
}

export default function Component() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats>({
        totalReplays: 0,
        publicReplays: 0,
        privateReplays: 0,
        sharedReplays: 0,
        storageUsed: 0,
        storageTotal: 1099511627776, // 1TB in bytes
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardStats() {
            if (status === "unauthenticated") {
                return;
            }

            try {
                setLoading(true);
                
                // Fetch user's replays to calculate stats
                const replays = await sdk.replayFiles.searchReplayFiles({ game_id: "cs2" });
                
                const publicCount = replays.filter((r: ReplayFile) => r.settings?.visibility === 1).length;
                const privateCount = replays.filter((r: ReplayFile) => r.settings?.visibility === 4).length;
                const sharedCount = replays.filter((r: ReplayFile) => r.settings?.visibility === 2).length;
                
                // Mock storage calculation (would come from API in real scenario)
                const storageUsed = replays.length * 52428800; // ~50MB per replay

                setStats({
                    totalReplays: replays.length,
                    publicReplays: publicCount,
                    privateReplays: privateCount,
                    sharedReplays: sharedCount,
                    storageUsed,
                    storageTotal: 1099511627776, // 1TB
                });
            } catch (err) {
                logger.error("Failed to fetch dashboard stats", err);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardStats();
    }, [status]);

    // Redirect to sign in if not authenticated
    if (status === "unauthenticated") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Card className="max-w-md">
                    <CardBody className="text-center py-8">
                        <Icon icon="mdi:lock" className="text-6xl text-primary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Sign in required</h2>
                        <p className="text-default-500 mb-6">
                            Please sign in to access your cloud storage and manage your replays
                        </p>
                        <Button
                            color="primary"
                            size="lg"
                            onPress={() => router.push("/signin")}
                            startContent={<Icon icon="mdi:login" width={20} />}
                        >
                            Sign In
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const storagePercentage = (stats.storageUsed / stats.storageTotal) * 100;
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="w-full">
            <main className="flex w-full justify-center">
                <ScrollShadow
                    hideScrollBar
                    className="flex w-full  justify-between gap-8 border-b border-divider px-4 sm:px-8"
                    orientation="horizontal"
                >
                    <Tabs
                        aria-label="Navigation Tabs"
                        classNames={{
                            tabList: "w-full max-w-[44%] absolute rounded-none p-0 gap-4 lg:gap-6",
                            tab: "w-full px-0 h-12",
                            cursor: "w-full",
                            tabContent: "text-default-400",
                        }}
                        radius="full"
                        variant="underlined"
                    >
                        <Tab
                            key="uploads"
                            title={
                                <div className="flex items-center gap-2">
                                    <p>Uploads</p>
                                    <Chip size="sm" variant="flat">{stats.totalReplays}</Chip>
                                </div>
                            }
                        >
                            <div className="pt-14">
                                <ReplaysTable />
                            </div>
                        </Tab>
                        
                        <Tab key="dashboard" title="Dashboard">
                            {loading ? (
                                <div className="pt-14 flex justify-center">
                                    <Spinner size="lg" label="Loading dashboard..." />
                                </div>
                            ) : (
                                <>
                                    <div className="pt-14 flex flex-col md:flex-row md:space-x-4 gap-4">
                                        <Card className="flex-1 border-primary/20 dark:border-primary/40">
                                            <CardHeader className="flex items-center gap-2">
                                                <Icon icon="mdi:video-box" className="text-primary" width={24} />
                                                <span className="font-semibold">Replays</span>
                                            </CardHeader>
                                            <CardBody>
                                                <div className="flex items-center justify-center">
                                                    <div className="text-center">
                                                        <p className="text-4xl font-bold text-primary">{stats.totalReplays}</p>
                                                        <p className="text-sm text-default-500 mt-1">Total Replays</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 mt-4">
                                                    <div className="text-center">
                                                        <Chip size="sm" variant="flat" color="success">{stats.publicReplays}</Chip>
                                                        <p className="text-xs text-default-400 mt-1">Public</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <Chip size="sm" variant="flat" color="warning">{stats.sharedReplays}</Chip>
                                                        <p className="text-xs text-default-400 mt-1">Shared</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <Chip size="sm" variant="flat">{stats.privateReplays}</Chip>
                                                        <p className="text-xs text-default-400 mt-1">Private</p>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>

                                        <Card className="flex-1 border-secondary/20 dark:border-secondary/40">
                                            <CardHeader className="flex items-center gap-2">
                                                <Icon icon="mdi:harddisk" className="text-secondary" width={24} />
                                                <span className="font-semibold">Storage</span>
                                            </CardHeader>
                                            <CardBody>
                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="flex justify-between mb-2">
                                                            <span className="text-sm text-default-500">Used</span>
                                                            <span className="text-sm font-semibold">{storagePercentage.toFixed(1)}%</span>
                                                        </div>
                                                        <Progress
                                                            value={storagePercentage}
                                                            color={storagePercentage > 80 ? "danger" : storagePercentage > 50 ? "warning" : "success"}
                                                            className="max-w-full"
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-default-500">Usage</span>
                                                        <span className="font-semibold">{formatBytes(stats.storageUsed)} / {formatBytes(stats.storageTotal)}</span>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </div>

                                    <div className="pt-4">
                                        <Card className="border-l-4 border-l-primary dark:border-l-secondary">
                                            <CardHeader>
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="mdi:chart-line" width={24} />
                                                    <span className="font-semibold">Quick Stats</span>
                                                </div>
                                            </CardHeader>
                                            <CardBody>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="text-center p-4 bg-default-100 rounded-lg">
                                                        <p className="text-2xl font-bold text-primary">{stats.totalReplays}</p>
                                                        <p className="text-xs text-default-500 mt-1">Total Files</p>
                                                    </div>
                                                    <div className="text-center p-4 bg-default-100 rounded-lg">
                                                        <p className="text-2xl font-bold text-success">0</p>
                                                        <p className="text-xs text-default-500 mt-1">Processed Today</p>
                                                    </div>
                                                    <div className="text-center p-4 bg-default-100 rounded-lg">
                                                        <p className="text-2xl font-bold text-warning">{stats.sharedReplays}</p>
                                                        <p className="text-xs text-default-500 mt-1">Shared</p>
                                                    </div>
                                                    <div className="text-center p-4 bg-default-100 rounded-lg">
                                                        <p className="text-2xl font-bold text-secondary">0</p>
                                                        <p className="text-xs text-default-500 mt-1">Views</p>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </div>

                                    <div className="pt-4">
                                        <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
                                            <CardHeader>
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="mdi:crown" className="text-warning" width={24} />
                                                    <span className="font-semibold">Upgrade to Pro</span>
                                                </div>
                                            </CardHeader>
                                            <CardBody>
                                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-lg font-semibold mb-2">Unlock premium features</p>
                                                        <ul className="text-sm text-default-600 space-y-1">
                                                            <li>✓ Unlimited storage</li>
                                                            <li>✓ Advanced analytics</li>
                                                            <li>✓ Priority processing</li>
                                                            <li>✓ Team collaboration</li>
                                                        </ul>
                                                    </div>
                                                    <Button
                                                        color="primary"
                                                        variant="shadow"
                                                        size="lg"
                                                        endContent={<Icon icon="mdi:arrow-right" width={20} />}
                                                    >
                                                        Upgrade Now
                                                    </Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </div>
                                </>
                            )}
                        </Tab>

                        <Tab key="analytics" title="Analytics" />
                        <Tab key="shared" title="Shared" />
                        
                        <Tab key="settings" title="Settings" />

                        <Tab key="upgrade-to-pro" title={
                            <div className="flex items-center gap-2">
                                <Icon className="text-default-500" icon="solar:users-group-two-rounded-outline" width={18} />
                                {/* <span className={`${logo({color: "battleOrange"})}`}>Team</span> */}
                                Team
                                <Chip size="sm">PRO</Chip>
                            </div>
                        } />
                    </Tabs>

                </ScrollShadow>
            </main>
        </div>
    );
}

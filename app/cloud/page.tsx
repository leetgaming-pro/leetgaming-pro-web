"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useOptionalAuth } from "@/hooks/use-auth";
import {
    Tabs,
    Tab,
    Chip,
    CardBody,
    Card,
    CardHeader,
    Progress,
    Spinner,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Tooltip,
    Avatar,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Select,
    SelectItem,
} from "@nextui-org/react";

import { Icon } from "@iconify/react";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import { title } from "@/components/primitives";
import { EsportsButton } from "@/components/ui/esports-button";
import { useTheme } from "next-themes";
import Link from "next/link";

const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);

interface DashboardStats {
    totalFiles: number;
    publicFiles: number;
    privateFiles: number;
    sharedFiles: number;
    storageUsed: number;
    storageTotal: number;
}

interface CloudFile {
    id: string;
    name: string;
    type: 'replay' | 'config' | 'screenshot' | 'other';
    size: number;
    visibility: 'public' | 'private' | 'shared';
    createdAt: string;
    updatedAt: string;
    gameId?: string;
    sharedWith?: string[];
}

const VISIBILITY_OPTIONS = [
    { key: 'private', label: 'Private', icon: 'solar:lock-bold', color: 'default' },
    { key: 'shared', label: 'Shared', icon: 'solar:share-bold', color: 'warning' },
    { key: 'public', label: 'Public', icon: 'solar:global-bold', color: 'success' },
];

export default function CloudPage() {
    const { isAuthenticated, isLoading: isAuthLoading, redirectToSignIn } = useOptionalAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const [stats, setStats] = useState<DashboardStats>({
        totalFiles: 0,
        publicFiles: 0,
        privateFiles: 0,
        sharedFiles: 0,
        storageUsed: 0,
        storageTotal: 10737418240, // 10GB free tier
    });
    const [files, setFiles] = useState<CloudFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterVisibility, setFilterVisibility] = useState<string>("all");
    const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null);
    
    const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    useEffect(() => {
        async function fetchData() {
            if (!isAuthenticated || isAuthLoading) return;

            try {
                setLoading(true);
                const replays = await sdk.replayFiles.searchReplayFiles({ game_id: "cs2" });
                
                // Transform replays to CloudFile format
                const cloudFiles: CloudFile[] = replays.map((r: any) => ({
                    id: r.id,
                    name: r.file_name || `replay_${r.id.slice(0, 8)}.dem`,
                    type: 'replay' as const,
                    size: r.file_size || 52428800,
                    visibility: r.settings?.visibility === 1 ? 'public' : r.settings?.visibility === 2 ? 'shared' : 'private',
                    createdAt: r.created_at || new Date().toISOString(),
                    updatedAt: r.updated_at || new Date().toISOString(),
                    gameId: r.game_id,
                }));

                setFiles(cloudFiles);
                
                const publicCount = cloudFiles.filter(f => f.visibility === 'public').length;
                const privateCount = cloudFiles.filter(f => f.visibility === 'private').length;
                const sharedCount = cloudFiles.filter(f => f.visibility === 'shared').length;
                const totalSize = cloudFiles.reduce((acc, f) => acc + f.size, 0);

                setStats({
                    totalFiles: cloudFiles.length,
                    publicFiles: publicCount,
                    privateFiles: privateCount,
                    sharedFiles: sharedCount,
                    storageUsed: totalSize,
                    storageTotal: 10737418240,
                });
            } catch (err) {
                logger.error("Failed to fetch cloud data", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [isAuthenticated, isAuthLoading]);

    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesVisibility = filterVisibility === 'all' || file.visibility === filterVisibility;
            return matchesSearch && matchesVisibility;
        });
    }, [files, searchQuery, filterVisibility]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'replay': return 'solar:videocamera-record-bold';
            case 'config': return 'solar:settings-bold';
            case 'screenshot': return 'solar:gallery-bold';
            default: return 'solar:file-bold';
        }
    };

    const storagePercentage = (stats.storageUsed / stats.storageTotal) * 100;

    // Unauthenticated - Show public files browser
    if (!isAuthenticated && !isAuthLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
                            <Icon icon="solar:cloud-bold" className="text-white dark:text-[#1a1a1a]" width={32} />
                        </div>
                    </div>
                    <h1 className={title({ color: isDark ? "battleLime" : "battleNavy" })}>Cloud Storage</h1>
                    <p className="text-default-500 mt-2 max-w-lg mx-auto">
                        Browse public replays, configs, and files shared by the community
                    </p>
                </div>

                {/* Public Files Browser */}
                <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                    <CardHeader className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Icon icon="solar:global-bold" className="text-success" width={20} />
                            <span className="font-semibold">Public Files</span>
                        </div>
                        <EsportsButton variant="primary" size="sm" onClick={() => redirectToSignIn('/cloud')}>
                            <Icon icon="solar:login-bold" width={16} />
                            Sign in to Upload
                        </EsportsButton>
                    </CardHeader>
                    <CardBody>
                        <div className="text-center py-12">
                            <Icon icon="solar:cloud-bolt-bold-duotone" className="text-default-300 mx-auto mb-4" width={64} />
                            <p className="text-default-500 mb-4">Sign in to upload and manage your files</p>
                            <EsportsButton variant="ghost" onClick={() => redirectToSignIn('/cloud')}>
                                Get Started
                            </EsportsButton>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                        <Icon icon="solar:cloud-bold" className="text-white dark:text-[#1a1a1a]" width={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#34445C] dark:text-white">Cloud Storage</h1>
                        <p className="text-sm text-default-500">Manage your replays, configs, and files</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href="/upload">
                        <EsportsButton variant="action" size="md">
                            <Icon icon="solar:cloud-upload-bold" width={18} />
                            Upload
                        </EsportsButton>
                    </Link>
                </div>
            </div>

            {/* Storage Bar */}
            <Card className="mb-6 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-gradient-to-r from-[#34445C]/5 to-transparent dark:from-[#DCFF37]/5">
                <CardBody className="p-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <Icon icon="solar:server-bold-duotone" className="text-[#FF4654] dark:text-[#DCFF37]" width={32} />
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Storage Used</span>
                                    <span className="text-sm text-default-500">{formatBytes(stats.storageUsed)} / {formatBytes(stats.storageTotal)}</span>
                                </div>
                                <Progress
                                    value={storagePercentage}
                                    size="sm"
                                    classNames={{
                                        track: "bg-default-200 dark:bg-[#1a1a1a] rounded-none",
                                        indicator: `rounded-none ${storagePercentage > 80 ? 'bg-danger' : storagePercentage > 50 ? 'bg-warning' : 'bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]'}`,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-[#FF4654] dark:text-[#DCFF37]">{stats.totalFiles}</p>
                                <p className="text-xs text-default-500">Total Files</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-success">{stats.publicFiles}</p>
                                <p className="text-xs text-default-500">Public</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-warning">{stats.sharedFiles}</p>
                                <p className="text-xs text-default-500">Shared</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-default-500">{stats.privateFiles}</p>
                                <p className="text-xs text-default-500">Private</p>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Tabs */}
            <Tabs
                aria-label="Cloud tabs"
                variant="solid"
                classNames={{
                    tabList: "bg-white/90 dark:bg-[#1a1a1a] p-1 rounded-none gap-1 shadow-sm",
                    tab: "text-sm font-medium rounded-none text-[#34445C] dark:text-white/70 data-[selected=true]:bg-[#34445C] dark:data-[selected=true]:bg-[#DCFF37] data-[selected=true]:text-white dark:data-[selected=true]:text-[#1a1a1a]",
                    cursor: "bg-[#34445C] dark:bg-[#DCFF37] rounded-none",
                    panel: "pt-4",
                }}
            >
                <Tab 
                    key="files" 
                    title={
                        <div className="flex items-center gap-2">
                            <Icon icon="solar:folder-bold" width={18} />
                            <span>My Files</span>
                            <Chip size="sm" variant="flat" className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37]">{stats.totalFiles}</Chip>
                        </div>
                    }
                >
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <Input
                            placeholder="Search files..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            startContent={<Icon icon="solar:magnifer-bold" className="text-default-400" width={18} />}
                            classNames={{
                                inputWrapper: "rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30",
                            }}
                            className="max-w-xs"
                        />
                        <Select
                            placeholder="Filter by visibility"
                            selectedKeys={[filterVisibility]}
                            onChange={(e) => setFilterVisibility(e.target.value)}
                            classNames={{
                                trigger: "rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30",
                            }}
                            className="max-w-xs"
                        >
                            <SelectItem key="all">All Files</SelectItem>
                            <SelectItem key="public">Public</SelectItem>
                            <SelectItem key="shared">Shared</SelectItem>
                            <SelectItem key="private">Private</SelectItem>
                        </Select>
                    </div>

                    {/* Files Table */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Spinner size="lg" label="Loading files..." />
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <Card className="rounded-none border border-dashed border-[#34445C]/30 dark:border-[#DCFF37]/30">
                            <CardBody className="text-center py-12">
                                <Icon icon="solar:cloud-bold-duotone" className="text-default-300 mx-auto mb-4" width={64} />
                                <p className="text-lg font-semibold mb-2">No files found</p>
                                <p className="text-default-500 mb-4">
                                    {files.length === 0 ? "Upload your first replay to get started" : "No files match your search"}
                                </p>
                                <Link href="/upload">
                                    <EsportsButton variant="primary">
                                        <Icon icon="solar:cloud-upload-bold" width={18} />
                                        Upload Now
                                    </EsportsButton>
                                </Link>
                            </CardBody>
                        </Card>
                    ) : (
                        <Table
                            aria-label="Files table"
                            classNames={{
                                wrapper: "rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20",
                                th: "bg-[#34445C]/5 dark:bg-[#DCFF37]/5 text-[#34445C] dark:text-[#DCFF37] rounded-none first:rounded-none last:rounded-none",
                                td: "rounded-none",
                            }}
                        >
                            <TableHeader>
                                <TableColumn>NAME</TableColumn>
                                <TableColumn>TYPE</TableColumn>
                                <TableColumn>SIZE</TableColumn>
                                <TableColumn>VISIBILITY</TableColumn>
                                <TableColumn>UPLOADED</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {filteredFiles.map((file) => (
                                    <TableRow key={file.id} className="hover:bg-[#FF4654]/5 dark:hover:bg-[#DCFF37]/5">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center bg-[#34445C]/10 dark:bg-[#DCFF37]/10 rounded-none">
                                                    <Icon icon={getFileIcon(file.type)} className="text-[#FF4654] dark:text-[#DCFF37]" width={18} />
                                                </div>
                                                <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="flat" className="capitalize">{file.type}</Chip>
                                        </TableCell>
                                        <TableCell>{formatBytes(file.size)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={file.visibility === 'public' ? 'success' : file.visibility === 'shared' ? 'warning' : 'default'}
                                                startContent={<Icon icon={VISIBILITY_OPTIONS.find(v => v.key === file.visibility)?.icon || ''} width={14} />}
                                            >
                                                {file.visibility}
                                            </Chip>
                                        </TableCell>
                                        <TableCell className="text-default-500">{formatDate(file.createdAt)}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Tooltip content="View">
                                                    <Button isIconOnly size="sm" variant="light" className="rounded-none">
                                                        <Icon icon="solar:eye-bold" width={16} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Share">
                                                    <Button 
                                                        isIconOnly 
                                                        size="sm" 
                                                        variant="light" 
                                                        className="rounded-none"
                                                        onPress={() => { setSelectedFile(file); onShareOpen(); }}
                                                    >
                                                        <Icon icon="solar:share-bold" width={16} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Download">
                                                    <Button isIconOnly size="sm" variant="light" className="rounded-none">
                                                        <Icon icon="solar:download-bold" width={16} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Delete">
                                                    <Button 
                                                        isIconOnly 
                                                        size="sm" 
                                                        variant="light" 
                                                        color="danger"
                                                        className="rounded-none"
                                                        onPress={() => { setSelectedFile(file); onDeleteOpen(); }}
                                                    >
                                                        <Icon icon="solar:trash-bin-trash-bold" width={16} />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Tab>

                <Tab 
                    key="shared" 
                    title={
                        <div className="flex items-center gap-2">
                            <Icon icon="solar:share-bold" width={18} />
                            <span>Shared with Me</span>
                        </div>
                    }
                >
                    <Card className="rounded-none border border-dashed border-[#34445C]/30 dark:border-[#DCFF37]/30">
                        <CardBody className="text-center py-12">
                            <Icon icon="solar:share-bold-duotone" className="text-default-300 mx-auto mb-4" width={64} />
                            <p className="text-lg font-semibold mb-2">No shared files yet</p>
                            <p className="text-default-500">Files shared with you will appear here</p>
                        </CardBody>
                    </Card>
                </Tab>

                <Tab 
                    key="public" 
                    title={
                        <div className="flex items-center gap-2">
                            <Icon icon="solar:global-bold" width={18} />
                            <span>Public</span>
                            <Chip size="sm" variant="flat" color="success">{stats.publicFiles}</Chip>
                        </div>
                    }
                >
                    <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                        <CardBody className="p-4">
                            <p className="text-default-500 mb-4">Browse files you&apos;ve made public</p>
                            {filteredFiles.filter(f => f.visibility === 'public').length === 0 ? (
                                <div className="text-center py-8">
                                    <Icon icon="solar:global-bold-duotone" className="text-default-300 mx-auto mb-4" width={48} />
                                    <p className="text-sm text-default-500">No public files yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredFiles.filter(f => f.visibility === 'public').map((file) => (
                                        <Card key={file.id} className="rounded-none border border-success/20 hover:border-success/50 transition-colors">
                                            <CardBody className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Icon icon={getFileIcon(file.type)} className="text-success" width={24} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{file.name}</p>
                                                        <p className="text-xs text-default-500">{formatBytes(file.size)}</p>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>

            {/* Share Modal */}
            <Modal isOpen={isShareOpen} onClose={onShareClose} classNames={{ base: "rounded-none" }}>
                <ModalContent>
                    <ModalHeader>Share File</ModalHeader>
                    <ModalBody>
                        {selectedFile && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-default-100 dark:bg-[#111111] rounded-none">
                                    <Icon icon={getFileIcon(selectedFile.type)} width={24} />
                                    <span className="font-medium">{selectedFile.name}</span>
                                </div>
                                <Select
                                    label="Visibility"
                                    defaultSelectedKeys={[selectedFile.visibility]}
                                    classNames={{ trigger: "rounded-none" }}
                                >
                                    {VISIBILITY_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.key} startContent={<Icon icon={opt.icon} width={16} />}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Input
                                    label="Share with users (email or username)"
                                    placeholder="Enter email or username..."
                                    classNames={{ inputWrapper: "rounded-none" }}
                                />
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onShareClose} className="rounded-none">Cancel</Button>
                        <EsportsButton variant="primary" onClick={onShareClose}>Save Changes</EsportsButton>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} classNames={{ base: "rounded-none" }}>
                <ModalContent>
                    <ModalHeader className="text-danger">Delete File</ModalHeader>
                    <ModalBody>
                        {selectedFile && (
                            <p>Are you sure you want to delete <strong>{selectedFile.name}</strong>? This action cannot be undone.</p>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onDeleteClose} className="rounded-none">Cancel</Button>
                        <EsportsButton variant="danger" onClick={onDeleteClose}>Delete</EsportsButton>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}

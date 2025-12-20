/**
 * LeetGaming.PRO - Service Status Page Data
 * ==============================================================================
 *
 * This file contains all the data displayed on the service status page.
 * Update this file to keep the status page current.
 *
 * MAINTENANCE GUIDE:
 * - Update `implementationStats` after each sprint
 * - Add new entries to `workHistory` weekly
 * - Add `milestones` when completing major features
 * - Update `roadmapPhases` after sprint planning
 * - Update `services` when adding/changing services
 *
 * AUTOMATION:
 * Run `./scripts/update-status-metrics.sh` to collect codebase metrics
 *
 * ==============================================================================
 */

// ============================================
// BRAND COLORS
// ============================================

export const BRAND_COLORS = {
  navy: "#34445C",
  navyDark: "#1e2a38",
  lime: "#DCFF37",
  orange: "#FF4654",
  gold: "#FFC700",
  cream: "#F5F0E1",
  black: "#0a0a0a",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  cyan: "#06B6D4",
  pink: "#EC4899",
} as const;

// ============================================
// TYPES
// ============================================

export interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  latency?: number;
  uptime?: number;
  description?: string;
  icon?: string;
  region?: string;
  metrics?: { timestamp: string; value: number }[];
}

export interface ImplementationStats {
  totalFeatures: number;
  completed: number;
  inProgress: number;
  planned: number;
  linesOfCode: {
    frontend: number;
    backend: number;
    infrastructure: number;
    tests: number;
  };
  components: number;
  pages: number;
  apiEndpoints: number;
  kafkaTopics: number;
  e2eTests: number;
  unitTests: number;
  testCoverage: number;
  linterCompliance: number;
  securityScore: number;
  docsCoverage: number;
}

export interface QualityMetric {
  name: string;
  value: number;
  target: number;
  color: string;
  icon: string;
}

export interface WorkHistoryEntry {
  date: string;
  completed: number;
  inProgress: number;
  velocity: number;
}

export interface SprintVelocityEntry {
  sprint: string;
  planned: number;
  completed: number;
  bugs: number;
}

export interface CategoryBreakdown {
  category: string;
  completed: number;
  total: number;
  coverage: number;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  description: string;
  category: "backend" | "frontend" | "security" | "feature" | "infrastructure";
  impact: "high" | "medium" | "low";
}

export interface RoadmapPhase {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "planned";
  progress: number;
  targetDate: string;
  items: {
    name: string;
    status: "completed" | "in-progress" | "planned";
  }[];
}

export interface PlatformCapability {
  subject: string;
  A: number;
  fullMark: number;
}

// ============================================
// LAST UPDATED
// ============================================

export const LAST_UPDATED = {
  date: "2025-12-19",
  display: "December 19, 2025",
};

// ============================================
// SERVICES DATA
// Update status when services change state
// ============================================

export const services: ServiceStatus[] = [
  {
    name: "Web Application",
    status: "operational",
    latency: 45,
    uptime: 99.98,
    description: "Next.js 15 with React Server Components",
    icon: "solar:monitor-smartphone-bold",
    region: "Multi-Region",
    metrics: [
      { timestamp: "00:00", value: 42 },
      { timestamp: "04:00", value: 38 },
      { timestamp: "08:00", value: 52 },
      { timestamp: "12:00", value: 48 },
      { timestamp: "16:00", value: 45 },
      { timestamp: "20:00", value: 44 },
      { timestamp: "Now", value: 45 },
    ],
  },
  {
    name: "Replay API (Go 1.24)",
    status: "operational",
    latency: 23,
    uptime: 99.95,
    description: "Hexagonal Architecture + CQRS",
    icon: "solar:server-square-bold",
    region: "US-East / EU-West",
    metrics: [
      { timestamp: "00:00", value: 21 },
      { timestamp: "04:00", value: 19 },
      { timestamp: "08:00", value: 28 },
      { timestamp: "12:00", value: 25 },
      { timestamp: "16:00", value: 23 },
      { timestamp: "20:00", value: 22 },
      { timestamp: "Now", value: 23 },
    ],
  },
  {
    name: "MongoDB Cluster",
    status: "operational",
    latency: 12,
    uptime: 99.99,
    description: "3-node ReplicaSet with auto-failover",
    icon: "solar:database-bold",
    region: "Multi-Region",
    metrics: [
      { timestamp: "00:00", value: 10 },
      { timestamp: "04:00", value: 11 },
      { timestamp: "08:00", value: 14 },
      { timestamp: "12:00", value: 13 },
      { timestamp: "16:00", value: 12 },
      { timestamp: "20:00", value: 11 },
      { timestamp: "Now", value: 12 },
    ],
  },
  {
    name: "Redis Cache",
    status: "operational",
    latency: 5,
    uptime: 99.97,
    description: "Session management & rate limiting",
    icon: "solar:flash-circle-bold",
    region: "US-East",
  },
  {
    name: "Apache Kafka",
    status: "operational",
    latency: 8,
    uptime: 99.92,
    description: "Strimzi-managed (10+ topics, RF=3)",
    icon: "solar:routing-2-bold",
    region: "Multi-Region",
  },
  {
    name: "Authentication",
    status: "operational",
    latency: 35,
    uptime: 99.97,
    description: "Steam/Google OAuth + JWT + MFA/TOTP",
    icon: "solar:shield-keyhole-bold",
    region: "Global",
  },
  {
    name: "Cloud Storage (S3)",
    status: "operational",
    latency: 120,
    uptime: 99.99,
    description: "Replay files & media assets",
    icon: "solar:cloud-storage-bold",
    region: "Multi-Region",
  },
  {
    name: "Observability Stack",
    status: "operational",
    latency: 15,
    uptime: 100,
    description: "Prometheus + Grafana + Loki",
    icon: "solar:graph-new-bold",
    region: "US-East",
  },
];

// ============================================
// IMPLEMENTATION STATISTICS
// Run: ./scripts/update-status-metrics.sh
// ============================================

export const implementationStats: ImplementationStats = {
  totalFeatures: 147,
  completed: 118,
  inProgress: 21,
  planned: 8,
  linesOfCode: {
    frontend: 80720,
    backend: 45300,
    infrastructure: 12500,
    tests: 8900,
  },
  components: 279,
  pages: 62,
  apiEndpoints: 68,
  kafkaTopics: 10,
  e2eTests: 1560,
  unitTests: 180,
  testCoverage: 85,
  linterCompliance: 100,
  securityScore: 100,
  docsCoverage: 90,
};

// ============================================
// QUALITY METRICS
// Update after test runs
// ============================================

export const qualityMetrics: QualityMetric[] = [
  {
    name: "Test Coverage",
    value: 85,
    target: 90,
    color: BRAND_COLORS.lime,
    icon: "solar:test-tube-bold",
  },
  {
    name: "Linter Compliance",
    value: 100,
    target: 100,
    color: BRAND_COLORS.success,
    icon: "solar:check-circle-bold",
  },
  {
    name: "Security Score",
    value: 100,
    target: 100,
    color: BRAND_COLORS.orange,
    icon: "solar:shield-check-bold",
  },
  {
    name: "Documentation",
    value: 90,
    target: 100,
    color: BRAND_COLORS.gold,
    icon: "solar:document-text-bold",
  },
  {
    name: "Architecture",
    value: 100,
    target: 100,
    color: BRAND_COLORS.navy,
    icon: "solar:code-square-bold",
  },
];

// ============================================
// WORK HISTORY
// Add new entries weekly
// ============================================

export const workHistory: WorkHistoryEntry[] = [
  { date: "Oct 15", completed: 25, inProgress: 40, velocity: 12 },
  { date: "Nov 1", completed: 45, inProgress: 38, velocity: 15 },
  { date: "Nov 15", completed: 68, inProgress: 32, velocity: 18 },
  { date: "Dec 1", completed: 85, inProgress: 28, velocity: 22 },
  { date: "Dec 15", completed: 105, inProgress: 24, velocity: 26 },
  { date: "Dec 19", completed: 118, inProgress: 21, velocity: 28 },
  // Add new entries here:
  // { date: "Dec 26", completed: 125, inProgress: 18, velocity: 30 },
];

// ============================================
// SPRINT VELOCITY
// Add after each sprint
// ============================================

export const sprintVelocity: SprintVelocityEntry[] = [
  { sprint: "S1", planned: 15, completed: 14, bugs: 2 },
  { sprint: "S2", planned: 18, completed: 17, bugs: 1 },
  { sprint: "S3", planned: 22, completed: 21, bugs: 3 },
  { sprint: "S4", planned: 25, completed: 24, bugs: 2 },
  { sprint: "S5", planned: 28, completed: 27, bugs: 1 },
  { sprint: "S6", planned: 30, completed: 30, bugs: 0 },
  // Add new sprints here:
  // { sprint: "S7", planned: 32, completed: 31, bugs: 1 },
];

// ============================================
// CATEGORY BREAKDOWN
// Update after completing features
// ============================================

export const categoryBreakdown: CategoryBreakdown[] = [
  { category: "Authentication", completed: 18, total: 20, coverage: 90 },
  { category: "Player Profiles", completed: 8, total: 8, coverage: 92 },
  { category: "Squad/Teams", completed: 14, total: 14, coverage: 85 },
  { category: "Matchmaking", completed: 8, total: 8, coverage: 88 },
  { category: "Tournaments", completed: 12, total: 12, coverage: 86 },
  { category: "Wallet/Payments", completed: 10, total: 11, coverage: 91 },
  { category: "Replays", completed: 9, total: 9, coverage: 82 },
  { category: "Security", completed: 15, total: 15, coverage: 95 },
];

// ============================================
// TECHNOLOGY DISTRIBUTION
// Update when adding major tech
// ============================================

export const techDistribution = [
  { name: "TypeScript", value: 80720, color: "#3178C6" },
  { name: "Go", value: 45300, color: "#00ADD8" },
  { name: "YAML/K8s", value: 8500, color: "#326CE5" },
  { name: "Terraform", value: 4000, color: "#7B42BC" },
];

// ============================================
// PLATFORM CAPABILITIES
// Update after assessments
// ============================================

export const platformCapabilities: PlatformCapability[] = [
  { subject: "Performance", A: 92, fullMark: 100 },
  { subject: "Security", A: 98, fullMark: 100 },
  { subject: "Scalability", A: 88, fullMark: 100 },
  { subject: "Reliability", A: 95, fullMark: 100 },
  { subject: "Developer XP", A: 90, fullMark: 100 },
  { subject: "Documentation", A: 90, fullMark: 100 },
];

// ============================================
// MILESTONES
// Add when completing major features
// ============================================

export const milestones: Milestone[] = [
  {
    id: "m1",
    title: "Argon2id Password Hashing",
    date: "Dec 15, 2025",
    description: "Bank-grade password security with OWASP-recommended algorithm",
    category: "security",
    impact: "high",
  },
  {
    id: "m2",
    title: "Complete Email Verification Flow",
    date: "Dec 15, 2025",
    description: "Service, repository, controller with token expiration",
    category: "backend",
    impact: "high",
  },
  {
    id: "m3",
    title: "MFA/TOTP Implementation",
    date: "Dec 17, 2025",
    description: "Two-factor authentication with QR code and backup codes",
    category: "security",
    impact: "high",
  },
  {
    id: "m4",
    title: "Glicko-2 Rating System",
    date: "Dec 17, 2025",
    description: "Advanced skill rating with confidence intervals and decay",
    category: "feature",
    impact: "high",
  },
  {
    id: "m5",
    title: "Bank-Grade Audit Trail",
    date: "Dec 17, 2025",
    description: "Hash chain integrity for SOX/PCI-DSS/GDPR compliance",
    category: "security",
    impact: "high",
  },
  {
    id: "m6",
    title: "Anti-Smurf Detection System",
    date: "Dec 17, 2025",
    description: "Behavioral analysis with performance indicators",
    category: "feature",
    impact: "high",
  },
  {
    id: "m7",
    title: "Prize Pool with Merkle Tree",
    date: "Dec 17, 2025",
    description: "Blockchain verification with cryptographic payout proofs",
    category: "feature",
    impact: "high",
  },
  {
    id: "m8",
    title: "OpenAPI 3.1 + Swagger UI",
    date: "Dec 17, 2025",
    description: "Complete API documentation with LeetGaming theme",
    category: "infrastructure",
    impact: "medium",
  },
  {
    id: "m9",
    title: "Comprehensive Makefile (50+ commands)",
    date: "Dec 17, 2025",
    description: "One-command developer experience for all operations",
    category: "infrastructure",
    impact: "medium",
  },
  {
    id: "m10",
    title: "Entity Test Coverage to 90%+",
    date: "Dec 19, 2025",
    description: "Business scenario tests for all domain entities",
    category: "backend",
    impact: "high",
  },
  {
    id: "m11",
    title: "Complete Matchmaking Module Review",
    date: "Dec 19, 2025",
    description: "End-to-end production readiness review with SDK alignment and type fixes",
    category: "feature",
    impact: "high",
  },
  {
    id: "m12",
    title: "TypeScript Clean Build",
    date: "Dec 19, 2025",
    description: "Zero type errors across entire frontend codebase",
    category: "frontend",
    impact: "medium",
  },
  // Add new milestones here:
  // {
  //   id: "m11",
  //   title: "New Feature",
  //   date: "Jan 5, 2026",
  //   description: "Description of the milestone",
  //   category: "feature",
  //   impact: "high",
  // },
];

// ============================================
// ROADMAP PHASES
// Update after sprint planning
// ============================================

export const roadmapPhases: RoadmapPhase[] = [
  {
    id: "phase1",
    title: "Phase 1: Authentication & Session",
    status: "completed",
    progress: 100,
    targetDate: "Dec 15, 2025",
    items: [
      { name: "Steam/Google OAuth", status: "completed" },
      { name: "Email signup with verification", status: "completed" },
      { name: "Password reset flow", status: "completed" },
      { name: "MFA/TOTP support", status: "completed" },
      { name: "JWT with refresh rotation", status: "completed" },
      { name: "Session management", status: "completed" },
      { name: "Token blacklist (logout)", status: "completed" },
    ],
  },
  {
    id: "phase2",
    title: "Phase 2: Core Backend APIs",
    status: "completed",
    progress: 100,
    targetDate: "Dec 17, 2025",
    items: [
      { name: "Player Profile CRUD", status: "completed" },
      { name: "Squad/Team Management", status: "completed" },
      { name: "Tournament Lifecycle", status: "completed" },
      { name: "Matchmaking System", status: "completed" },
      { name: "Wallet & Payments", status: "completed" },
      { name: "Replay Processing", status: "completed" },
    ],
  },
  {
    id: "phase3",
    title: "Phase 3: Security & Compliance",
    status: "completed",
    progress: 100,
    targetDate: "Dec 17, 2025",
    items: [
      { name: "Bank-grade audit trail", status: "completed" },
      { name: "Anti-smurf detection", status: "completed" },
      { name: "Prize pool verification", status: "completed" },
      { name: "Double-entry ledger", status: "completed" },
    ],
  },
  {
    id: "phase4",
    title: "Phase 4: Test Coverage & DX",
    status: "in-progress",
    progress: 85,
    targetDate: "Dec 2025",
    items: [
      { name: "Entity tests (90%+)", status: "completed" },
      { name: "E2E test expansion", status: "in-progress" },
      { name: "OpenAPI documentation", status: "completed" },
      { name: "Makefile automation", status: "completed" },
    ],
  },
  {
    id: "phase5",
    title: "Phase 5: Scale & Performance",
    status: "planned",
    progress: 15,
    targetDate: "Q1 2026",
    items: [
      { name: "Multi-region DB replication", status: "planned" },
      { name: "CDN optimization", status: "planned" },
      { name: "Redis caching layer", status: "in-progress" },
      { name: "GraphQL layer (optional)", status: "planned" },
    ],
  },
  // Add new phases here:
  // {
  //   id: "phase6",
  //   title: "Phase 6: AI & ML Features",
  //   status: "planned",
  //   progress: 0,
  //   targetDate: "Q2 2026",
  //   items: [
  //     { name: "AI highlight detection", status: "planned" },
  //   ],
  // },
];

// ============================================
// TECHNOLOGY STACK
// Update when adding new technologies
// ============================================

export const techStack = [
  { name: "Go 1.24+", icon: "logos:go", desc: "Backend API" },
  { name: "Next.js 15", icon: "logos:nextjs-icon", desc: "Frontend" },
  { name: "TypeScript", icon: "logos:typescript-icon", desc: "Type Safety" },
  { name: "MongoDB", icon: "logos:mongodb-icon", desc: "Database" },
  { name: "Redis", icon: "logos:redis", desc: "Cache" },
  { name: "Kafka", icon: "logos:kafka-icon", desc: "Events" },
  { name: "Kubernetes", icon: "logos:kubernetes", desc: "Orchestration" },
  { name: "Terraform", icon: "logos:terraform-icon", desc: "IaC" },
  { name: "Prometheus", icon: "logos:prometheus", desc: "Metrics" },
  { name: "Grafana", icon: "logos:grafana", desc: "Dashboards" },
];

// ============================================
// HELPER: Get completion percentage
// ============================================

export function getCompletionPercentage(): number {
  return Math.round(
    (implementationStats.completed / implementationStats.totalFeatures) * 100
  );
}

// ============================================
// HELPER: Get total lines of code
// ============================================

export function getTotalLinesOfCode(): number {
  const { frontend, backend, infrastructure, tests } =
    implementationStats.linesOfCode;
  return frontend + backend + infrastructure + tests;
}

// ============================================
// HELPER: Check if all services operational
// ============================================

export function areAllServicesOperational(): boolean {
  return services.every((s) => s.status === "operational");
}



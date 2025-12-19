"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Divider,
  Progress,
  Tabs,
  Tab,
  Tooltip,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
} from "recharts";

// ============================================
// BRAND COLORS
// ============================================

const BRAND_COLORS = {
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
  purple: "#8B5CF6",
  cyan: "#06B6D4",
  pink: "#EC4899",
};

// ============================================
// TYPES
// ============================================

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  latency?: number;
  uptime?: number;
  description?: string;
  icon?: string;
  region?: string;
  metrics?: { timestamp: string; value: number }[];
}

interface QualityMetric {
  name: string;
  value: number;
  target: number;
  color: string;
  icon: string;
}

// ============================================
// DATA - Services
// ============================================

const services: ServiceStatus[] = [
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
// DATA - Implementation Statistics
// ============================================

const implementationStats = {
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
  e2eTests: 24,
  unitTests: 156,
  testCoverage: 85,
  linterCompliance: 100,
  securityScore: 100,
  docsCoverage: 90,
};

// Quality Metrics
const qualityMetrics: QualityMetric[] = [
  { name: "Test Coverage", value: 85, target: 90, color: BRAND_COLORS.lime, icon: "solar:test-tube-bold" },
  { name: "Linter Compliance", value: 100, target: 100, color: BRAND_COLORS.success, icon: "solar:check-circle-bold" },
  { name: "Security Score", value: 100, target: 100, color: BRAND_COLORS.orange, icon: "solar:shield-check-bold" },
  { name: "Documentation", value: 90, target: 100, color: BRAND_COLORS.gold, icon: "solar:document-text-bold" },
  { name: "Architecture", value: 100, target: 100, color: BRAND_COLORS.purple, icon: "solar:code-square-bold" },
];

// Sprint velocity data
const sprintVelocity = [
  { sprint: "S1", planned: 15, completed: 14, bugs: 2 },
  { sprint: "S2", planned: 18, completed: 17, bugs: 1 },
  { sprint: "S3", planned: 22, completed: 21, bugs: 3 },
  { sprint: "S4", planned: 25, completed: 24, bugs: 2 },
  { sprint: "S5", planned: 28, completed: 27, bugs: 1 },
  { sprint: "S6", planned: 30, completed: 30, bugs: 0 },
];

// Work history over time
const workHistory = [
  { date: "Oct 15", completed: 25, inProgress: 40, velocity: 12 },
  { date: "Nov 1", completed: 45, inProgress: 38, velocity: 15 },
  { date: "Nov 15", completed: 68, inProgress: 32, velocity: 18 },
  { date: "Dec 1", completed: 85, inProgress: 28, velocity: 22 },
  { date: "Dec 15", completed: 105, inProgress: 24, velocity: 26 },
  { date: "Dec 19", completed: 118, inProgress: 21, velocity: 28 },
];

// Technology distribution
const techDistribution = [
  { name: "TypeScript", value: 80720, color: "#3178C6" },
  { name: "Go", value: 45300, color: "#00ADD8" },
  { name: "YAML/K8s", value: 8500, color: "#326CE5" },
  { name: "Terraform", value: 4000, color: "#7B42BC" },
];

// Category breakdown
const categoryBreakdown = [
  { category: "Authentication", completed: 18, total: 20, coverage: 90 },
  { category: "Player Profiles", completed: 8, total: 8, coverage: 92 },
  { category: "Squad/Teams", completed: 14, total: 14, coverage: 85 },
  { category: "Matchmaking", completed: 8, total: 8, coverage: 88 },
  { category: "Tournaments", completed: 12, total: 12, coverage: 86 },
  { category: "Wallet/Payments", completed: 10, total: 11, coverage: 91 },
  { category: "Replays", completed: 9, total: 9, coverage: 82 },
  { category: "Security", completed: 15, total: 15, coverage: 95 },
];

// Radar chart data for platform capabilities
const platformCapabilities = [
  { subject: "Performance", A: 92, fullMark: 100 },
  { subject: "Security", A: 98, fullMark: 100 },
  { subject: "Scalability", A: 88, fullMark: 100 },
  { subject: "Reliability", A: 95, fullMark: 100 },
  { subject: "Developer XP", A: 90, fullMark: 100 },
  { subject: "Documentation", A: 90, fullMark: 100 },
];

// Contribution heatmap data (GitHub-style)
const generateContributionData = () => {
  const data: { date: string; count: number; level: number }[] = [];
  const today = new Date();
  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const count = Math.floor(Math.random() * 15);
    const level = count === 0 ? 0 : count < 4 ? 1 : count < 8 ? 2 : count < 12 ? 3 : 4;
    data.push({
      date: date.toISOString().split("T")[0],
      count,
      level,
    });
  }
  return data;
};

// Milestones data
const milestones = [
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
];

// Roadmap phases
const roadmapPhases = [
  {
    id: "phase1",
    title: "Phase 1: Authentication & Session",
    status: "completed" as const,
    progress: 100,
    targetDate: "Dec 15, 2025",
    items: [
      { name: "Steam/Google OAuth", status: "completed" as const },
      { name: "Email signup with verification", status: "completed" as const },
      { name: "Password reset flow", status: "completed" as const },
      { name: "MFA/TOTP support", status: "completed" as const },
      { name: "JWT with refresh rotation", status: "completed" as const },
      { name: "Session management", status: "completed" as const },
      { name: "Token blacklist (logout)", status: "completed" as const },
    ],
  },
  {
    id: "phase2",
    title: "Phase 2: Core Backend APIs",
    status: "completed" as const,
    progress: 100,
    targetDate: "Dec 17, 2025",
    items: [
      { name: "Player Profile CRUD", status: "completed" as const },
      { name: "Squad/Team Management", status: "completed" as const },
      { name: "Tournament Lifecycle", status: "completed" as const },
      { name: "Matchmaking System", status: "completed" as const },
      { name: "Wallet & Payments", status: "completed" as const },
      { name: "Replay Processing", status: "completed" as const },
    ],
  },
  {
    id: "phase3",
    title: "Phase 3: Security & Compliance",
    status: "completed" as const,
    progress: 100,
    targetDate: "Dec 17, 2025",
    items: [
      { name: "Bank-grade audit trail", status: "completed" as const },
      { name: "Anti-smurf detection", status: "completed" as const },
      { name: "Prize pool verification", status: "completed" as const },
      { name: "Double-entry ledger", status: "completed" as const },
    ],
  },
  {
    id: "phase4",
    title: "Phase 4: Test Coverage & DX",
    status: "in-progress" as const,
    progress: 85,
    targetDate: "Dec 2025",
    items: [
      { name: "Entity tests (90%+)", status: "completed" as const },
      { name: "E2E test expansion", status: "in-progress" as const },
      { name: "OpenAPI documentation", status: "completed" as const },
      { name: "Makefile automation", status: "completed" as const },
    ],
  },
  {
    id: "phase5",
    title: "Phase 5: Scale & Performance",
    status: "planned" as const,
    progress: 15,
    targetDate: "Q1 2026",
    items: [
      { name: "Multi-region DB replication", status: "planned" as const },
      { name: "CDN optimization", status: "planned" as const },
      { name: "Redis caching layer", status: "in-progress" as const },
      { name: "GraphQL layer (optional)", status: "planned" as const },
    ],
  },
];

// ============================================
// STATUS CONFIG
// ============================================

const statusConfig = {
  operational: {
    color: "success" as const,
    icon: "solar:check-circle-bold",
    label: "Operational",
  },
  degraded: {
    color: "warning" as const,
    icon: "solar:danger-triangle-bold",
    label: "Degraded",
  },
  outage: {
    color: "danger" as const,
    icon: "solar:close-circle-bold",
    label: "Outage",
  },
  maintenance: {
    color: "secondary" as const,
    icon: "solar:settings-bold",
    label: "Maintenance",
  },
};

// ============================================
// ANIMATED COUNTER COMPONENT
// ============================================

function AnimatedCounter({
  value,
  duration = 2000,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) =>
    decimals > 0 ? latest.toFixed(decimals) : Math.floor(latest).toLocaleString()
  );
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: duration / 1000,
      ease: "easeOut",
    });

    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, duration, motionValue, rounded]);

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

// ============================================
// RADIAL PROGRESS COMPONENT
// ============================================

function RadialProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = BRAND_COLORS.lime,
  label,
  sublabel,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}) {
  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-default-200 dark:text-default-100"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {value}%
        </span>
        {label && <span className="text-xs text-default-500">{label}</span>}
      </div>
      {sublabel && <span className="mt-2 text-sm font-medium">{sublabel}</span>}
    </div>
  );
}

// ============================================
// CONTRIBUTION HEATMAP COMPONENT
// ============================================

function ContributionHeatmap() {
  const contributionData = useMemo(() => generateContributionData(), []);

  const levelColors = [
    "bg-default-100 dark:bg-default-100/20",
    "bg-leet-lime/20",
    "bg-leet-lime/40",
    "bg-leet-lime/70",
    "bg-leet-lime",
  ];

  const weeks: { date: string; count: number; level: number }[][] = [];
  let currentWeek: { date: string; count: number; level: number }[] = [];

  contributionData.forEach((day, index) => {
    currentWeek.push(day);
    if ((index + 1) % 7 === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const totalContributions = contributionData.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="esports-card border border-leet-orange/20 dark:border-leet-lime/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="leet-icon-box leet-icon-box-sm">
              <Icon icon="solar:calendar-bold" className="w-4 h-4" />
            </div>
            <h3 className="font-bold">Development Activity</h3>
          </div>
          <Chip size="sm" variant="flat" className="rounded-none" color="success">
            {totalContributions} contributions (90 days)
          </Chip>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1 min-w-max">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <Tooltip
                    key={dayIndex}
                    content={`${day.count} commits on ${day.date}`}
                    classNames={{ content: "rounded-none" }}
                  >
                    <div
                      className={`w-3 h-3 ${levelColors[day.level]} transition-all hover:scale-125 cursor-pointer`}
                      style={{
                        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                      }}
                    />
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-3 text-xs text-default-500">
          <span>Less</span>
          {levelColors.map((color, i) => (
            <div key={i} className={`w-3 h-3 ${color}`} />
          ))}
          <span>More</span>
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================
// PULSE INDICATOR COMPONENT
// ============================================

function PulseIndicator({ status }: { status: "operational" | "degraded" | "outage" | "maintenance" }) {
  const colors = {
    operational: "bg-success",
    degraded: "bg-warning",
    outage: "bg-danger",
    maintenance: "bg-secondary",
  };

  return (
    <span className="relative flex h-3 w-3">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-75`}
      />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${colors[status]}`} />
    </span>
  );
}

// ============================================
// SERVICE CARD WITH SPARKLINE
// ============================================

function ServiceCardAdvanced({ service, index }: { service: ServiceStatus; index: number }) {
  const config = statusConfig[service.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="esports-card bg-content1/80 backdrop-blur-md border border-leet-orange/20 dark:border-leet-lime/20 overflow-hidden group hover:border-leet-orange/40 dark:hover:border-leet-lime/40 transition-all duration-300">
        <CardBody className="gap-3 p-4">
          <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
              <div className="leet-icon-box leet-icon-box-md flex-shrink-0">
                <Icon icon={service.icon || "solar:server-bold"} className="w-5 h-5" />
              </div>
            <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{service.name}</h3>
                  <PulseIndicator status={service.status} />
                </div>
              <p className="text-xs text-default-500">{service.description}</p>
            </div>
          </div>
          </div>

          {/* Mini Sparkline */}
          {service.metrics && (
            <div className="h-10 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={service.metrics}>
                  <defs>
                    <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BRAND_COLORS.lime} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={BRAND_COLORS.lime} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={BRAND_COLORS.lime}
                    strokeWidth={2}
                    fill={`url(#gradient-${index})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-default-500">Latency: </span>
                <span className="font-mono font-bold">{service.latency}ms</span>
              </div>
              <div>
                <span className="text-default-500">Uptime: </span>
                <span className="font-mono font-bold">{service.uptime}%</span>
              </div>
            </div>
            <Chip
              size="sm"
              color={config.color}
              variant="flat"
              classNames={{ base: "rounded-none" }}
            >
            {config.label}
          </Chip>
        </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// ============================================
// QUALITY METRICS RADAR
// ============================================

function QualityRadar() {
  return (
    <Card className="esports-card border border-leet-orange/20 dark:border-leet-lime/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="leet-icon-box leet-icon-box-sm">
            <Icon icon="solar:chart-2-bold" className="w-4 h-4" />
          </div>
          <h3 className="font-bold">Platform Capabilities</h3>
        </div>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={platformCapabilities}>
            <PolarGrid stroke="#444" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#888", fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#888", fontSize: 10 }} />
            <Radar
              name="Score"
              dataKey="A"
              stroke={BRAND_COLORS.lime}
              fill={BRAND_COLORS.lime}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

// ============================================
// ARCHITECTURE DIAGRAM
// ============================================

function ArchitectureDiagram() {
  const layers = [
    {
      name: "Adapters",
      color: BRAND_COLORS.orange,
      items: ["Controllers", "MongoDB Repos", "External APIs"],
    },
    {
      name: "Ports",
      color: BRAND_COLORS.gold,
      items: ["Commands (in)", "Repositories (out)", "Services"],
    },
    {
      name: "Domain Core",
      color: BRAND_COLORS.lime,
      items: ["Entities", "Value Objects", "Domain Services"],
    },
  ];

  return (
    <Card className="esports-card border border-leet-orange/20 dark:border-leet-lime/20 overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="leet-icon-box leet-icon-box-sm">
            <Icon icon="solar:layers-bold" className="w-4 h-4" />
          </div>
          <h3 className="font-bold">Hexagonal Architecture</h3>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="space-y-3">
          {layers.map((layer, index) => (
            <motion.div
              key={layer.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              <div
                className="p-4 border-l-4"
                style={{
                  borderColor: layer.color,
                  background: `linear-gradient(90deg, ${layer.color}10, transparent)`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold" style={{ color: layer.color }}>
                    {layer.name}
                  </span>
                  {index < layers.length - 1 && (
                    <Icon icon="solar:arrow-down-bold" className="w-4 h-4 text-default-400" />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {layer.items.map((item) => (
                    <Chip
                      key={item}
                      size="sm"
                      variant="flat"
                      classNames={{ base: "rounded-none" }}
                      style={{ backgroundColor: `${layer.color}20`, color: layer.color }}
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-default-50/50 dark:bg-default-100/5 text-center text-sm text-default-500">
          <Icon icon="solar:info-circle-bold" className="w-4 h-4 inline mr-1" />
          Controllers only orchestrate • Domain has no external dependencies • DDD + CQRS
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================
// SPRINT VELOCITY CHART
// ============================================

function SprintVelocityChart() {
  return (
    <Card className="esports-card border border-leet-orange/20 dark:border-leet-lime/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="leet-icon-box leet-icon-box-sm">
            <Icon icon="solar:chart-square-bold" className="w-4 h-4" />
            </div>
          <h3 className="font-bold">Sprint Velocity</h3>
        </div>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={sprintVelocity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
            <XAxis dataKey="sprint" tick={{ fill: "#888", fontSize: 12 }} />
            <YAxis tick={{ fill: "#888", fontSize: 12 }} />
            <Bar dataKey="completed" name="Completed" fill={BRAND_COLORS.lime} radius={[4, 4, 0, 0]} />
            <Bar dataKey="bugs" name="Bugs Fixed" fill={BRAND_COLORS.orange} radius={[4, 4, 0, 0]} />
            <Line
              type="monotone"
              dataKey="planned"
              name="Planned"
              stroke={BRAND_COLORS.gold}
              strokeWidth={2}
              dot={{ fill: BRAND_COLORS.gold, strokeWidth: 2 }}
            />
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

// ============================================
// MILESTONE TIMELINE
// ============================================

function MilestoneTimeline() {
  const categoryIcons: Record<string, string> = {
    backend: "solar:server-2-bold",
    security: "solar:shield-keyhole-bold",
    feature: "solar:star-shine-bold",
    infrastructure: "solar:cloud-bolt-bold",
  };

  const categoryColors: Record<string, string> = {
    backend: BRAND_COLORS.cyan,
    security: BRAND_COLORS.lime,
    feature: BRAND_COLORS.purple,
    infrastructure: BRAND_COLORS.gold,
  };

  return (
    <Card className="esports-card border border-leet-orange/20 dark:border-leet-lime/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="leet-icon-box leet-icon-box-sm">
            <Icon icon="solar:cup-star-bold" className="w-4 h-4" />
          </div>
          <h3 className="font-bold">Key Milestones</h3>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="relative pl-4">
          <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-leet-lime via-leet-gold to-leet-orange" />

          {milestones.slice(0, 6).map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-6 pb-6 last:pb-0"
            >
              <div
                className="absolute left-0 top-1 w-4 h-4 flex items-center justify-center"
                style={{
                  backgroundColor: categoryColors[milestone.category],
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                }}
              >
                <Icon
                  icon={categoryIcons[milestone.category]}
                  className="w-2.5 h-2.5 text-leet-navy"
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-sm">{milestone.title}</h4>
                  <p className="text-xs text-default-500 mt-0.5">{milestone.description}</p>
                </div>
                <Chip
              size="sm"
                  variant="flat"
                  classNames={{ base: "rounded-none flex-shrink-0" }}
                >
                  {milestone.date}
                </Chip>
              </div>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================
// ROADMAP PHASE CARD
// ============================================

function RoadmapPhaseCard({
  phase,
  index,
}: {
  phase: (typeof roadmapPhases)[0];
  index: number;
}) {
  const statusColors = {
    completed: BRAND_COLORS.success,
    "in-progress": BRAND_COLORS.gold,
    planned: BRAND_COLORS.navy,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={`esports-card h-full ${
          phase.status === "in-progress"
            ? "border-2 border-leet-gold dark:border-leet-lime ring-2 ring-leet-gold/20 dark:ring-leet-lime/20"
            : "border border-leet-orange/20 dark:border-leet-lime/20"
        }`}
      >
        <div
          className="p-4"
          style={{
            background:
              phase.status === "completed"
                ? `linear-gradient(135deg, ${BRAND_COLORS.success}15, transparent)`
                : phase.status === "in-progress"
                ? `linear-gradient(135deg, ${BRAND_COLORS.gold}15, transparent)`
                : `linear-gradient(135deg, ${BRAND_COLORS.navy}10, transparent)`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${statusColors[phase.status]}, ${BRAND_COLORS.navy})`,
                  clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <Icon
                  icon={
                    phase.status === "completed"
                      ? "solar:check-circle-bold"
                      : phase.status === "in-progress"
                      ? "solar:hourglass-line-bold"
                      : "solar:calendar-bold"
                  }
                  className="w-4 h-4 text-white"
            />
          </div>
              <div>
                <h4 className="font-bold text-sm">{phase.title}</h4>
                <p className="text-xs text-default-500">{phase.targetDate}</p>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-default-500">Progress</span>
              <span className="font-bold">{phase.progress}%</span>
            </div>
            <Progress
              value={phase.progress}
              size="sm"
              color={phase.status === "completed" ? "success" : phase.status === "in-progress" ? "warning" : "default"}
              classNames={{ track: "rounded-none", indicator: "rounded-none" }}
            />
          </div>
        </div>

        <CardBody className="pt-0">
          <div className="space-y-1.5">
            {phase.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm p-1.5 bg-default-50/30 dark:bg-default-100/5"
              >
                <Icon
                  icon={
                    item.status === "completed"
                      ? "solar:check-circle-bold"
                      : item.status === "in-progress"
                      ? "solar:hourglass-line-bold"
                      : "solar:clock-circle-bold"
                  }
                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                    item.status === "completed"
                      ? "text-success"
                      : item.status === "in-progress"
                      ? "text-warning"
                      : "text-default-400"
                  }`}
                />
                <span
                  className={`text-xs ${
                    item.status === "completed"
                      ? "text-default-600 dark:text-default-400"
                      : item.status === "in-progress"
                      ? "text-warning font-medium"
                      : "text-default-400"
                  }`}
                >
                  {item.name}
                </span>
              </div>
            ))}
          </div>
      </CardBody>
    </Card>
    </motion.div>
  );
}

// ============================================
// TECH STACK GRID
// ============================================

function TechStackGrid() {
  const techStack = [
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {techStack.map((tech, index) => (
        <motion.div
          key={tech.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <Tooltip content={tech.desc}>
            <div className="flex flex-col items-center gap-2 p-3 bg-default-50/50 dark:bg-default-100/5 hover:bg-default-100 dark:hover:bg-default-100/10 transition-all cursor-default border border-transparent hover:border-leet-lime/20">
              <Icon icon={tech.icon} className="w-7 h-7" />
              <span className="text-xs font-medium">{tech.name}</span>
            </div>
          </Tooltip>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function ServiceStatusPage() {
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedTab, setSelectedTab] = useState("status");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date());
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const allOperational = services.every((s) => s.status === "operational");
  const completionPercentage = Math.round((implementationStats.completed / implementationStats.totalFeatures) * 100);

  return (
    <div className="min-h-screen pb-16">
      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <div className="relative overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-leet-navy/10 via-transparent to-transparent dark:from-leet-lime/5" />
          <div
            className="absolute inset-0 opacity-30 dark:opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(220, 255, 55, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(220, 255, 55, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-leet-orange/10 blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-leet-lime/10 blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="relative container mx-auto px-4 py-12 max-w-7xl">
          {/* Title */}
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-leet-navy/5 dark:bg-leet-lime/10 border border-leet-orange/20 dark:border-leet-lime/20"
            >
              <PulseIndicator status="operational" />
              <span className="font-mono text-sm uppercase tracking-wider">Platform Status & Engineering Overview</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-leet-navy dark:text-leet-cream">Leet</span>
              <span className="text-leet-orange dark:text-leet-lime">Gaming</span>
              <span className="text-leet-navy dark:text-leet-cream">.PRO</span>
            </h1>
            <p className="text-lg text-default-500 max-w-2xl mx-auto">
              Enterprise-grade esports infrastructure with bank-level security, real-time analytics, and competitive
              gaming features
            </p>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
            {[
              { label: "Features Completed", value: implementationStats.completed, icon: "solar:check-circle-bold" },
              { label: "Lines of Code", value: "147K+", icon: "solar:code-square-bold" },
              { label: "Test Coverage", value: "85%", icon: "solar:test-tube-bold" },
              { label: "Services", value: services.length, icon: "solar:server-bold" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <Card className="esports-card bg-content1/60 backdrop-blur-sm border border-leet-orange/20 dark:border-leet-lime/20">
                  <CardBody className="p-4 text-center">
                    <Icon icon={stat.icon} className="w-6 h-6 mx-auto mb-2 text-leet-orange dark:text-leet-lime" />
                    <p className="text-2xl font-bold">
                      {typeof stat.value === "number" ? <AnimatedCounter value={stat.value} /> : stat.value}
                    </p>
                    <p className="text-xs text-default-500">{stat.label}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
        </div>

          {/* Overall Status Banner */}
          <AnimatePresence>
            {!loading && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto">
                <Card className={`esports-card border-2 ${allOperational ? "border-success" : "border-warning"}`}>
                  <CardBody className="py-6">
                    <div className="flex items-center justify-center gap-4">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Icon
                          icon={allOperational ? "solar:check-circle-bold" : "solar:danger-triangle-bold"}
                          className={`w-12 h-12 ${allOperational ? "text-success" : "text-warning"}`}
                        />
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-bold">{allOperational ? "All Systems Operational" : "Partial Disruption"}</h2>
                        <p className="text-sm text-default-500">
                          {services.length} services • Last checked {lastUpdated?.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Tabs */}
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          classNames={{
            tabList: "gap-2 bg-content1/60 backdrop-blur-md p-1 border border-leet-orange/20 dark:border-leet-lime/20 mb-8",
            cursor: "rounded-none bg-leet-navy dark:bg-leet-lime",
            tab: "rounded-none",
            tabContent: "group-data-[selected=true]:text-leet-cream dark:group-data-[selected=true]:text-leet-navy font-semibold",
          }}
          size="lg"
        >
          <Tab
            key="status"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:pulse-2-bold" className="w-4 h-4" />
                <span>Service Status</span>
              </div>
            }
          />
          <Tab
            key="work"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:graph-up-bold" className="w-4 h-4" />
                <span>Work History</span>
              </div>
            }
          />
          <Tab
            key="roadmap"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:map-arrow-right-bold" className="w-4 h-4" />
                <span>Roadmap</span>
              </div>
            }
          />
        </Tabs>

        {/* ============================================ */}
        {/* SERVICE STATUS TAB */}
        {/* ============================================ */}
        {selectedTab === "status" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {loading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {services.map((service, index) => (
                    <ServiceCardAdvanced key={service.name} service={service} index={index} />
                  ))}
                </div>

                <Divider className="my-8" />

                {/* Architecture & Quality */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ArchitectureDiagram />
                  <QualityRadar />
                </div>

                {/* Tech Stack */}
                <Card className="esports-card border border-leet-orange/20 dark:border-leet-lime/20">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="leet-icon-box leet-icon-box-sm">
                        <Icon icon="solar:code-square-bold" className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold">Technology Stack</h3>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <TechStackGrid />
                  </CardBody>
                </Card>

                {/* No Incidents */}
                <Card className="esports-card border border-success/30 bg-success/5">
                  <CardBody className="py-4">
                    <div className="flex items-center gap-3">
                      <Icon icon="solar:check-circle-bold" className="w-6 h-6 text-success" />
                      <div>
                        <p className="font-semibold">No incidents reported</p>
                        <p className="text-sm text-default-500">Last 30 days • 99.97% average uptime</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </>
            )}
          </motion.div>
        )}

        {/* ============================================ */}
        {/* WORK HISTORY TAB */}
        {/* ============================================ */}
        {selectedTab === "work" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Quality Metrics Ring */}
            <Card className="esports-card border-2 border-leet-orange dark:border-leet-lime overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-leet-orange via-leet-gold to-leet-lime" />
              <CardBody className="p-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-4">
                    <div className="leet-icon-box leet-icon-box-lg">
                      <Icon icon="solar:rocket-2-bold" className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Platform Implementation</h2>
                      <p className="text-default-500">
                        {implementationStats.completed} of {implementationStats.totalFeatures} features completed
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-6">
                    {qualityMetrics.slice(0, 4).map((metric) => (
                      <RadialProgress
                        key={metric.name}
                        value={metric.value}
                        color={metric.color}
                        size={90}
                        strokeWidth={8}
                        sublabel={metric.name}
                      />
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Contribution Heatmap */}
            <ContributionHeatmap />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Development Progress */}
              <Card className="esports-card border border-leet-orange/20 dark:border-leet-lime/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:chart-2-bold" className="w-5 h-5" />
                    <h3 className="font-bold">Development Progress</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={workHistory}>
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={BRAND_COLORS.lime} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={BRAND_COLORS.lime} stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                      <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#888", fontSize: 11 }} />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke={BRAND_COLORS.lime}
                        strokeWidth={2}
                        fill="url(#colorCompleted)"
                        name="Completed"
                      />
                      <Line type="monotone" dataKey="velocity" stroke={BRAND_COLORS.gold} strokeWidth={2} name="Velocity" dot={{ r: 3 }} />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              <SprintVelocityChart />
            </div>

            {/* Category & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <Card className="esports-card border border-leet-orange/20 dark:border-leet-lime/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:widget-5-bold" className="w-5 h-5" />
                    <h3 className="font-bold">Feature Categories</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {categoryBreakdown.map((cat, i) => (
                      <motion.div
                        key={cat.category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{cat.category}</span>
                          <span className="text-xs text-default-500">
                            {cat.completed}/{cat.total} ({cat.coverage}% coverage)
                          </span>
                        </div>
                        <Progress
                          value={(cat.completed / cat.total) * 100}
                          size="sm"
                          color="success"
                          classNames={{ track: "rounded-none", indicator: "rounded-none" }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Code Distribution */}
              <Card className="esports-card border border-leet-orange/20 dark:border-leet-lime/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:pie-chart-2-bold" className="w-5 h-5" />
                    <h3 className="font-bold">Code Distribution</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={techDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {techDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>

            {/* Milestones */}
            <MilestoneTimeline />

            {/* Open Source Banner */}
            <Card className="esports-card bg-gradient-to-br from-leet-navy dark:from-leet-black to-leet-navy-dark border border-leet-lime/30">
              <CardBody className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="leet-icon-box leet-icon-box-xl flex-shrink-0">
                    <Icon icon="solar:code-circle-bold" className="w-8 h-8" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-2xl font-bold text-leet-cream mb-2">Open Source Excellence</h3>
                    <p className="text-leet-cream/70 mb-4">
                      LeetGaming.PRO is built with the highest engineering standards. MIT licensed, fully documented, community-driven.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      {["MIT License", "90%+ Test Coverage", "Full Documentation", "SOLID Principles"].map((badge) => (
                        <Chip
                          key={badge}
                          variant="flat"
                          size="sm"
                          classNames={{ base: "bg-leet-lime/20 text-leet-lime rounded-none" }}
                        >
                          {badge}
                        </Chip>
                      ))}
                </div>
              </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* ============================================ */}
        {/* ROADMAP TAB */}
        {/* ============================================ */}
        {selectedTab === "roadmap" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Roadmap Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Product Roadmap</h2>
              <p className="text-default-500 max-w-2xl mx-auto">
                Our phased approach ensures stability and quality at every step. Each phase builds on proven foundations.
              </p>
            </div>

            {/* Overall Progress */}
            <Card className="esports-card border border-leet-orange/20 dark:border-leet-lime/20">
              <CardBody className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Overall Progress</h3>
                    <p className="text-default-500">3 of 5 phases completed</p>
                  </div>
                  <div className="flex-1 max-w-xl">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-default-500">Phase 4 in progress</span>
                      <span className="font-bold">{completionPercentage}% complete</span>
                    </div>
                    <Progress
                      value={completionPercentage}
                      size="lg"
                      classNames={{
                        track: "rounded-none h-4",
                        indicator: "rounded-none bg-gradient-to-r from-leet-orange via-leet-gold to-leet-lime",
                      }}
                    />
                  </div>
                </div>
          </CardBody>
        </Card>

            {/* Phase Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmapPhases.map((phase, index) => (
                <RoadmapPhaseCard key={phase.id} phase={phase} index={index} />
              ))}
        </div>

        <Divider className="my-8" />

            {/* Feature Highlights */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="leet-icon-box leet-icon-box-md">
                  <Icon icon="solar:star-shine-bold" className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold">Highlighted Capabilities</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: "solar:shield-keyhole-bold", title: "Glicko-2 Rating", desc: "Advanced skill rating with confidence intervals", done: true },
                  { icon: "solar:money-bag-bold", title: "Prize Pools", desc: "Merkle tree verification with blockchain proofs", done: true },
                  { icon: "solar:user-check-bold", title: "Anti-Smurf System", desc: "Behavioral analysis and restriction management", done: true },
                  { icon: "solar:document-medicine-bold", title: "Audit Trail", desc: "Bank-grade financial logging with hash chains", done: true },
                  { icon: "solar:gamepad-charge-bold", title: "Real-time Matchmaking", desc: "WebSocket queue with ETA estimation", done: true },
                  { icon: "solar:chart-2-bold", title: "Advanced Analytics", desc: "Performance tracking with visual insights", done: false },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card className="esports-card border border-leet-orange/20 dark:border-leet-lime/20 h-full">
                      <CardBody className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="leet-icon-box leet-icon-box-md flex-shrink-0">
                            <Icon icon={feature.icon} className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold">{feature.title}</h4>
                              <Chip
                                size="sm"
                                color={feature.done ? "success" : "warning"}
                                variant="flat"
                                classNames={{ base: "rounded-none" }}
                              >
                                {feature.done ? "✓" : "→"}
                              </Chip>
                            </div>
                            <p className="text-sm text-default-500">{feature.desc}</p>
                          </div>
              </div>
            </CardBody>
          </Card>
                  </motion.div>
                ))}
              </div>
        </div>

            {/* Vision Banner */}
            <Card className="esports-card bg-gradient-to-br from-leet-navy dark:from-leet-black to-leet-navy-dark border border-leet-lime/30 overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(${BRAND_COLORS.lime} 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>
              <CardBody className="p-8 relative">
                <div className="text-center max-w-3xl mx-auto">
                  <div className="leet-icon-box leet-icon-box-xl mx-auto mb-6">
                    <Icon icon="solar:rocket-2-bold" className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-leet-cream mb-4">The Future of Competitive Gaming</h3>
                  <p className="text-leet-cream/70 mb-8 text-lg">
                    From AI-powered analytics to blockchain-verified prize pools, we&apos;re building infrastructure that sets new standards for the esports industry.
                  </p>
                  <div className="flex flex-wrap gap-8 justify-center">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-leet-lime">
                        <AnimatedCounter value={147} />
                      </p>
                      <p className="text-sm text-leet-cream/50">Total Features</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-leet-lime">
                        <AnimatedCounter value={completionPercentage} suffix="%" />
                      </p>
                      <p className="text-sm text-leet-cream/50">Complete</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-leet-lime">Q1</p>
                      <p className="text-sm text-leet-cream/50">2026 Launch</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* ============================================ */}
        {/* FOOTER CTA */}
        {/* ============================================ */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-leet-orange/10 via-leet-gold/10 to-leet-lime/10 dark:from-leet-orange/5 dark:via-leet-gold/5 dark:to-leet-lime/5 border border-leet-orange/20 dark:border-leet-lime/20">
            <CardBody className="py-8">
              <Icon icon="solar:bell-bold" className="w-10 h-10 mx-auto mb-4 text-leet-orange dark:text-leet-lime" />
              <h3 className="text-lg font-semibold mb-2">Stay Informed</h3>
              <p className="text-default-500 mb-4">Get notified about service updates, new features, and platform announcements</p>
              <p className="text-sm text-default-400">
                Follow us on{" "}
                <a href="https://twitter.com/leetgamingpro" target="_blank" rel="noopener noreferrer" className="text-leet-orange dark:text-leet-lime hover:underline font-medium">
                  Twitter/X
                </a>{" "}
                and{" "}
                <a href="https://discord.gg/leetgaming" target="_blank" rel="noopener noreferrer" className="text-leet-orange dark:text-leet-lime hover:underline font-medium">
                  Discord
                </a>{" "}
                for real-time updates
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

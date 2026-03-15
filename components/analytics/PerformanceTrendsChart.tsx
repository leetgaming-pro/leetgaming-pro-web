/**
 * Performance Trends Chart
 * Time-series visualization of key CS2 performance metrics over recent matches
 * Per PRD D.6 - Player Analytics & Performance Tracking
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Switch,
  Tooltip,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

// ── Types ──────────────────────────────────────────────

export interface PerformanceDataPoint {
  matchIndex: number;
  matchLabel: string;
  date: string;
  mapName: string;
  result: "win" | "loss" | "draw";
  rating: number;
  adr: number;
  kast: number;
  hsPercent: number;
  kills: number;
  deaths: number;
  assists: number;
  impactRating?: number;
}

interface MetricConfig {
  key: keyof PerformanceDataPoint;
  label: string;
  color: string;
  icon: string;
  domain: [number, number];
  format: (v: number) => string;
  avgLabel: string;
  description: string;
}

interface PerformanceTrendsChartProps {
  data: PerformanceDataPoint[];
  isLoading?: boolean;
  title?: string;
}

// ── Metric configurations ──────────────────────────────

const METRICS: MetricConfig[] = [
  {
    key: "rating",
    label: "Rating 2.0",
    color: "#DCFF37",
    icon: "solar:chart-bold",
    domain: [0, 2.5],
    format: (v) => v.toFixed(2),
    avgLabel: "Avg Rating",
    description: "HLTV Rating 2.0 — measures overall impact per round",
  },
  {
    key: "adr",
    label: "ADR",
    color: "#17C964",
    icon: "solar:target-bold",
    domain: [0, 150],
    format: (v) => v.toFixed(1),
    avgLabel: "Avg ADR",
    description: "Average Damage per Round — raw fragging output",
  },
  {
    key: "kast",
    label: "KAST %",
    color: "#006FEE",
    icon: "solar:shield-check-bold",
    domain: [0, 100],
    format: (v) => `${v.toFixed(1)}%`,
    avgLabel: "Avg KAST",
    description:
      "Kill/Assist/Survive/Trade — rounds where you contributed",
  },
  {
    key: "hsPercent",
    label: "HS %",
    color: "#F5A524",
    icon: "solar:bomb-bold",
    domain: [0, 100],
    format: (v) => `${v.toFixed(1)}%`,
    avgLabel: "Avg HS%",
    description: "Headshot percentage — aim precision indicator",
  },
];

// ── Component ──────────────────────────────────────────

export function PerformanceTrendsChart({
  data,
  isLoading = false,
  title = "Performance Trends",
}: PerformanceTrendsChartProps) {
  const [activeMetrics, setActiveMetrics] = useState<string[]>(["rating"]);
  const [showMovingAvg, setShowMovingAvg] = useState(true);
  const [matchWindow, setMatchWindow] = useState<string>("20");

  const windowSize = parseInt(matchWindow, 10);

  // Compute moving average and prepare chart data
  const chartData = useMemo(() => {
    const sliced = data.slice(-windowSize);
    return sliced.map((point, idx) => {
      const movingAvgWindow = sliced.slice(Math.max(0, idx - 4), idx + 1);
      const entry: Record<string, unknown> = {
        ...point,
        label: `#${point.matchIndex}`,
      };
      for (const metric of METRICS) {
        const key = metric.key as string;
        const values = movingAvgWindow.map(
          (p) => p[metric.key] as number
        );
        entry[`${key}_ma`] =
          values.reduce((a, b) => a + b, 0) / values.length;
      }
      return entry;
    });
  }, [data, windowSize]);

  // Compute aggregates for selected metrics
  const aggregates = useMemo(() => {
    const sliced = data.slice(-windowSize);
    return METRICS.reduce(
      (acc, m) => {
        const vals = sliced.map((p) => p[m.key] as number);
        acc[m.key as string] = {
          avg: vals.reduce((a, b) => a + b, 0) / (vals.length || 1),
          min: Math.min(...vals),
          max: Math.max(...vals),
          trend:
            vals.length >= 2
              ? vals[vals.length - 1] - vals[0]
              : 0,
        };
        return acc;
      },
      {} as Record<
        string,
        { avg: number; min: number; max: number; trend: number }
      >
    );
  }, [data, windowSize]);

  const toggleMetric = (key: string) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
        <CardBody className="h-[480px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Icon
              icon="solar:chart-2-bold-duotone"
              className="w-12 h-12 text-default-300 animate-pulse"
            />
            <p className="text-default-500">Loading trends...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
        <CardBody className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <Icon
              icon="solar:chart-2-bold-duotone"
              className="w-16 h-16 text-default-300 mb-4 mx-auto"
            />
            <h3 className="text-lg font-semibold mb-1">
              No Performance Data Yet
            </h3>
            <p className="text-default-500">
              Play matches to see your performance trends
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
        <CardHeader className="flex flex-col gap-4 pb-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DCFF37]/20 flex items-center justify-center">
                <Icon
                  icon="solar:chart-bold"
                  className="text-[#DCFF37]"
                  width={20}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-xs text-default-500">
                  Last {Math.min(windowSize, data.length)} matches
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                size="sm"
                isSelected={showMovingAvg}
                onValueChange={setShowMovingAvg}
                classNames={{
                  wrapper: "group-data-[selected=true]:bg-[#DCFF37]",
                }}
              >
                <span className="text-xs text-default-500">5-match avg</span>
              </Switch>
              <Select
                aria-label="Match window"
                selectedKeys={[matchWindow]}
                onChange={(e) => setMatchWindow(e.target.value)}
                className="w-28"
                size="sm"
                classNames={{ trigger: "rounded-none" }}
              >
                <SelectItem key="10">Last 10</SelectItem>
                <SelectItem key="20">Last 20</SelectItem>
                <SelectItem key="50">Last 50</SelectItem>
              </Select>
            </div>
          </div>

          {/* Metric toggles */}
          <div className="flex flex-wrap gap-2 w-full">
            {METRICS.map((m) => {
              const isActive = activeMetrics.includes(m.key as string);
              const agg = aggregates[m.key as string];
              return (
                <Tooltip key={m.key as string} content={m.description}>
                  <Chip
                    className="cursor-pointer transition-all"
                    variant={isActive ? "solid" : "bordered"}
                    style={
                      isActive
                        ? { backgroundColor: `${m.color}20`, color: m.color, borderColor: m.color }
                        : { borderColor: `${m.color}40`, color: `${m.color}80` }
                    }
                    startContent={
                      <Icon icon={m.icon} className="w-3.5 h-3.5" />
                    }
                    onClick={() => toggleMetric(m.key as string)}
                  >
                    {m.label}: {m.format(agg?.avg ?? 0)}
                    {agg && agg.trend !== 0 && (
                      <span
                        className={`ml-1 text-xs ${agg.trend > 0 ? "text-success" : "text-danger"}`}
                      >
                        {agg.trend > 0 ? "↑" : "↓"}
                      </span>
                    )}
                  </Chip>
                </Tooltip>
              );
            })}
          </div>
        </CardHeader>

        <CardBody className="pt-4">
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  {METRICS.map((m) => (
                    <linearGradient
                      key={m.key as string}
                      id={`gradient-${m.key as string}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={m.color}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={m.color}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  ))}
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#889096", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />

                {activeMetrics.map((metricKey, idx) => {
                  const metric = METRICS.find(
                    (m) => (m.key as string) === metricKey
                  );
                  if (!metric) return null;
                  return (
                    <YAxis
                      key={metricKey}
                      yAxisId={metricKey}
                      orientation={idx === 0 ? "left" : "right"}
                      domain={metric.domain}
                      tick={{ fill: metric.color, fontSize: 10 }}
                      axisLine={{ stroke: `${metric.color}40` }}
                      hide={idx > 1}
                    />
                  );
                })}

                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(value: number, name: string) => {
                    const m = METRICS.find(
                      (mc) =>
                        (mc.key as string) === name ||
                        `${mc.key as string}_ma` === name
                    );
                    if (m) return [m.format(value), name.endsWith("_ma") ? `${m.label} (5-avg)` : m.label];
                    return [value, name];
                  }}
                  labelFormatter={(label: string, payload: unknown[]) => {
                    const entry = payload?.[0] as { payload?: PerformanceDataPoint } | undefined;
                    const point = entry?.payload;
                    if (!point) return label;
                    return `${point.mapName} — ${point.result === "win" ? "W" : point.result === "loss" ? "L" : "D"} — ${new Date(point.date).toLocaleDateString()}`;
                  }}
                />

                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, color: "#889096" }}
                />

                {activeMetrics.map((metricKey) => {
                  const metric = METRICS.find(
                    (m) => (m.key as string) === metricKey
                  );
                  if (!metric) return null;
                  const agg = aggregates[metricKey];
                  return (
                    <React.Fragment key={metricKey}>
                      {/* Raw data area */}
                      <Area
                        yAxisId={metricKey}
                        type="monotone"
                        dataKey={metricKey}
                        stroke={metric.color}
                        strokeWidth={2}
                        fill={`url(#gradient-${metricKey})`}
                        dot={(props: Record<string, unknown>) => {
                          const payload = props.payload as PerformanceDataPoint | undefined;
                          if (!payload) return <circle key={props.key as string} />;
                          const isWin = payload.result === "win";
                          return (
                            <circle
                              key={props.key as string}
                              cx={props.cx as number}
                              cy={props.cy as number}
                              r={4}
                              fill={isWin ? metric.color : "#F31260"}
                              stroke={isWin ? metric.color : "#F31260"}
                              strokeWidth={2}
                              fillOpacity={0.8}
                            />
                          );
                        }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                        name={metricKey}
                      />

                      {/* Moving average line */}
                      {showMovingAvg && (
                        <Area
                          yAxisId={metricKey}
                          type="monotone"
                          dataKey={`${metricKey}_ma`}
                          stroke={metric.color}
                          strokeWidth={3}
                          strokeDasharray="8 4"
                          fill="none"
                          dot={false}
                          name={`${metricKey}_ma`}
                        />
                      )}

                      {/* Average reference line */}
                      {agg && (
                        <ReferenceLine
                          yAxisId={metricKey}
                          y={agg.avg}
                          stroke={`${metric.color}40`}
                          strokeDasharray="3 3"
                          label={{
                            value: `${metric.avgLabel}: ${metric.format(agg.avg)}`,
                            fill: `${metric.color}80`,
                            fontSize: 10,
                            position: "insideTopRight",
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Win/Loss strip below chart */}
          <div className="mt-4 flex items-center gap-1">
            <span className="text-xs text-default-500 mr-2">Results:</span>
            {chartData.map((point, idx) => {
              const p = point as unknown as PerformanceDataPoint;
              return (
                <Tooltip
                  key={idx}
                  content={`${p.mapName} — ${p.result === "win" ? "Win" : p.result === "loss" ? "Loss" : "Draw"}`}
                >
                  <div
                    className={`w-3 h-3 rounded-sm ${
                      p.result === "win"
                        ? "bg-success"
                        : p.result === "loss"
                          ? "bg-danger"
                          : "bg-warning"
                    }`}
                  />
                </Tooltip>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export default PerformanceTrendsChart;

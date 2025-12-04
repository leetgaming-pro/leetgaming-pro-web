"use client";
import React, { useEffect, useState, useMemo } from "react";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import { Card, CardBody, Spinner } from "@nextui-org/react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface MetricPoint { ts: string; value: number; }

export default function AnalyticsDashboardPage() {
  const sdk = useMemo(() => new ReplayAPISDK(ReplayApiSettingsMock, logger), []);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ingestSeries, setIngestSeries] = useState<MetricPoint[]>([]);
  const [processingSeries, setProcessingSeries] = useState<MetricPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        // Placeholder: derive synthetic metrics from search results
        const all = await sdk.replayFiles.searchReplayFiles({});
        const byDay: Record<string, number> = {};
        all.forEach(r => {
          const day = new Date(r.createdAt).toISOString().split("T")[0];
          byDay[day] = (byDay[day] || 0) + 1;
        });
        const sortedDays = Object.keys(byDay).sort();
        setIngestSeries(sortedDays.map(d => ({ ts: d, value: byDay[d] })));
        // Simulate processing lag metric
        setProcessingSeries(sortedDays.map(d => ({ ts: d, value: Math.max(0, byDay[d] - Math.floor(byDay[d] * 0.2)) })));
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed loading metrics";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sdk]);

  return (
    <div className="px-4 py-6 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Analytics Dashboard</h1>
      {loading && <div className="flex items-center gap-2"><Spinner size="sm" /> <span className="text-sm">Loading metrics...</span></div>}
      {error && <p className="text-danger text-sm mb-4">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardBody className="h-[360px]">
              <h2 className="text-sm font-semibold mb-2">Daily Replay Ingest</h2>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ingestSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="ts" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#006FEE" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="h-[360px]">
              <h2 className="text-sm font-semibold mb-2">Processed vs Pending</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingestSeries.map((p, i) => ({ ts: p.ts, processed: processingSeries[i]?.value || 0, pending: Math.max(0, p.value - (processingSeries[i]?.value || 0)) }))}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="ts" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="processed" stackId="a" fill="#17C964" radius={[4,4,0,0]} />
                  <Bar dataKey="pending" stackId="a" fill="#F5A524" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

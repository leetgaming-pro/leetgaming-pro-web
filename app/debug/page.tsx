"use client";
import * as React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import pkg from "../../package.json";

interface PerformanceMemory {
  jsHeapSizeLimit?: number;
  totalJSHeapSize?: number;
  usedJSHeapSize?: number;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

// Simple types for metrics
interface FetchMetric {
  url: string;
  method: string;
  status?: number;
  start: number;
  end?: number;
  duration?: number;
  error?: string;
}

interface MetricsSnapshot {
  fetches: FetchMetric[];
  logs: { level: string; message: string; ts: number }[];
  forecast: { projectedRequestsNextHour: number; basisMinutes: number };
  aggregates: { totalRequests: number; avgLatencyMs: number; errorRate: number };
  env: Record<string, string | undefined>;
  memory?: { jsHeapSizeLimit?: number; totalJSHeapSize?: number; usedJSHeapSize?: number };
  navigator?: { userAgent: string; language?: string; online?: boolean };
  lastUpdated: number;
}

const LOCAL_STORAGE_KEY = "lg_debug_metrics";

function loadPersisted(): MetricsSnapshot | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persist(snapshot: MetricsSnapshot) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore
  }
}

export default function DebugPage() {
  const [snapshot, setSnapshot] = useState<MetricsSnapshot | null>(() => (typeof window !== "undefined" ? loadPersisted() : null));
  const fetchMetricsRef = useRef<FetchMetric[]>(snapshot?.fetches || []);
  const logsRef = useRef<MetricsSnapshot["logs"]>(snapshot?.logs || []);
  const [tick, setTick] = useState(0);

  const capture = useCallback(() => {
    const now = Date.now();
    const lastHourCutoff = now - 60 * 60 * 1000;
    const recentFetches = fetchMetricsRef.current.filter((f: FetchMetric) => f.start >= lastHourCutoff);
    const totalRequests = fetchMetricsRef.current.length;
    const completed = fetchMetricsRef.current.filter((f: FetchMetric) => f.duration !== undefined);
    const avgLatencyMs = completed.length ? completed.reduce((a: number, c: FetchMetric) => a + (c.duration || 0), 0) / completed.length : 0;
    const errorRate = completed.length ? completed.filter((f: FetchMetric) => (f.status && f.status >= 400) || f.error).length / completed.length : 0;

    // Simple linear projection: requests per minute * 60
    const basisMinutes = Math.max(1, (now - (recentFetches[0]?.start || now)) / (60 * 1000));
    const projectedRequestsNextHour = basisMinutes ? Math.round((recentFetches.length / basisMinutes) * 60) : recentFetches.length;

    const env: Record<string, string | undefined> = {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERSION: pkg.version,
    };

    const extPerf = performance as ExtendedPerformance;
    const memory = extPerf.memory
      ? {
          jsHeapSizeLimit: extPerf.memory.jsHeapSizeLimit,
          totalJSHeapSize: extPerf.memory.totalJSHeapSize,
          usedJSHeapSize: extPerf.memory.usedJSHeapSize,
        }
      : undefined;

    const nav: MetricsSnapshot["navigator"] = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      online: navigator.onLine,
    };

    const newSnap: MetricsSnapshot = {
      fetches: [...fetchMetricsRef.current].slice(-500),
      logs: [...logsRef.current].slice(-500),
      forecast: { projectedRequestsNextHour, basisMinutes },
      aggregates: { totalRequests, avgLatencyMs, errorRate },
      env,
      memory,
      navigator: nav,
      lastUpdated: now,
    };
    setSnapshot(newSnap);
    persist(newSnap);
  }, []);

  // Instrument fetch
  useEffect(() => {
    if (typeof window === "undefined") return;
    const origFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const metric: FetchMetric = {
        url: typeof input === "string" ? input : input.toString(),
        method: init?.method || "GET",
        start: performance.now(),
      };
      fetchMetricsRef.current.push(metric);
      try {
        const resp = await origFetch(input, init);
        metric.end = performance.now();
        metric.duration = metric.end - metric.start;
        metric.status = resp.status;
        return resp;
      } catch (err) {
        metric.end = performance.now();
        metric.duration = metric.end - metric.start;
        metric.error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        setTick((t: number) => t + 1);
      }
    };
    return () => {
      window.fetch = origFetch;
    };
  }, []);

  // Instrument console
  useEffect(() => {
    if (typeof window === "undefined") return;
    const orig = { log: console.log, warn: console.warn, error: console.error };
    const wrap = (level: string, fn: (...a: unknown[]) => void) => {
      return (...args: unknown[]) => {
        logsRef.current.push({ level, message: args.map(a => (typeof a === "string" ? a : JSON.stringify(a))).join(" "), ts: Date.now() });
        fn(...args);
        setTick((t: number) => t + 1);
      };
    };
    console.log = wrap("log", orig.log);
    console.warn = wrap("warn", orig.warn);
    console.error = wrap("error", orig.error);
    return () => {
      console.log = orig.log;
      console.warn = orig.warn;
      console.error = orig.error;
    };
  }, []);

  // Periodic snapshot refresh
  useEffect(() => {
    capture();
    const i = setInterval(capture, 5000);
    return () => clearInterval(i);
  }, [capture]);

  const clearAll = () => {
    fetchMetricsRef.current = [];
    logsRef.current = [];
    persist({
      fetches: [],
      logs: [],
      forecast: { projectedRequestsNextHour: 0, basisMinutes: 0 },
      aggregates: { totalRequests: 0, avgLatencyMs: 0, errorRate: 0 },
      env: {},
      lastUpdated: Date.now(),
    } as MetricsSnapshot);
    setSnapshot(loadPersisted());
  };

  if (!snapshot) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Debug Dashboard</h1>
        <p>Initializing metrics...</p>
      </div>
    );
  }

  const fmt = (ms: number) => ms.toFixed(1);

  return (
    <div className="p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Debug Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={capture} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Refresh</button>
          <button onClick={clearAll} className="px-3 py-1 rounded bg-red-600 text-white text-sm">Clear</button>
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h2 className="font-medium mb-2">Aggregates</h2>
          <ul className="text-sm space-y-1">
            <li>Total Requests: {snapshot.aggregates.totalRequests}</li>
            <li>Avg Latency: {fmt(snapshot.aggregates.avgLatencyMs)} ms</li>
            <li>Error Rate: {(snapshot.aggregates.errorRate * 100).toFixed(2)}%</li>
          </ul>
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-medium mb-2">Forecast</h2>
            <ul className="text-sm space-y-1">
              <li>Projected Next Hour: {snapshot.forecast.projectedRequestsNextHour}</li>
              <li>Basis Minutes: {snapshot.forecast.basisMinutes.toFixed(2)}</li>
            </ul>
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-medium mb-2">Environment</h2>
          <ul className="text-sm space-y-1">
            {Object.entries(snapshot.env).map(([k,v]) => <li key={k}>{k}: {v ?? "(unset)"}</li>)}
            <li>Updated: {new Date(snapshot.lastUpdated).toLocaleTimeString()}</li>
          </ul>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border rounded max-h-80 overflow-auto">
          <h2 className="font-medium mb-2">Recent Fetches</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left border-b">
                <th className="py-1">Method</th>
                <th className="py-1">Status</th>
                <th className="py-1">Latency</th>
                <th className="py-1">URL</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.fetches.slice(-50).reverse().map((f,i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="py-1 font-mono">{f.method}</td>
                  <td className="py-1 font-mono">{f.status ?? ""}</td>
                  <td className="py-1 font-mono">{f.duration ? fmt(f.duration) : ""}</td>
                  <td className="py-1 truncate max-w-[220px]" title={f.url}>{f.url}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border rounded max-h-80 overflow-auto">
          <h2 className="font-medium mb-2">Logs</h2>
          <ul className="space-y-1 text-xs font-mono">
            {snapshot.logs.slice(-100).reverse().map((l,i) => (
              <li key={i} className="flex gap-2">
                <span className={l.level === "error" ? "text-red-600" : l.level === "warn" ? "text-yellow-600" : "text-gray-700"}>{l.level.toUpperCase()}</span>
                <span>{new Date(l.ts).toLocaleTimeString()}</span>
                <span className="truncate" title={l.message}>{l.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h2 className="font-medium mb-2">Memory</h2>
          {snapshot.memory ? (
            <ul className="text-xs space-y-1 font-mono">
              <li>Used: {snapshot.memory.usedJSHeapSize} / {snapshot.memory.totalJSHeapSize}</li>
              <li>Limit: {snapshot.memory.jsHeapSizeLimit}</li>
            </ul>
          ) : <p className="text-xs text-gray-500">Not available</p>}
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-medium mb-2">Navigator</h2>
          <ul className="text-xs space-y-1 font-mono">
            <li>UserAgent: {snapshot.navigator?.userAgent}</li>
            <li>Lang: {snapshot.navigator?.language}</li>
            <li>Online: {String(snapshot.navigator?.online)}</li>
          </ul>
        </div>
      </section>

    </div>
  );
}

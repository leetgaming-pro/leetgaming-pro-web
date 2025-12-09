"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Chip, Spinner, Divider, Progress } from "@nextui-org/react";
import { Icon } from "@iconify/react";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  latency?: number;
  uptime?: number;
  lastChecked?: Date;
  description?: string;
}

const services: ServiceStatus[] = [
  {
    name: "Web Application",
    status: "operational",
    latency: 45,
    uptime: 99.98,
    description: "Main web platform and user interface",
  },
  {
    name: "API Services",
    status: "operational",
    latency: 23,
    uptime: 99.95,
    description: "REST API and backend services",
  },
  {
    name: "Cloud Storage",
    status: "operational",
    latency: 120,
    uptime: 99.99,
    description: "Replay and highlight file storage",
  },
  {
    name: "Authentication",
    status: "operational",
    latency: 35,
    uptime: 99.97,
    description: "User authentication and authorization",
  },
  {
    name: "Database",
    status: "operational",
    latency: 12,
    uptime: 99.99,
    description: "Primary database services",
  },
  {
    name: "CDN",
    status: "operational",
    latency: 8,
    uptime: 100,
    description: "Content delivery network",
  },
  {
    name: "WebSocket",
    status: "operational",
    latency: 15,
    uptime: 99.92,
    description: "Real-time updates and notifications",
  },
  {
    name: "Search",
    status: "operational",
    latency: 67,
    uptime: 99.89,
    description: "Search and indexing services",
  },
];

const statusConfig = {
  operational: {
    color: "success" as const,
    icon: "solar:check-circle-bold",
    label: "Operational",
  },
  degraded: {
    color: "warning" as const,
    icon: "solar:danger-triangle-bold",
    label: "Degraded Performance",
  },
  outage: {
    color: "danger" as const,
    icon: "solar:close-circle-bold",
    label: "Service Outage",
  },
  maintenance: {
    color: "secondary" as const,
    icon: "solar:settings-bold",
    label: "Under Maintenance",
  },
};

function ServiceCard({ service }: { service: ServiceStatus }) {
  const config = statusConfig[service.status];

  return (
    <Card className="bg-content1/60 backdrop-blur-md border border-white/10">
      <CardBody className="gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon icon={config.icon} className={`text-${config.color} w-6 h-6`} />
            <div>
              <p className="font-semibold">{service.name}</p>
              <p className="text-xs text-default-500">{service.description}</p>
            </div>
          </div>
          <Chip color={config.color} variant="flat" size="sm">
            {config.label}
          </Chip>
        </div>
        
        {service.latency !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-default-500">Latency</span>
            <span className="font-mono">{service.latency}ms</span>
          </div>
        )}
        
        {service.uptime !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-default-500">Uptime (30d)</span>
              <span className="font-mono">{service.uptime}%</span>
            </div>
            <Progress 
              value={service.uptime} 
              color={service.uptime >= 99.9 ? "success" : service.uptime >= 99 ? "warning" : "danger"}
              size="sm"
              className="max-w-full"
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default function ServiceStatusPage() {
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date());
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const allOperational = services.every((s) => s.status === "operational");
  const hasOutage = services.some((s) => s.status === "outage");
  const hasDegraded = services.some((s) => s.status === "degraded");

  const overallStatus = hasOutage 
    ? "outage" 
    : hasDegraded 
    ? "degraded" 
    : allOperational 
    ? "operational" 
    : "maintenance";

  const overallConfig = statusConfig[overallStatus];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-content1/20">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Service Status</h1>
          <p className="text-default-500 text-lg">
            Real-time status of LeetGaming Pro services
          </p>
        </div>

        {/* Overall Status Card */}
        <Card className="mb-8 bg-content1/60 backdrop-blur-md border border-white/10">
          <CardBody className="py-8">
            {loading ? (
              <div className="flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Icon 
                  icon={overallConfig.icon} 
                  className={`text-${overallConfig.color} w-16 h-16`} 
                />
                <div className="text-center">
                  <h2 className="text-2xl font-bold">
                    {allOperational 
                      ? "All Systems Operational" 
                      : hasOutage 
                      ? "Service Disruption" 
                      : "Partial Disruption"}
                  </h2>
                  {lastUpdated && (
                    <p className="text-default-500 text-sm mt-2">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Services Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.name} service={service} />
            ))}
          </div>
        </div>

        <Divider className="my-8" />

        {/* Incident History */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Incidents</h2>
          <Card className="bg-content1/60 backdrop-blur-md border border-white/10">
            <CardBody>
              <div className="flex items-center gap-3 text-default-500">
                <Icon icon="solar:check-circle-linear" className="w-5 h-5" />
                <p>No incidents reported in the last 30 days</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Subscribe to Updates */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-white/10">
            <CardBody className="py-8">
              <Icon icon="solar:bell-bold" className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Stay Informed</h3>
              <p className="text-default-500 mb-4">
                Get notified about service disruptions and maintenance windows
              </p>
              <p className="text-sm text-default-400">
                Follow us on{" "}
                <a 
                  href="https://twitter.com/leetgamingpro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Twitter/X
                </a>
                {" "}for real-time updates
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

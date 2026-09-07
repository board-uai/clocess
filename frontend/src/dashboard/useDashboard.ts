import { useEffect, useMemo, useState } from "react";

export type DashboardStatus = "loading" | "ready" | "failed";
export type TimeRange = "1h" | "24h" | "7d" | "30d";

export interface ServerStat {
  id: string;
  name: string;
  status: "online" | "offline";
  cpu: number | null;
  ram: number | null;
  diskUsedGb: number;
  diskTotalGb: number;
  lastSeen: string;
}

export interface ActivityEntry {
  id: string;
  time: string;
  message: string;
}

export interface AlertEntry {
  id: string;
  message: string;
}

export interface TimeSeriesPoint {
  t: number;
  value: number;
}

// Seed data
const MOCK_SERVERS: ServerStat[] = [
  {
    id: "server1",
    name: "server1",
    status: "online",
    cpu: 38,
    ram: 52,
    diskUsedGb: 2.6,
    diskTotalGb: 3,
    lastSeen: "4s",
  },
  {
    id: "server2",
    name: "server2",
    status: "online",
    cpu: 44,
    ram: 61,
    diskUsedGb: 2.1,
    diskTotalGb: 3,
    lastSeen: "6s",
  },
  {
    id: "server3",
    name: "server3",
    status: "offline",
    cpu: null,
    ram: null,
    diskUsedGb: 0,
    diskTotalGb: 3,
    lastSeen: "3m",
  },
  {
    id: "server4",
    name: "server4",
    status: "offline",
    cpu: null,
    ram: null,
    diskUsedGb: 0,
    diskTotalGb: 3,
    lastSeen: "1h",
  },
];

const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: "1", time: "14:58", message: "upload report.pdf — server1" },
  { id: "2", time: "14:52", message: "download build.zip — server2" },
  { id: "3", time: "14:40", message: "server3 disconnected" },
  { id: "4", time: "14:31", message: "config changed — server1" },
  { id: "5", time: "14:20", message: "delete old.log — server2" },
];

const MOCK_ALERTS: AlertEntry[] = [
  { id: "1", message: "server3 status 500" },
  { id: "2", message: "server4 status 500" },
  { id: "3", message: "server2 storage 90%" },
  { id: "4", message: "device pairing pending" },
];

function mockSeries(seed: number): TimeSeriesPoint[] {
  return Array.from({ length: 24 }, (_, i) => ({
    t: i,
    value: Math.round(
      40 + 25 * Math.sin(i / 3 + seed) + 10 * Math.sin(i * 1.7 + seed),
    ),
  }));
}

export function useDashboard() {
  const [range, setRange] = useState<TimeRange>("24h");
  const [serverFilter, setServerFilter] = useState<string>("all");
  const [status, setStatus] = useState<DashboardStatus>("loading");

  const [servers, setServers] = useState<ServerStat[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [cpuSeries, setCpuSeries] = useState<TimeSeriesPoint[]>([]);
  const [ramSeries, setRamSeries] = useState<TimeSeriesPoint[]>([]);

  // Setting up mock data cause there are no API endpoints yet available
  useEffect(() => {
    let alive = true;
    const id = setTimeout(() => {
      if (!alive) return;
      setServers(MOCK_SERVERS);
      setActivity(MOCK_ACTIVITY);
      setAlerts(MOCK_ALERTS);
      setCpuSeries(mockSeries(0));
      setRamSeries(mockSeries(2));
      setStatus("ready");
    }, 200);
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, [range, serverFilter]);

  const stats = useMemo(() => {
    const online = servers.filter((s) => s.status === "online");
    const diskUsed = servers.reduce((sum, s) => sum + s.diskUsedGb, 0);
    const diskTotal = servers.reduce((sum, s) => sum + s.diskTotalGb, 0);
    const avgCpu = online.length
      ? Math.round(
          online.reduce((sum, s) => sum + (s.cpu ?? 0), 0) / online.length,
        )
      : 0;

    return {
      online: online.length,
      total: servers.length,
      diskUsed,
      diskTotal,
      avgCpu,
      activateAlerts: alerts.length,
    };
  }, [servers, alerts]);

  return {
    status,
    servers,
    activity,
    alerts,
    cpuSeries,
    ramSeries,
    stats,
    range,
    setRange,
    serverFilter,
    setServerFilter,
  };
}

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
  serverId?: string;
}

export interface AlertEntry {
  id: string;
  message: string;
  serverId?: string;
}

export interface TimeSeriesPoint {
  /** short relative tick shown under the chart, e.g. "3d" */
  axisLabel: string;
  /** exact date shown only in the hover tooltip, e.g. "09/08 14:56" */
  fullLabel: string;
  value: number;
}

export interface ServerSeries {
  serverId: string;
  name: string;
  points: TimeSeriesPoint[];
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
  { id: "1", time: "14:58", message: "upload report.pdf — server1", serverId: "server1" },
  { id: "2", time: "14:52", message: "download build.zip — server2", serverId: "server2" },
  { id: "3", time: "14:40", message: "server3 disconnected", serverId: "server3" },
  { id: "4", time: "14:31", message: "config changed — server1", serverId: "server1" },
  { id: "5", time: "14:20", message: "delete old.log — server2", serverId: "server2" },
];

const MOCK_ALERTS: AlertEntry[] = [
  { id: "1", message: "server3 status 500", serverId: "server3" },
  { id: "2", message: "server4 status 500", serverId: "server4" },
  { id: "3", message: "server2 storage 90%", serverId: "server2" },
  { id: "4", message: "device pairing pending" },
];

const RANGE_POINTS: Record<TimeRange, number> = {
  "1h": 12,
  "24h": 24,
  "7d": 7,
  "30d": 30,
};

const RANGE_STEP_MS: Record<TimeRange, number> = {
  "1h": 5 * 60 * 1000,
  "24h": 60 * 60 * 1000,
  "7d": 24 * 60 * 60 * 1000,
  "30d": 24 * 60 * 60 * 1000,
};

const pad = (n: number) => String(n).padStart(2, "0");

// intraday ranges show date + time, e.g. "02/03 14:56"
const formatDateTime = (d: Date) =>
  `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

// multi-day ranges just show the date, e.g. "02/03/2007"
const formatDate = (d: Date) =>
  `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;

const fullLabel = (range: TimeRange, i: number, length: number): string => {
  const pointsBeforeNow = length - 1 - i;
  const date = new Date(Date.now() - pointsBeforeNow * RANGE_STEP_MS[range]);
  return range === "7d" || range === "30d" ? formatDate(date) : formatDateTime(date);
};

const axisLabel = (range: TimeRange, i: number): string => {
  switch (range) {
    case "1h":
      return `${(i + 1) * 5}m`;
    case "24h":
      return `${i + 1}h`;
    case "7d":
    case "30d":
      return `${i + 1}d`;
  }
};

const mockSeries = (seed: number, range: TimeRange): TimeSeriesPoint[] => {
  const length = RANGE_POINTS[range];
  return Array.from({ length }, (_, i) => ({
    axisLabel: axisLabel(range, i),
    fullLabel: fullLabel(range, i, length),
    value: Math.round(
      40 + 25 * Math.sin(i / 3 + seed + length) + 10 * Math.sin(i * 1.7 + seed),
    ),
  }));
};

const filterByServer = <T extends { serverId?: string }>(
  items: T[],
  serverId: string,
): T[] =>
  serverId === "all" ? items : items.filter((item) => item.serverId === serverId);

export const useDashboard = () => {
  const [range, setRange] = useState<TimeRange>("24h");
  const [serverFilter, setServerFilter] = useState<string>("all");
  const [status, setStatus] = useState<DashboardStatus>("loading");

  const [servers, setServers] = useState<ServerStat[]>([]);
  const [allServers, setAllServers] = useState<ServerStat[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [cpuSeries, setCpuSeries] = useState<ServerSeries[]>([]);
  const [ramSeries, setRamSeries] = useState<ServerSeries[]>([]);

  // Setting up mock data cause there are no API endpoints yet available
  useEffect(() => {
    let alive = true;
    const id = setTimeout(() => {
      if (!alive) return;

      const visibleServers =
        serverFilter === "all"
          ? MOCK_SERVERS
          : MOCK_SERVERS.filter((s) => s.id === serverFilter);

      // one line per visible server — a distinct seed per server index so
      // "all servers" overlays genuinely different-looking lines, not copies
      const cpu = visibleServers.map((s, i) => ({
        serverId: s.id,
        name: s.name,
        points: mockSeries(i + 1, range),
      }));
      const ram = visibleServers.map((s, i) => ({
        serverId: s.id,
        name: s.name,
        points: mockSeries(i + 1 + 10, range),
      }));

      setServers(visibleServers);
      setAllServers(MOCK_SERVERS);
      setActivity(filterByServer(MOCK_ACTIVITY, serverFilter));
      setAlerts(filterByServer(MOCK_ALERTS, serverFilter));
      setCpuSeries(cpu);
      setRamSeries(ram);
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
      activeAlerts: alerts.length,
    };
  }, [servers, alerts]);

  return {
    status,
    servers,
    allServers,
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
};

import { Container } from "@/ui/Container";
import {
  useDashboard,
  DashboardToolbar,
  Statistics,
  ConnectedServers,
  ActivityLog,
  Alerts,
  LineChart,
  DiskUsageChart,
} from "@/dashboard";

export const Dashboard = () => {
  const {
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
  } = useDashboard();

  return (
    <section>
      <h1 className="mb-8 text-[22px]">Dashboard</h1>
      <div className="flex flex-col gap-5">
        <DashboardToolbar
          servers={servers}
          serverFilter={serverFilter}
          onServerFilterChange={setServerFilter}
          range={range}
          onRangeChange={setRange}
        />

        {status === "loading" && (
          <p className="text-[15px] text-ink-3">loading</p>
        )}

        {status === "ready" && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-12">
            <Statistics stats={stats} />
          </div>
        )}
      </div>
    </section>
  );
};

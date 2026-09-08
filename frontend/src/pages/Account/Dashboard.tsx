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
  } = useDashboard();

  return (
    <section>
      <div className="flex flex-col gap-5">
        <DashboardToolbar
          servers={allServers}
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
            <ConnectedServers servers={servers} />
            <LineChart label="cpu over time" series={cpuSeries} />
            <LineChart label="ram over time" series={ramSeries} />
            <DiskUsageChart servers={servers} />
            <ActivityLog entries={activity} />
            <Alerts alerts={alerts} />
          </div>
        )}
      </div>
    </section>
  );
};

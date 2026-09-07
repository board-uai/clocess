import { Container } from "@/ui/Container";
import type { useDashboard } from "./useDashboard";

type Stats = ReturnType<typeof useDashboard>["stats"];

const StatCard = ({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) => {
  return (
    <Container className="sm:col-span-3">
      <p className="mb-2 text-[15px] text-ink-3">{label}</p>
      <p className={`text-[22px] ${danger ? "text-red-500" : ""}`}>{value}</p>
    </Container>
  );
};

export const Statistics = ({ stats }: { stats: Stats }) => {
  return (
    <>
      <StatCard label="servers online" value={`${stats.online} / ${stats.total}`} />
      <StatCard
        label="storage used"
        value={`${stats.diskUsed.toFixed(1)} / ${stats.diskTotal} GB`}
      />
      <StatCard label="avg cpu" value={`${stats.avgCpu}%`} />
      <StatCard
        label="active alerts"
        value={`${stats.activeAlerts}`}
        danger={stats.activeAlerts > 0}
      />
    </>
  );
};

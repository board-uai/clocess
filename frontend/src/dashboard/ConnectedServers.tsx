import { Container } from "@/ui/Container";
import type { ServerStat } from "./useDashboard";

const ROW =
  "grid grid-cols-[1.2fr_0.6fr_0.6fr_0.8fr_0.6fr_auto] items-center gap-3 border-b border-hair py-3 text-[15px] last:border-0";
const ACTION = "text-ink-3 transition-colors hover:text-ink";

export const ConnectedServers = ({ servers }: { servers: ServerStat[] }) => {
  return (
    <Container className="sm:col-span-12">
      <p className="mb-4 text-[17px]">connected servers</p>

      <div className={`${ROW} text-ink-3`}>
        <span>name</span>
        <span>cpu</span>
        <span>ram</span>
        <span>disk</span>
        <span>last seen</span>
        <span />
      </div>

      {servers.map((s) => (
        <div key={s.id} className={ROW}>
          <span className="flex items-center gap-2 truncate">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.status === "online" ? "bg-ink" : "bg-ink-3"}`}
            />
            {s.name}
          </span>
          <span>{s.cpu !== null ? `${s.cpu}%` : "—"}</span>
          <span>{s.ram !== null ? `${s.ram}%` : "—"}</span>
          <span>
            {s.diskUsedGb}/{s.diskTotalGb}GB
          </span>
          <span className="text-ink-3">{s.lastSeen}</span>
          <span className="flex gap-3">
            <button type="button" className={ACTION}>
              view
            </button>
            <button type="button" className={ACTION}>
              edit
            </button>
            <button type="button" className={ACTION}>
              remove
            </button>
          </span>
        </div>
      ))}
    </Container>
  );
};

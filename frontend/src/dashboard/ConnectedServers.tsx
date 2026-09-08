import { Fragment } from "react";
import { Container } from "@/ui/Container";
import type { ServerStat } from "./useDashboard";

// one grid shared by the header AND every row, so columns are guaranteed to
// line up — separate per-row grids each size their own columns independently
// and drift out of alignment as soon as row content widths differ
const GRID =
  "grid grid-cols-[1.2fr_0.6fr_0.6fr_0.8fr_0.6fr_auto] items-center gap-x-3 text-[15px]";
const CELL = "py-2";
const ACTION = "text-ink-3 transition-colors hover:text-ink";

export const ConnectedServers = ({ servers }: { servers: ServerStat[] }) => {
  return (
    <Container className="sm:col-span-12 p-6!">
      <p className="mb-4 text-[17px]">connected servers</p>

      <div className={GRID}>
        <span className={`${CELL} border-b border-hair text-ink-3`}>name</span>
        <span className={`${CELL} border-b border-hair text-ink-3`}>cpu</span>
        <span className={`${CELL} border-b border-hair text-ink-3`}>ram</span>
        <span className={`${CELL} border-b border-hair text-ink-3`}>disk</span>
        <span className={`${CELL} border-b border-hair text-ink-3`}>last seen</span>
        <span className={`${CELL} border-b border-hair`} />

        {servers.map((s, i) => {
          const border = i < servers.length - 1 ? "border-b border-hair" : "";
          return (
            <Fragment key={s.id}>
              <span className={`${CELL} ${border} flex items-center gap-2 truncate`}>
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.status === "online" ? "bg-ink" : "bg-ink-3"}`}
                />
                {s.name}
              </span>
              <span className={`${CELL} ${border}`}>
                {s.cpu !== null ? `${s.cpu}%` : "—"}
              </span>
              <span className={`${CELL} ${border}`}>
                {s.ram !== null ? `${s.ram}%` : "—"}
              </span>
              <span className={`${CELL} ${border}`}>
                {s.diskUsedGb}/{s.diskTotalGb}GB
              </span>
              <span className={`${CELL} ${border} text-ink-3`}>{s.lastSeen}</span>
              <span className={`${CELL} ${border} flex gap-3`}>
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
            </Fragment>
          );
        })}
      </div>
    </Container>
  );
};

import { Container } from "@/ui/Container";
import type { ServerStat } from "../useDashboard";

export const DiskUsageChart = ({ servers }: { servers: ServerStat[] }) => {
  const used = servers.reduce((sum, s) => sum + s.diskUsedGb, 0);
  const total = servers.reduce((sum, s) => sum + s.diskTotalGb, 0);
  const pct = total ? Math.round((used / total) * 100) : 0;

  const r = 40;
  const c = 2 * Math.PI * r;

  return (
    <Container className="sm:col-span-4">
      <p className="mb-4 text-[17px]">disk usage</p>

      <div className="flex items-center gap-6">
        <svg viewBox="0 0 100 100" className="h-36 w-36 shrink-0 -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--hair)" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="10"
            strokeDasharray={c}
            strokeDashoffset={c - (pct / 100) * c}
            strokeLinecap="round"
          />
        </svg>

        <div className="flex flex-1 flex-col gap-4">
          <div>
            <p className="text-[22px]">{pct}%</p>
            <p className="text-[15px] text-ink-3">
              {used.toFixed(1)} / {total} GB
            </p>
          </div>

          <ul className="flex flex-col gap-2">
            {servers.map((s) => {
              const p = s.diskTotalGb ? Math.round((s.diskUsedGb / s.diskTotalGb) * 100) : 0;
              return (
                <li key={s.id} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 truncate text-[13px] text-ink-3">{s.name}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-hair">
                    <span className="block h-full rounded-full bg-ink" style={{ width: `${p}%` }} />
                  </span>
                  <span className="w-9 shrink-0 text-right text-[13px] text-ink-3">{p}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Container>
  );
};

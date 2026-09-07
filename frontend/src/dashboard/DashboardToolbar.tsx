import type { TimeRange } from "./useDashboard";

const RANGES: TimeRange[] = ["1h", "24h", "7d", "30d"];

const PILL =
  "rounded-md border border-line px-3 py-1.5 text-[15px] transition-colors";
const REST = "text-ink-3 hover:text-ink";
const ON = "border-ink bg-ink text-on-fill";

interface DashboardToolbarProps {
  servers: { id: string; name: string }[];
  serverFilter: string;
  onServerFilterChange: (id: string) => void;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

export const DashboardToolbar = ({
  servers,
  serverFilter,
  onServerFilterChange,
  range,
  onRangeChange,
}: DashboardToolbarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-raise px-4 py-3">
      <select
        value={serverFilter}
        onChange={(e) => onServerFilterChange(e.target.value)}
        className="rounded-md border border-line bg-transparent px-3 py-1.5 text-[15px] text-ink"
      >
        <option value="all">server: all</option>
        {servers.map((s) => (
          <option key={s.id} value={s.id}>
            server: {s.name}
          </option>
        ))}
      </select>

      <div className="flex gap-1">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onRangeChange(r)}
            className={`${PILL} ${r === range ? ON : REST}`}
          >
            {r}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="ml-auto rounded-md border border-line px-3 py-1.5 text-[15px] text-ink-3 transition-colors hover:text-ink"
      >
        + add server
      </button>
    </div>
  );
};

export default DashboardToolbar;

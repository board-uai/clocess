import { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const corner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onDown = (e: PointerEvent) => {
      if (!corner.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selectedLabel =
    serverFilter === "all"
      ? "server: all"
      : `server: ${servers.find((s) => s.id === serverFilter)?.name ?? serverFilter}`;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-raise px-4 py-3">
      <div ref={corner} className="relative">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((was) => !was)}
          className="rounded-md border border-line px-3 py-1.5 text-[15px] text-ink transition-colors hover:bg-hair"
        >
          {selectedLabel}
        </button>

        {open && (
          <ul className="absolute top-full left-0 z-20 mt-1 w-40 overflow-hidden rounded-md border border-line bg-raise py-1 shadow-lg">
            <li>
              <button
                type="button"
                onClick={() => {
                  onServerFilterChange("all");
                  setOpen(false);
                }}
                className={`block w-full px-3 py-1.5 text-left text-[15px] transition-colors hover:bg-hair ${
                  serverFilter === "all" ? "text-ink" : "text-ink-3"
                }`}
              >
                server: all
              </button>
            </li>
            {servers.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    onServerFilterChange(s.id);
                    setOpen(false);
                  }}
                  className={`block w-full px-3 py-1.5 text-left text-[15px] transition-colors hover:bg-hair ${
                    serverFilter === s.id ? "text-ink" : "text-ink-3"
                  }`}
                >
                  server: {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

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

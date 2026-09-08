import { useMemo, useState } from "react";
import {
  FilterFunnel01,
  RefreshCcw01,
  Copy01,
  Expand01,
  SearchSm,
} from "@untitledui/icons";
import { Container } from "@/ui/Container";
import type { AlertEntry } from "./useDashboard";

// same fixed dark palette as ActivityLog — a terminal panel stays dark
// regardless of the app's light/dark theme
const TOOL_BTN =
  "rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200";
const CHIP = "rounded-md bg-zinc-900 px-2 py-1 text-zinc-200";

export const Alerts = ({ alerts }: { alerts: AlertEntry[] }) => {
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState(100);

  const filtered = useMemo(
    () =>
      alerts
        .filter((a) => a.message.toLowerCase().includes(query.toLowerCase()))
        .slice(0, lines),
    [alerts, query, lines],
  );

  const copyAlerts = () => {
    const text = filtered.map((a) => a.message).join("\n");
    void navigator.clipboard.writeText(text);
  };

  return (
    <Container className="sm:col-span-6 border-red-500/40! bg-zinc-950! p-0! font-mark text-zinc-300">
      <p className="px-6 py-4 text-[15px] text-red-500">alerts</p>

      <div className="flex items-center gap-2 border-t border-zinc-800 px-6 py-2">
        <button type="button" title="filter" className={TOOL_BTN}>
          <FilterFunnel01 aria-hidden="true" className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="clear search"
          onClick={() => setQuery("")}
          className={TOOL_BTN}
        >
          <RefreshCcw01 aria-hidden="true" className="h-4 w-4" />
        </button>
        <button type="button" title="copy" onClick={copyAlerts} className={TOOL_BTN}>
          <Copy01 aria-hidden="true" className="h-4 w-4" />
        </button>
        <button type="button" title="expand" className={TOOL_BTN}>
          <Expand01 aria-hidden="true" className="h-4 w-4" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <div className={`flex items-center gap-1.5 ${CHIP}`}>
            <SearchSm aria-hidden="true" className="h-4 w-4 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="find in alerts"
              className="w-32 bg-transparent text-[13px] text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-1.5 text-[13px] text-zinc-500">
            lines
            <input
              type="number"
              min={1}
              value={lines}
              onChange={(e) => setLines(Number(e.target.value) || 1)}
              className={`w-14 ${CHIP} focus:outline-none`}
            />
          </label>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 px-6 py-4 text-[13px]">
        {filtered.map((a) => (
          <li key={a.id} className="flex gap-2 text-red-500">
            <span className="text-red-500/60">&gt;</span>
            <span>{a.message}</span>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="flex gap-2 text-zinc-600">
            <span>&gt;</span>
            <span>no matching alerts</span>
          </li>
        )}
      </ul>
    </Container>
  );
};

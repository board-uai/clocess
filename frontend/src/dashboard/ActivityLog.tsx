import { useMemo, useState } from "react";
import {
  FilterFunnel01,
  RefreshCcw01,
  Copy01,
  Expand01,
  SearchSm,
} from "@untitledui/icons";
import { Container } from "@/ui/Container";
import type { ActivityEntry } from "./useDashboard";

// fixed dark palette, deliberately NOT the fill/on-fill tokens — a terminal
// panel should stay dark even when the rest of the app is in light mode
const TOOL_BTN =
  "rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200";
const CHIP = "rounded-md bg-zinc-900 px-2 py-1 text-zinc-200";

export const ActivityLog = ({ entries }: { entries: ActivityEntry[] }) => {
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState(100);

  const filtered = useMemo(
    () =>
      entries
        .filter((e) => e.message.toLowerCase().includes(query.toLowerCase()))
        .slice(0, lines),
    [entries, query, lines],
  );

  const copyLogs = () => {
    const text = filtered.map((e) => `${e.time} ${e.message}`).join("\n");
    void navigator.clipboard.writeText(text);
  };

  return (
    <Container className="sm:col-span-6 bg-zinc-950! p-0! font-mark text-zinc-300">
      <p className="px-6 py-4 text-[15px] text-zinc-200">activity log</p>

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
        <button type="button" title="copy" onClick={copyLogs} className={TOOL_BTN}>
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
              placeholder="find in logs"
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
        {filtered.map((e) => (
          <li key={e.id} className="flex gap-2">
            <span className="text-zinc-500">&gt;</span>
            <span className="text-zinc-500">{e.time}</span>
            <span>{e.message}</span>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-zinc-600">no matching log lines</li>
        )}
      </ul>
    </Container>
  );
};

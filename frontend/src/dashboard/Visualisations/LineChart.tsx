import { useState } from "react";
import { Container } from "@/ui/Container";
import type { TimeSeriesPoint } from "../useDashboard";

interface LineChartProps {
  label: string;
  data: TimeSeriesPoint[];
}

const W = 300;
const H = 150;
const PAD_LEFT = 26;
const PAD_RIGHT = 8;
const PAD_TOP = 10;
const PAD_BOTTOM = 18;
const PLOT_W = W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = H - PAD_TOP - PAD_BOTTOM;
const TICKS = 4;
const MAX_X_LABELS = 6;

export const LineChart = ({ label, data }: LineChartProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const latest = data.at(-1)?.value ?? 0;

  const maxValue = Math.max(...data.map((p) => p.value), 0);
  const niceMax = Math.max(Math.ceil((maxValue + 1) / 10) * 10, 10);
  const tickValues = Array.from({ length: TICKS + 1 }, (_, i) =>
    Math.round((niceMax / TICKS) * i),
  );

  const xFor = (i: number) =>
    PAD_LEFT + (i / Math.max(data.length - 1, 1)) * PLOT_W;
  const yFor = (value: number) => PAD_TOP + PLOT_H - (value / niceMax) * PLOT_H;

  const points = data.map((p, i) => `${xFor(i)},${yFor(p.value)}`).join(" ");
  const xLabelStep = Math.max(1, Math.ceil(data.length / MAX_X_LABELS));
  const hoveredPoint = hovered !== null ? data[hovered] : null;

  return (
    <Container className="sm:col-span-4 p-6!">
      <div className="mb-3 flex items-baseline justify-between gap-6">
        <p className="text-[17px]">{label}</p>
        <p className="text-[15px] text-ink-3">{latest}%</p>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {tickValues.map((v) => {
            const y = yFor(v);
            return (
              <g key={v}>
                <line
                  x1={PAD_LEFT}
                  x2={W - PAD_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="var(--hair)"
                  strokeWidth="1"
                />
                <text
                  x={PAD_LEFT - 6}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="8"
                  fill="var(--ink-3)"
                >
                  {v}
                </text>
              </g>
            );
          })}

          <polyline
            points={points}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />

          {data.map((p, i) => (
            <circle
              key={i}
              cx={xFor(i)}
              cy={yFor(p.value)}
              r={hovered === i ? 3.5 : 2}
              fill="var(--ink)"
              className="transition-[r]"
            />
          ))}

          {/* wider invisible hit targets, the visible dots above are too small to hover reliably */}
          {data.map((p, i) => (
            <circle
              key={`hit-${i}`}
              cx={xFor(i)}
              cy={yFor(p.value)}
              r={8}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((was) => (was === i ? null : was))}
            />
          ))}

          {data.map((p, i) =>
            i % xLabelStep === 0 ? (
              <text
                key={i}
                x={xFor(i)}
                y={H - 4}
                textAnchor="middle"
                fontSize="8"
                fill="var(--ink-3)"
              >
                {p.axisLabel}
              </text>
            ) : null,
          )}
        </svg>

        {hoveredPoint && hovered !== null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-md bg-fill px-2 py-1 text-[12px] whitespace-nowrap text-on-fill"
            style={{
              left: `${(xFor(hovered) / W) * 100}%`,
              top: `${(yFor(hoveredPoint.value) / H) * 100}%`,
            }}
          >
            {hoveredPoint.fullLabel} · {hoveredPoint.value}%
          </div>
        )}
      </div>
    </Container>
  );
};

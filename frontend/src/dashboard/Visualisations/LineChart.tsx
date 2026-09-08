import { useState } from "react";
import { Container } from "@/ui/Container";
import type { ServerSeries } from "../useDashboard";

interface LineChartProps {
  label: string;
  series: ServerSeries[];
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

// a small qualitative palette for overlaying multiple servers — the one
// deliberate exception to this app's monochrome tokens, same precedent as
// the red-500 alert accent
const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"];

export const LineChart = ({ label, series }: LineChartProps) => {
  const [hovered, setHovered] = useState<{ series: number; point: number } | null>(
    null,
  );
  const [active, setActive] = useState(0);
  const activeIndex = Math.min(active, Math.max(series.length - 1, 0));

  const isMulti = series.length > 1;
  // draw the active line last so it always sits on top of the faded ones
  const drawOrder = series
    .map((_, i) => i)
    .sort((a, b) => (a === activeIndex ? 1 : b === activeIndex ? -1 : 0));
  const latest = series.length === 1 ? series[0].points.at(-1)?.value : undefined;

  const allValues = series.flatMap((s) => s.points.map((p) => p.value));
  const maxValue = Math.max(...allValues, 0);
  const niceMax = Math.max(Math.ceil((maxValue + 1) / 10) * 10, 10);
  const tickValues = Array.from({ length: TICKS + 1 }, (_, i) =>
    Math.round((niceMax / TICKS) * i),
  );

  const pointCount = series[0]?.points.length ?? 1;
  const xFor = (i: number) => PAD_LEFT + (i / Math.max(pointCount - 1, 1)) * PLOT_W;
  const yFor = (value: number) => PAD_TOP + PLOT_H - (value / niceMax) * PLOT_H;
  const xLabelStep = Math.max(1, Math.ceil(pointCount / MAX_X_LABELS));
  const xAxisPoints = series[0]?.points ?? [];

  const hoveredPoint =
    hovered !== null ? series[hovered.series]?.points[hovered.point] : null;
  const hoveredName = hovered !== null ? series[hovered.series]?.name : null;

  return (
    <Container className="sm:col-span-4 p-6!">
      <div className="mb-1 flex items-baseline justify-between gap-6">
        <div>
          <p className="text-[17px]">{label}</p>
          {!isMulti && series.length === 1 && (
            <p className="text-[13px] text-ink-3">{series[0].name}</p>
          )}
        </div>
        {latest !== undefined && (
          <p className="text-[15px] text-ink-3">{latest}%</p>
        )}
      </div>

      {isMulti && (
        <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1">
          {series.map((s, i) => (
            <button
              key={s.serverId}
              type="button"
              onClick={() => setActive(i)}
              className={`flex items-center gap-1.5 text-[12px] transition-opacity ${
                i === activeIndex ? "text-ink" : "text-ink-3 opacity-50 hover:opacity-100"
              }`}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              {s.name}
            </button>
          ))}
        </div>
      )}

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

          {drawOrder.map((si) => {
            const s = series[si];
            const color = isMulti ? COLORS[si % COLORS.length] : "var(--ink)";
            const faded = isMulti && si !== activeIndex;
            const opacity = faded ? 0.2 : 1;
            const points = s.points
              .map((p, i) => `${xFor(i)},${yFor(p.value)}`)
              .join(" ");
            return (
              <g key={s.serverId} className="transition-opacity" opacity={opacity}>
                <polyline
                  points={points}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
                {/* wider invisible stroke, the visible 1.5px line is too thin to click reliably */}
                {isMulti && (
                  <polyline
                    points={points}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="10"
                    vectorEffect="non-scaling-stroke"
                    className="cursor-pointer"
                    onClick={() => setActive(si)}
                  />
                )}
                {s.points.map((p, i) => (
                  <circle
                    key={i}
                    cx={xFor(i)}
                    cy={yFor(p.value)}
                    r={hovered?.series === si && hovered.point === i ? 3.5 : 2}
                    fill={color}
                    className="transition-[r]"
                  />
                ))}
                {s.points.map((p, i) => (
                  <circle
                    key={`hit-${i}`}
                    cx={xFor(i)}
                    cy={yFor(p.value)}
                    r={7}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => setActive(si)}
                    onMouseEnter={() => setHovered({ series: si, point: i })}
                    onMouseLeave={() =>
                      setHovered((was) =>
                        was?.series === si && was.point === i ? null : was,
                      )
                    }
                  />
                ))}
              </g>
            );
          })}

          {xAxisPoints.map((p, i) =>
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
              left: `${(xFor(hovered.point) / W) * 100}%`,
              top: `${(yFor(hoveredPoint.value) / H) * 100}%`,
            }}
          >
            {isMulti && hoveredName ? `${hoveredName} · ` : ""}
            {hoveredPoint.fullLabel} · {hoveredPoint.value}%
          </div>
        )}
      </div>
    </Container>
  );
};

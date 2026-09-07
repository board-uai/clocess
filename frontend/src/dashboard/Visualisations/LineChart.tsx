import { Container } from "@/ui/Container";
import type { TimeSeriesPoint } from "../useDashboard";

interface LineChartProps {
  label: string;
  data: TimeSeriesPoint[];
}

export const LineChart = ({ label, data }: LineChartProps) => {
  const w = 100;
  const h = 40;
  const latest = data.at(-1)?.value ?? 0;

  const points = data
    .map(
      (p, i) =>
        `${(i / Math.max(data.length - 1, 1)) * w},${h - (p.value / 100) * h}`,
    )
    .join(" ");

  return (
    <Container className="sm:col-span-4">
      <div className="mb-4 flex items-baseline justify-between gap-6">
        <p className="text-[17px]">{label}</p>
        <p className="text-[15px] text-ink-3">{latest}%</p>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="h-24 w-full"
      >
        <polyline
          points={points}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </Container>
  );
};

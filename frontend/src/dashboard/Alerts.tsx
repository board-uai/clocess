import { Container } from "@/ui/Container";
import type { AlertEntry } from "./useDashboard";

export const Alerts = ({ alerts }: { alerts: AlertEntry[] }) => {
  return (
    <Container className="sm:col-span-6 border-red-500/40 bg-fill p-6! font-mark text-on-fill">
      <p className="mb-4 text-[15px] text-red-500">alerts</p>
      <ul className="flex flex-col gap-1.5 text-[13px]">
        {alerts.map((a) => (
          <li key={a.id} className="flex gap-2 text-red-500">
            <span className="text-red-500/60">&gt;</span>
            <span>{a.message}</span>
          </li>
        ))}
        {alerts.length === 0 && (
          <li className="flex gap-2 text-on-fill/50">
            <span>&gt;</span>
            <span>no active alerts</span>
          </li>
        )}
      </ul>
    </Container>
  );
};

import { Container } from "@/ui/Container";
import type { AlertEntry } from "./useDashboard";

export const Alerts = ({ alerts }: { alerts: AlertEntry[] }) => {
  return (
    <Container className="border-red-500/40 sm:col-span-6">
      <p className="mb-4 text-[17px] text-red-500">alerts</p>
      <ul className="flex flex-col gap-2">
        {alerts.map((a) => (
          <li key={a.id} className="text-[15px] text-red-500">
            {a.message}
          </li>
        ))}
        {alerts.length === 0 && (
          <li className="text-[15px] text-ink-3">no active alerts</li>
        )}
      </ul>
    </Container>
  );
};

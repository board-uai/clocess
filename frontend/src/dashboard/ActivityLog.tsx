import { Container } from "@/ui/Container";
import type { ActivityEntry } from "./useDashboard";

export const ActivityLog = ({ entries }: { entries: ActivityEntry[] }) => {
  return (
    <Container className="sm:col-span-6">
      <p className="mb-4 text-[17px]">activity log</p>
      <ul className="flex flex-col gap-2">
        {entries.map((e) => (
          <li key={e.id} className="flex gap-3 text-[15px]">
            <span className="text-ink-3">{e.time}</span>
            <span>{e.message}</span>
          </li>
        ))}
      </ul>
    </Container>
  );
};

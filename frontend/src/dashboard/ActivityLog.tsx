import { Container } from "@/ui/Container";
import type { ActivityEntry } from "./useDashboard";

export const ActivityLog = ({ entries }: { entries: ActivityEntry[] }) => {
  return (
    <Container className="sm:col-span-6 bg-fill p-6! font-mark text-on-fill">
      <p className="mb-4 text-[15px] text-on-fill/60">activity log</p>
      <ul className="flex flex-col gap-1.5 text-[13px]">
        {entries.map((e) => (
          <li key={e.id} className="flex gap-2">
            <span className="text-on-fill/50">&gt;</span>
            <span className="text-on-fill/50">{e.time}</span>
            <span>{e.message}</span>
          </li>
        ))}
      </ul>
    </Container>
  );
};

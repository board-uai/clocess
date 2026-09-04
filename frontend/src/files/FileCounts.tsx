import { Container } from '@/ui/Container'
import type { FileRecord } from '@/lib/api'

const KINDS = ['image', 'video', 'audio', 'document', 'other']

export function FileCounts({ files }: { files: FileRecord[] }) {
  return (
    <Container className="min-h-44">
      <p className="mb-4 text-[15px] text-ink-3">stored</p>

      <dl className="space-y-1">
        {KINDS.map((kind) => (
          <div key={kind} className="flex items-baseline justify-between gap-6">
            <dt className="text-[15px] text-ink-3">{kind}</dt>
            <dd>{files.filter((f) => f.file_type === kind).length}</dd>
          </div>
        ))}
      </dl>
    </Container>
  )
}

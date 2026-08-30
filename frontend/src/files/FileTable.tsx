import { Container } from '@/ui/Container'
import { downloadUrl } from '@/lib/api'
import type { FileRecord } from '@/lib/api'
import type { FilesStatus } from './useFiles'

const ROW = 'flex items-center gap-4 border-b border-hair py-3 last:border-0'
const ACTION = 'text-[15px] text-ink-3 transition-colors hover:text-ink'

interface FileTableProps {
  files: FileRecord[]
  status: FilesStatus
  error: string | null
  busy: boolean
  onDelete: (id: number) => void
}

export function FileTable({ files, status, error, busy, onDelete }: FileTableProps) {
  return (
    <Container className="min-h-72 sm:col-span-2">
      <div className="mb-4 flex items-baseline justify-between gap-6">
        <p className="text-[17px]">files</p>
        <p className="text-[15px] text-ink-3">{files.length}</p>
      </div>

      {status === 'loading' && <p className="text-[15px] text-ink-3">loading</p>}

      {status === 'ready' && files.length === 0 && (
        <p className="text-[15px] text-ink-3">nothing up here yet</p>
      )}

      <ul>
        {files.map((file) => (
          <li key={file.id} className={ROW}>
            <span className="min-w-0 flex-1 truncate">{file.filename}</span>
            <span className="hidden text-[15px] text-ink-3 sm:block">{file.file_type}</span>

            <a href={downloadUrl(file.id)} download className={ACTION}>
              download
            </a>

            <button type="button" disabled={busy} onClick={() => onDelete(file.id)} className={ACTION}>
              delete
            </button>
          </li>
        ))}
      </ul>

      {error && <p className="mt-4 text-[15px] text-ink-3">{error}</p>}
    </Container>
  )
}

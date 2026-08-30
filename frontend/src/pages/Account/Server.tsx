import { useState } from 'react'
import { Container } from '@/components/ui/Container'
import { useFiles } from '@/hooks/useFiles'
import { downloadUrl } from '@/lib/api'
import type { FileRecord } from '@/lib/api'

const KINDS = ['image', 'video', 'audio', 'document', 'other']

const ROW = 'flex items-center gap-4 border-b border-hair py-3 last:border-0'
const ACTION = 'text-[15px] text-ink-3 transition-colors hover:text-ink'

function countBy(files: FileRecord[], kind: string) {
  return files.filter((f) => f.file_type === kind).length
}

export function Server() {
  const { files, status, error, busy, upload, remove } = useFiles()
  const [over, setOver] = useState(false)

  return (
    <section className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
      <Container
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          void upload(e.dataTransfer.files)
        }}
        className={`flex min-h-44 flex-col items-center justify-center gap-3 text-center transition-colors ${
          over ? 'ring-2 ring-ink' : ''
        }`}
      >
        <p className="text-[17px]">{busy ? 'uploading' : 'drop files here'}</p>

        <label className="cursor-pointer text-[15px] text-ink-3 transition-colors hover:text-ink">
          or pick from your machine
          <input
            type="file"
            multiple
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              void upload(e.target.files)
              e.target.value = '' // the same file twice still counts as a change
            }}
          />
        </label>
      </Container>

      <Container className="min-h-44">
        <p className="mb-4 text-[15px] text-ink-3">stored</p>

        <dl className="space-y-1">
          {KINDS.map((kind) => (
            <div key={kind} className="flex items-baseline justify-between gap-6">
              <dt className="text-[15px] text-ink-3">{kind}</dt>
              <dd>{countBy(files, kind)}</dd>
            </div>
          ))}
        </dl>
      </Container>

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

              <button type="button" disabled={busy} onClick={() => void remove(file.id)} className={ACTION}>
                delete
              </button>
            </li>
          ))}
        </ul>

        {error && <p className="mt-4 text-[15px] text-ink-3">{error}</p>}
      </Container>
    </section>
  )
}

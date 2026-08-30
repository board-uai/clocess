import { FileCounts, FileTable, UploadDrop, useFiles } from '@/files'

export function Server() {
  const { files, status, error, busy, upload, remove } = useFiles()

  return (
    <section className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
      <UploadDrop busy={busy} onPick={(picked) => void upload(picked)} />
      <FileCounts files={files} />

      <FileTable
        files={files}
        status={status}
        error={error}
        busy={busy}
        onDelete={(id) => void remove(id)}
      />
    </section>
  )
}

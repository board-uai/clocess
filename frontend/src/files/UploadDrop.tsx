import { useState } from 'react'
import { Container } from '@/ui/Container'

interface UploadDropProps {
  busy: boolean
  onPick: (files: FileList | null) => void
}

export function UploadDrop({ busy, onPick }: UploadDropProps) {
  const [over, setOver] = useState(false)

  return (
    <Container
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        onPick(e.dataTransfer.files)
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
            onPick(e.target.files)
            e.target.value = '' // the same file twice still counts as a change
          }}
        />
      </label>
    </Container>
  )
}

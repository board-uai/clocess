import type { ReactNode } from 'react'

/** the big title every docs page opens with, and the line under it */
export function DocsHeader({ title, children }: { title: string; children: ReactNode }) {
  return (
    <header>
      <h1 className="text-[clamp(56px,10vw,120px)] leading-none font-light tracking-[-0.03em] text-ink">
        {title}
      </h1>
      <p className="mt-6 max-w-[52ch] text-[clamp(15px,1.6vw,19px)] text-ink-2">{children}</p>
    </header>
  )
}

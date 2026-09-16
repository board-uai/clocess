import type { ReactNode } from 'react'
import { Container } from '@/ui/Container'

/** the mono caption every settings card opens with */
export const PANEL_TITLE = 'font-mono text-[15px] text-ink-3'

export const PANEL = 'rounded-2xl! p-6! sm:p-9!'

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Container className={PANEL}>
      <h2 className={`mb-6 ${PANEL_TITLE}`}>{title}</h2>
      {children}
    </Container>
  )
}

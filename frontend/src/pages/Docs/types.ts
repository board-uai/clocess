import type { ComponentType } from 'react'

export interface DocPage {
  slug: string
  title: string
  /** pages without a body are listed but not written yet */
  Body?: ComponentType
}

export interface DocGroup {
  title: string
  pages: DocPage[]
}

export const findPage = (groups: DocGroup[], slug: string) =>
  groups.flatMap((group) => group.pages).find((page) => page.slug === slug)

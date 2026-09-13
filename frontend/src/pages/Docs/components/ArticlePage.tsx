import { Navigate, useParams } from 'react-router-dom'
import { DocsSidebar } from './DocsSidebar'
import { findPage } from '../types'
import type { DocGroup } from '../types'

interface ArticlePageProps {
  /** names the sidebar for screen readers */
  label: string
  groups: DocGroup[]
  basePath: string
}

/** sidebar on the left, the chosen page on the right. the first page is the default */
export function ArticlePage({ label, groups, basePath }: ArticlePageProps) {
  const { slug = groups[0].pages[0].slug } = useParams()
  const page = findPage(groups, slug)

  if (!page) return <Navigate to={basePath} replace />

  const { title, Body } = page

  return (
    <div className="grid gap-14 md:grid-cols-[260px_minmax(0,1fr)] lg:gap-28">
      <aside className="md:sticky md:top-10 md:self-start">
        <DocsSidebar label={label} groups={groups} basePath={basePath} slug={slug} />
      </aside>

      <article className="max-w-[820px] space-y-8 text-[18px] leading-8 text-ink-2">
        <h1 className="text-[clamp(40px,5vw,64px)] leading-tight font-light tracking-[-0.02em] text-ink">
          {title}
        </h1>
        {Body && <Body />}
      </article>
    </div>
  )
}

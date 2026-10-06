import { ArticlePage } from './parts/ArticlePage'
import { DOCUMENTATION } from './documentation/pages'

export function Documentation() {
  return <ArticlePage label="Documentation" groups={DOCUMENTATION} basePath="/docs/documentation" />
}

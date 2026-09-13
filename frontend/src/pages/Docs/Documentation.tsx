import { ArticlePage } from './components/ArticlePage'
import { DOCUMENTATION } from './documentation/pages'

export function Documentation() {
  return <ArticlePage label="Documentation" groups={DOCUMENTATION} basePath="/docs/documentation" />
}

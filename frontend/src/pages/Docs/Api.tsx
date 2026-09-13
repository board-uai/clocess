import { ArticlePage } from './components/ArticlePage'
import { API } from './api/pages'

export function Api() {
  return <ArticlePage label="API" groups={API} basePath="/docs/api" />
}

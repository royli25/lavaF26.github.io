import { Panel } from './components'
import { Button } from './components/ui/button'
import './missing-searches.css'

// Sample opportunities from the updated Figma card (192:58076).
export const missingSearches = [
  { query: 'USC student startup accelerators' },
  { query: 'Entrepreneurship clubs at USC' },
  { query: 'Venture capital programs for students' },
]

export function MissingSearchesCard({ onViewAll, onImplement }: { onViewAll: () => void; onImplement: () => void }) {
  return <Panel title="Missing Searches" titleIcon="missing-search" className="missing-searches-panel" action={<Button variant="ghost" className="app-button text-button" onClick={onViewAll}>View all <span aria-hidden="true">↗</span></Button>}>
    <ol className="missing-searches-list">
      {missingSearches.map(({ query }, index) => <li className="missing-search-row opportunity-card" key={query}>
        <span className="opportunity-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span className="missing-search-query">{query}</span>
      </li>)}
    </ol>
    <Button className="app-button insight-action-button missing-search-implement" onClick={onImplement}>Implement <span aria-hidden="true">→</span></Button>
  </Panel>
}

import { Panel } from './components'
import { Badge } from './components/ui/badge'
import { appearanceQueries, opportunities, type Query } from './data'
import './opportunities.css'

export function OpportunitiesPage({ queries }: { queries: Query[] }) {
  const worstQueries = [...queries, ...appearanceQueries.filter(query => !queries.some(tracked => tracked.id === query.id || tracked.text.toLowerCase() === query.text.toLowerCase()))]
    .filter((query): query is Query & { rate: number } => query.rate !== null)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 8)

  return <div className="opportunities-layout">
    <div className="opportunities-card-grid">
      {opportunities.map((opportunity, index) => <Panel key={opportunity.id} title={opportunity.title} className="opportunities-work-card">
        <div className="opportunities-card-meta"><Badge className="badge warm-badge">{opportunity.impact}</Badge><span>{opportunity.count}</span></div>
        <p className="opportunities-description">{opportunity.description}</p>
        <div className="opportunities-recommendation"><span className="opportunities-step">{String(index + 1).padStart(2, '0')} · Recommended action</span><p>{opportunity.action}</p></div>
        <div className="opportunities-related"><span>Related queries</span>{opportunity.queries.map(query => <p key={query}>{query}</p>)}</div>
      </Panel>)}
    </div>
    <Panel title="Worst-performing queries" titleIcon="soft-search" className="opportunities-worst-panel">
      <p className="opportunities-panel-note">Lowest appearance rates across your tracked queries.</p>
      <div className="opportunities-ranking-labels"><span>Search query</span><span>Appearance</span></div>
      <ol className="opportunities-ranking">{worstQueries.map(query => <li key={query.id}>
        <div className="opportunities-query-copy"><h3>{query.text}</h3>{query.losingTo && <p>Behind {query.losingTo}</p>}</div>
        <span className="opportunities-query-rate">{query.rate}%</span>
      </li>)}</ol>
    </Panel>
  </div>
}

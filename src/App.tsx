import { ModelPanel } from './ModelPanel'
import { LockKeyhole } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { Icon, Panel, DashboardSelect } from './components'
import { comingSoonPages, activities, competitors, downloadCsv, initialQueries, loadSavedQueries, models, months, opportunities, periodMetrics, validateQueries, type Model, type Page, type Period, type Query } from './data'

import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Label } from './components/ui/label'
import { Checkbox } from './components/ui/checkbox'
import { Progress } from './components/ui/progress'
import { Skeleton } from './components/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from './components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs'
import { SidebarProvider, useSidebar } from './components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { toast } from 'sonner'

type ModalState = { type: 'queries' } | { type: 'opportunity'; id: string } | { type: 'activity'; id: number } | { type: 'competitor'; name: string } | { type: 'plan' } | null
const pageTitles: Record<Page, string> = { Overview: 'Your visibility at a glance', Appearance: 'Search appearance', 'Search activity': 'Search activity', Opportunities: 'Your next opportunities', Competitors: 'The competitive landscape', Reports: 'Your visibility reports', Settings: 'Workspace settings' }

function ViewAll({ onClick }: { onClick: () => void }) {
  return <Button variant="ghost" className="app-button text-button" onClick={onClick}>View all <span aria-hidden="true">↗</span></Button>
}

const Chart = lazy(() => import('./AppearanceChart'))
const AppearanceExplorer = lazy(() => import('./AppearanceExplorer'))
function AppearanceChart() {
  return <Suspense fallback={<Panel title="Search appearances" titleIcon="soft-search" className="chart-panel"><Skeleton className="h-56 w-full" aria-label="Loading chart" /></Panel>}><Chart /></Suspense>
}


function CompetitorMark({ name }: { name: string }) {
  return <span className={`competitor-mark ${name === 'Acme' ? 'own-brand' : ''}`}>{name === 'Acme' ? <Icon name="imgIconSpark3" /> : <img className={`competitor-logo ${name !== 'Monday' ? 'logo-monochrome' : ''}`} src={`/assets/logos/${name.toLowerCase()}.svg`} alt="" width="19" height="19" />}</span>
}

function App() {
  const fromHash = (): Page => {
    try { const value = decodeURIComponent(window.location.hash.slice(1)); return Object.keys(pageTitles).includes(value) ? value as Page : 'Overview' } catch { return 'Overview' }
  }
  const [page, setPage] = useState<Page>(fromHash)
  const [period, setPeriod] = useState<Period>('28')
  const [modal, setModalState] = useState<ModalState>(null)
  const modalOpener = useRef<HTMLElement | null>(null)
  function setModal(next: ModalState) {
    if (next && !modal) modalOpener.current = document.activeElement as HTMLElement | null
    setModalState(next)
  }
  const [savedQueries, setSavedQueries] = useState<Query[]>(loadSavedQueries)
  const [queryInput, setQueryInput] = useState('')
  const [queryModels, setQueryModels] = useState<Model[]>(models.map(m => m.name))
  const [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')
  const [modelFilter, setModelFilter] = useState('All models')
  const { setOpenMobile, toggleSidebar } = useSidebar()
  const [activityFilter, setActivityFilter] = useState('All activity')
  const [planned, setPlanned] = useState<string[]>(() => { try { const value = JSON.parse(localStorage.getItem('lava-planned-v1') || '[]'); return Array.isArray(value) ? value.filter((v: unknown) => typeof v === 'string') : [] } catch { return [] } })
  const queries = [...savedQueries, ...initialQueries]
  const isComingSoon = comingSoonPages.includes(page)
  const trackedCount = 128 + savedQueries.length
  const metric = periodMetrics[period]

  useEffect(() => { const listener = () => setPage(fromHash()); window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener) }, [])
  useEffect(() => {
    document.title = `${page} · ArcRank`
    document.getElementById('main-content')?.scrollTo({ top: 0, left: 0 })
  }, [page])

  function navigate(next: Page) { setPage(next); window.location.hash = encodeURIComponent(next); setOpenMobile(false) }
  function openQueries() { setQueryInput(''); setFormError(''); setQueryModels(models.map(m => m.name)); setModal({ type: 'queries' }) }
  function selectModel(model: Model) { setModelFilter(model); navigate('Appearance') }
  function saveQueries(event: FormEvent) {
    event.preventDefault()
    const result = validateQueries(queryInput, queries.map(q => q.text), 200 - trackedCount)
    if (result.error) { setFormError(result.error); return }
    if (!queryModels.length) { setFormError('Select at least one search model.'); return }
    const added = result.queries.map(text => ({ id: crypto.randomUUID(), text, models: [...queryModels], rate: null }))
    try { localStorage.setItem('lava-queries-v1', JSON.stringify([...added, ...savedQueries])) } catch { setFormError('Your browser could not save these queries. Check storage permissions and try again.'); return }
    setSavedQueries([...added, ...savedQueries]); setModal(null); toast.success(`${added.length} ${added.length === 1 ? 'query' : 'queries'} saved to your demo workspace.`)
  }
  function togglePlan(id: string) {
    const next = planned.includes(id) ? planned.filter(p => p !== id) : [...planned, id]
    try { localStorage.setItem('lava-planned-v1', JSON.stringify(next)); setPlanned(next); toast.success(next.includes(id) ? 'Added to your action plan.' : 'Removed from your action plan.') } catch { toast.error('Could not save your plan. Check browser storage permissions.') }
  }
  function exportReport() {
    downloadCsv('arcrank-visibility-report.csv', [
      ['ArcRank sample visibility report', `Last ${period} days`],
      ['Metric', 'Value'], ['Visibility score', metric.score], ['Search appearances', metric.appearances], ['Share of voice', metric.share], ['Queries to improve', metric.opportunities],
      [], ['Month (2026)', 'Search appearances'], ...months.map(m => [m.full, m.appearances]),
      [], ['Competitor', 'Visibility score', 'Change'], ...competitors.map(c => [c.name, c.score, c.change]),
    ])
    toast.success('Your visibility report has been downloaded.')
  }

  const filteredQueries = queries.filter(q => q.text.toLowerCase().includes(search.toLowerCase()) && (modelFilter === 'All models' || q.models.includes(modelFilter as Model)))
  const filteredActivities = activities.filter(a => (activityFilter !== 'Your brand' || !a.competitor) && (activityFilter !== 'Competitors' || a.competitor) && (modelFilter === 'All models' || a.model === modelFilter))
  const selectedOpportunity = modal?.type === 'opportunity' ? opportunities.find(o => o.id === modal.id) : undefined
  const selectedActivity = modal?.type === 'activity' ? activities.find(a => a.id === modal.id) : undefined
  const selectedCompetitor = modal?.type === 'competitor' ? competitors.find(c => c.name === modal.name) : undefined

  const metrics = <div className="metrics-grid">{[
    { label: 'Visibility score', value: metric.score, change: metric.deltas[0] },
    { label: 'Search appearances', value: metric.appearances, change: metric.deltas[1] },
    { label: 'Share of voice', value: metric.share, change: metric.deltas[2] },
    { label: 'Queries to improve', value: metric.opportunities, change: '6 high-impact opportunities', warm: true },
  ].map(item => <Card className="metric-card" key={item.label}><span className="metric-label">{item.label}</span><div className="metric-value"><strong>{item.value}</strong><img src={`/assets/${item.warm ? 'imgTrend1' : 'imgTrend'}.svg`} width="70" height="28" alt="" /></div><div className={`metric-change ${item.warm ? 'warm-text' : ''}`}>{!item.warm && <span aria-hidden="true">↗ </span>}{item.change}{!item.warm && <span> vs. previous period</span>}</div></Card>)}</div>

  const queryTable = <Panel title="Tracked queries" className="query-panel" action={<Button variant="ghost" className="app-button text-button" onClick={openQueries}>Add queries <span aria-hidden="true">+</span></Button>}>
    <div className="table-toolbar"><Input type="search" aria-label="Search tracked queries" placeholder="Find a query" value={search} onChange={e => setSearch(e.target.value)} /><DashboardSelect label="Filter queries by model" value={modelFilter} onValueChange={setModelFilter} options={["All models", ...models.map(m => m.name)]} /></div>
    <div className="table-scroll"><Table><TableHeader><TableRow><TableHead>Search query</TableHead><TableHead>Models</TableHead><TableHead>Appearance</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{filteredQueries.map(q => <TableRow key={q.id}><TableCell>{q.text}</TableCell><TableCell className="muted">{q.models.join(' · ')}</TableCell><TableCell>{q.rate === null ? '—' : `${q.rate}%`}</TableCell><TableCell><Badge className={`badge ${q.rate === null ? 'neutral-badge' : 'warm-badge'}`}>{q.rate === null ? 'Saved locally' : 'Opportunity'}</Badge></TableCell></TableRow>)}</TableBody></Table></div>
    {!filteredQueries.length && <div className="empty-state"><h3>No matching queries</h3><Button variant="secondary" className="app-button button secondary" onClick={() => { setSearch(''); setModelFilter('All models') }}>Clear filters</Button></div>}
  </Panel>

  return <>
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById('main-content')?.focus() }}>Skip to dashboard</a>
    <AppSidebar page={page} navigate={navigate} />

    <main className={`main-content ${page === 'Overview' ? 'overview-dashboard' : ''} ${page === 'Overview' || page === 'Appearance' ? 'has-page-topline' : ''}`} id="main-content" tabIndex={-1}>
      {(page === 'Overview' || page === 'Appearance') && <div className="dashboard-topline">{page === 'Overview' ? 'Dashboard' : 'Appearance'}</div>}
      <header className="page-header"><div className="heading-group"><Button variant="ghost" className="app-button mobile-menu icon-button" onClick={toggleSidebar} aria-label="Open navigation"><Icon name="imgIconGrid" /></Button><h1>{pageTitles[page]}</h1></div>{!isComingSoon && <div className="header-actions">{page !== 'Settings' && <DashboardSelect className="date-select" label="Reporting period" value={period} onValueChange={value => setPeriod(value as Period)} options={[{ value: "7", label: "Last 7 days" }, { value: "28", label: "Last 28 days" }, { value: "90", label: "Last 90 days" }]} />}<Button className="app-button button primary" onClick={openQueries}><span className="button-plus" aria-hidden="true">+</span> Add queries</Button></div>}</header>

      {page === 'Overview' && <div className="page-layout">{metrics}<div className="analytics-grid"><AppearanceChart /><ModelPanel onSelect={selectModel} /></div><div className="insights-grid">
        <Panel title="Worth your attention" titleIcon="focus-pebble" className="opportunities-panel" action={<ViewAll onClick={() => navigate('Opportunities')} />}>
          <div className="opportunity-list">
            {opportunities.slice(0, 2).map((o, index) => <Button variant="ghost" className="app-button opportunity-card" key={o.id} onClick={() => setModal({ type: 'opportunity', id: o.id })}>
              <span className="opportunity-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <span>{o.title}</span>
            </Button>)}
          </div>
          <Button className="app-button opportunity-review" onClick={() => navigate('Opportunities')}>Review {Math.min(opportunities.length, 2)} actions <span aria-hidden="true">→</span></Button>
        </Panel>
        <Panel title="Competitors" titleIcon="friendly-rivals" className="competitors-panel" action={<ViewAll onClick={() => navigate('Competitors')} />}><div className="competitor-list">{competitors.map((c, i) => <Button variant="ghost" key={c.name} className="app-button competitor-row" onClick={() => setModal({ type: 'competitor', name: c.name })}><span className="rank">{String(i + 1).padStart(2, '0')}</span><CompetitorMark name={c.name} /><span className="competitor-name">{c.name}</span><strong>{c.score}</strong><span className={`competitor-change ${c.change.startsWith('−') ? 'warm-text' : ''}`}>{c.change}</span></Button>)}</div></Panel>
        <Panel title="Search activity" titleIcon="live-pulse" className="activity-panel" action={<ViewAll onClick={() => navigate('Search activity')} />}><div className="activity-list">{activities.slice(0, 3).map(a => <Button variant="ghost" className="app-button activity-row" key={a.id} onClick={() => setModal({ type: 'activity', id: a.id })}><span className={`event-icon ${a.competitor ? 'warm-icon' : ''}`}><Icon name={a.competitor ? 'imgIconUsers1' : 'imgIconSpark4'} /></span><span className="event-content"><strong>{a.title}</strong><span>{a.query}</span><time>{a.time}</time></span></Button>)}</div></Panel>
      </div></div>}

      {page === 'Appearance' && <Suspense fallback={<Skeleton className="h-56 w-full" aria-label="Loading appearance" />}><AppearanceExplorer queries={queries} period={period} initialModel={modelFilter} /></Suspense>}

      {isComingSoon && <section className="coming-soon-stage" aria-label={`${page} coming soon`}>
        <div className="coming-soon-preview" inert aria-hidden="true">
      {page === 'Search activity' && <Panel title="Latest activity" className="full-panel" action={<Badge className="badge neutral-badge">{filteredActivities.length} events</Badge>}><div className="table-toolbar"><Tabs value={activityFilter} onValueChange={setActivityFilter}><TabsList className="segmented-control" aria-label="Activity type">{['All activity', 'Your brand', 'Competitors'].map(f => <TabsTrigger key={f} value={f}>{f}</TabsTrigger>)}</TabsList></Tabs><DashboardSelect label="Filter activity by model" value={modelFilter} onValueChange={setModelFilter} options={["All models", ...models.map(m => m.name)]} /></div><div className="activity-feed">{filteredActivities.map(a => <Button variant="ghost" className="app-button feed-row" key={a.id} onClick={() => setModal({ type: 'activity', id: a.id })}><span className={`event-icon ${a.competitor ? 'warm-icon' : ''}`}><Icon name={a.competitor ? 'imgIconUsers1' : 'imgIconSpark4'} /></span><span className="event-content"><strong>{a.title}</strong><span>{a.query}</span></span><Badge className="badge neutral-badge">{a.model}</Badge><time>{a.time}</time><span aria-hidden="true">↗</span></Button>)}</div>{!filteredActivities.length && <div className="empty-state"><h3>No activity for these filters</h3><Button variant="secondary" className="app-button button secondary" onClick={() => { setActivityFilter('All activity'); setModelFilter('All models') }}>Clear filters</Button></div>}</Panel>}

      {page === 'Opportunities' && <div className="page-layout"><div className="opportunity-grid">{opportunities.map(o => <Panel title={o.title} key={o.id} className="opportunity-detail-card"><div className="opportunity-meta"><Badge className="badge warm-badge">{o.impact}</Badge><span>{o.count}</span></div><div className="opportunity-actions"><Button variant="secondary" className="app-button button secondary" onClick={() => setModal({ type: 'opportunity', id: o.id })}>Review opportunity <span aria-hidden="true">↗</span></Button><Button variant="ghost" className={`app-button save-button ${planned.includes(o.id) ? 'is-saved' : ''}`} aria-label={`${planned.includes(o.id) ? 'Remove' : 'Add'} ${o.title} ${planned.includes(o.id) ? 'from' : 'to'} plan`} aria-pressed={planned.includes(o.id)} onClick={() => togglePlan(o.id)}>{planned.includes(o.id) ? '✓' : '+'}</Button></div></Panel>)}</div>{queryTable}</div>}

      {page === 'Competitors' && <div className="page-layout">{metrics}<Panel title="Tracked competitors" className="full-panel" action={<Badge className="badge neutral-badge">4 brands</Badge>}><div className="table-scroll"><Table className="competitor-table"><TableHeader><TableRow><TableHead>Brand</TableHead><TableHead>Visibility score</TableHead><TableHead>Change</TableHead><TableHead>Search appearances</TableHead><TableHead>Share of voice</TableHead><TableHead><span className="sr-only">Details</span></TableHead></TableRow></TableHeader><TableBody>{competitors.map(c => <TableRow key={c.name}><TableCell><span className="brand-cell"><CompetitorMark name={c.name} /><strong>{c.name}</strong>{c.name === 'Acme' && <Badge className="badge">You</Badge>}</span></TableCell><TableCell>{c.score}</TableCell><TableCell className={c.change.startsWith('−') ? 'warm-text' : 'accent-text'}>{c.change}</TableCell><TableCell>{c.appearances.toLocaleString()}</TableCell><TableCell>{c.share}</TableCell><TableCell><Button variant="ghost" className="app-button text-button" onClick={() => setModal({ type: 'competitor', name: c.name })}>Details ↗</Button></TableCell></TableRow>)}</TableBody></Table></div></Panel></div>}

      {page === 'Reports' && <div className="page-layout">{metrics}<Panel title="Visibility report" className="report-panel" action={<Badge className="badge neutral-badge">Sample data</Badge>}><div className="report-preview"><span className="report-icon"><Icon name="imgIconFile" /></span><div><h3>Acme search visibility</h3><p>Last {period} days · 4 models · {trackedCount} tracked queries</p></div><Button className="app-button button primary" onClick={exportReport}>Download report <span aria-hidden="true">↓</span></Button></div></Panel><AppearanceChart /></div>}

        </div>
        <div className="coming-soon-overlay">
          <Card className="coming-soon-card">
            <span className="coming-soon-lock"><LockKeyhole size={24} aria-hidden="true" /></span>
            <h2>Coming soon</h2>
            <p>This page is still in the works. Keep tracking your visibility from Overview.</p>
            <Button className="app-button button primary" onClick={() => navigate('Overview')}>Back to Overview</Button>
          </Card>
        </div>
      </section>}

      {page === 'Settings' && <div className="settings-grid"><Panel title="Workspace" className="settings-panel"><dl className="settings-list"><div><dt>Workspace</dt><dd>Lavalab</dd></div><div><dt>Website</dt><dd>usclavalab.com</dd></div><div><dt>Member</dt><dd>Jordan Lee</dd></div><div><dt>Environment</dt><dd><Badge className="badge neutral-badge">Demo workspace</Badge></dd></div></dl></Panel><Panel title="Query tracking" className="settings-panel"><dl className="settings-list"><div><dt>Tracked queries</dt><dd>{trackedCount} / 200</dd></div><div><dt>Search models</dt><dd>4</dd></div><div><dt>Locally saved queries</dt><dd>{savedQueries.length}</dd></div></dl><Button variant="secondary" className="app-button button secondary" onClick={openQueries}>Add queries</Button><Button variant="ghost" className="app-button button secondary" onClick={() => setModal({ type: 'plan' })}>Manage plan</Button></Panel><Panel title="Demo data" className="settings-panel"><p className="settings-description">Metrics and search activity are sample data. Added queries and your action plan are saved in this browser; live search monitoring is not connected.</p><Button variant="secondary" className="app-button button secondary" onClick={() => { downloadCsv('arcrank-tracked-queries.csv', [['Query', 'Models', 'Appearance rate'], ...queries.map(q => [q.text, q.models.join('; '), q.rate ?? 'Saved locally'])]); toast.success('Your tracked queries have been downloaded.') }}>Export tracked queries <span aria-hidden="true">↓</span></Button></Panel></div>}
    </main>

    <Dialog open={modal !== null} onOpenChange={open => { if (!open) setModal(null) }}>
      <DialogContent className="modal" showCloseButton={false} onCloseAutoFocus={event => {
        event.preventDefault()
        const target = modalOpener.current?.isConnected ? modalOpener.current : document.getElementById('main-content')
        target?.focus()
      }} aria-describedby={undefined}>

      <DialogHeader className="modal-header"><DialogTitle>{modal?.type === 'queries' ? 'Add search queries' : modal?.type === 'plan' ? 'Your search footprint' : selectedOpportunity?.title ?? selectedActivity?.title ?? selectedCompetitor?.name}</DialogTitle><DialogClose asChild><Button variant="ghost" className="app-button icon-button close-button" aria-label="Close dialog">×</Button></DialogClose></DialogHeader>
      {modal?.type === 'queries' && <form onSubmit={saveQueries} className="query-form"><Label htmlFor="query-input">Search queries</Label><Textarea id="query-input" autoFocus rows={5} placeholder={'Best project management tool for startups\nHow to plan a product launch'} value={queryInput} onChange={e => { setQueryInput(e.target.value); setFormError('') }} aria-describedby={formError ? 'query-error query-help' : 'query-help'} aria-invalid={Boolean(formError)} /><p id="query-help" className="form-help">One query per line. Up to 20 at a time.</p><fieldset><legend>Search models</legend><div className="model-checkboxes">{models.map(m => <Label key={m.name}><Checkbox checked={queryModels.includes(m.name)} onCheckedChange={checked => setQueryModels(checked === true ? [...queryModels, m.name] : queryModels.filter(n => n !== m.name))} />{m.name}</Label>)}</div></fieldset>{formError && <p className="form-error" id="query-error" role="alert">{formError}</p>}<div className="form-note"><span>{trackedCount} / 200 queries</span><span>Saved locally in this demo</span></div><DialogFooter className="modal-actions"><Button variant="ghost" type="button" className="app-button button secondary" onClick={() => setModal(null)}>Cancel</Button><Button variant="ghost" type="submit" className="app-button button primary">Add queries</Button></DialogFooter></form>}
      {selectedOpportunity && <div className="modal-body"><div className="opportunity-meta"><Badge className="badge warm-badge">{selectedOpportunity.impact}</Badge><span>{selectedOpportunity.count}</span></div><p>{selectedOpportunity.description}</p><h3>Recommended action</h3><p>{selectedOpportunity.action}</p><h3>Queries to focus on</h3><ul className="query-chips">{selectedOpportunity.queries.map(q => <li key={q}>{q}</li>)}</ul><DialogFooter className="modal-actions"><Button variant="secondary" className="app-button button secondary" onClick={() => { setModal(null); navigate('Appearance'); setSearch(''); setModelFilter('All models') }}>View tracked queries</Button><Button className="app-button button primary" onClick={() => togglePlan(selectedOpportunity.id)}>{planned.includes(selectedOpportunity.id) ? 'Remove from plan' : 'Add to plan'}</Button></DialogFooter></div>}
      {selectedActivity && <div className="modal-body"><div className="opportunity-meta"><Badge className="badge">{selectedActivity.model}</Badge><span>{selectedActivity.time}</span></div><h3>{selectedActivity.query}</h3><p>{selectedActivity.detail}</p><div className="source-card"><Icon name="imgIconFile" /><span>{selectedActivity.source}</span></div><DialogFooter className="modal-actions"><Button variant="secondary" className="app-button button secondary" onClick={() => setModal(null)}>Done</Button><Button className="app-button button primary" onClick={() => { setModal(null); setModelFilter(selectedActivity.model); setSearch(''); navigate('Appearance') }}>Explore appearance</Button></DialogFooter></div>}
      {selectedCompetitor && <div className="modal-body"><div className="competitor-identity"><CompetitorMark name={selectedCompetitor.name} /><span>{selectedCompetitor.domain}</span></div><div className="detail-metrics"><div><span>Visibility score</span><strong>{selectedCompetitor.score}</strong></div><div><span>Search appearances</span><strong>{selectedCompetitor.appearances.toLocaleString()}</strong></div><div><span>Share of voice</span><strong>{selectedCompetitor.share}</strong></div></div><DialogFooter className="modal-actions"><Button variant="secondary" className="app-button button secondary" onClick={() => setModal(null)}>Done</Button><Button className="app-button button primary" onClick={() => { setModal(null); navigate('Competitors') }}>Compare brands</Button></DialogFooter></div>}
      {modal?.type === 'plan' && <div className="modal-body"><Badge className="badge">Startup plan</Badge><div className="plan-count"><strong>{trackedCount}</strong><span>of 200 queries</span></div><Progress className="usage-track" value={trackedCount / 2} aria-label="Query allowance used" /><dl className="settings-list"><div><dt>Available queries</dt><dd>{200 - trackedCount}</dd></div><div><dt>Search models</dt><dd>4</dd></div><div><dt>Workspace</dt><dd>Demo</dd></div></dl><DialogFooter className="modal-actions"><Button className="app-button button primary" onClick={openQueries}>Add queries</Button></DialogFooter></div>}
      </DialogContent>
    </Dialog>
  </>
}

export default function Dashboard() {
  return <SidebarProvider className="app-shell" style={{ '--sidebar-width': 'var(--dashboard-sidebar-width)', '--sidebar-width-icon': '72px' } as CSSProperties}><App /></SidebarProvider>
}

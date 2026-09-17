import { useEffect, useId, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Panel, DashboardSelect } from './components'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { campusBrands, appearanceModels as models, appearanceQueries, initialQueries, type Period, type Query } from './data'
import AppearanceChart from './AppearanceChart'
import { ModelPanel } from './ModelPanel'
import './appearance-explorer.css'

// Shared demo history: high-performing queries improve overall, while low
// performers decline. A minority of covered models can move against the trend.
function observations(query: Query, modelIndex: number, days: number) {
  const seed = [...initialQueries, ...appearanceQueries].findIndex(q => q.id === query.id)
  const coveredIndex = query.models.indexOf(models[modelIndex].name)
  if (seed < 0 || query.rate === null || coveredIndex < 0) return []
  const positive = query.rate >= 68
  const exception = query.models.length >= 4 && (coveredIndex + seed) % 5 === 3
  const direction = (positive ? 1 : -1) * (exception ? -1 : 1)
  const strength = (exception ? 5 : positive ? 22 : 12) * (.8 + ((modelIndex * 3 + seed) % 7) / 15)
  const modelOffset = (((modelIndex * 7 + seed * 3) % 10) - 4.5) * Math.min(1.5, query.rate * .08)
  return Array.from({ length: days }, (_, i) => {
    const age = days - 1 - i
    const trend = -direction * strength * Math.tanh(age / 140)
    const ripple = Math.sin((182 - age) * .11 + seed + modelIndex) * .18
    return Math.round(Math.max(0, Math.min(100, query.rate! + modelOffset + trend + ripple)) * 10) / 10
  })
}
// Synthetic competitor history, matching the rest of this demo's query data.
function competitorHistory(query: Query, brandValues: (number | null)[]) {
  const seed = [...initialQueries, ...appearanceQueries].findIndex(q => q.id === query.id)
  if (seed < 0 || query.rate === null || !query.losingTo) return undefined
  const end = query.rate >= 68 ? 63 + seed % 7 * 3 : 58 + seed % 9 * 3
  return {
    name: query.losingTo,
    logo: campusBrands.find(brand => brand.name === query.losingTo)!.logo,
    values: brandValues.map((brandValue, day) => {
      const progress = day / 182
      // Allocate a portion of the remaining share to this competitor;
      // the rest belongs to other brands. Round down to preserve that gap.
      const remainingShare = Math.max(0, 100 - (brandValue ?? 0))
      const competitorFraction = (end - (8 + seed % 5) * (1 - progress) + Math.sin(progress * Math.PI * 3) * 2) / 100
      return Math.floor(remainingShare * competitorFraction * 10) / 10
    }),
  }
}
const average = (values: number[]) => values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10 : null

// Short demo labels keep the shortcut mosaic compact; full queries stay searchable.
const pillLabels: Record<string, string> = {
  'email-tools': 'Email marketing tools',
  'seo-templates': 'SEO report templates',
  'traffic-benchmarks': 'Traffic benchmarks',
  'social-tools': 'Social scheduling tools',
  startup: 'Startup project tools',
  'landing-page': 'Build a landing page',
}

export default function AppearanceExplorer({ queries: trackedQueries, period, initialModel = 'All models' }: { queries: Query[]; period: Period; initialModel?: string }) {
  const queries = [...trackedQueries, ...appearanceQueries.filter(q => !trackedQueries.some(t => t.id === q.id || t.text.toLowerCase() === q.text.toLowerCase()))]
  const [selectedId, setSelectedId] = useState('all')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeResult, setActiveResult] = useState(-1)
  const slotRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // Decide motion before focus/blur fires, including outside-click dismissal.
    const pointer = () => { if (slotRef.current) slotRef.current.dataset.motion = 'pointer' }
    const keyboard = () => { if (slotRef.current) slotRef.current.dataset.motion = 'keyboard' }
    document.addEventListener('pointerdown', pointer, true)
    document.addEventListener('keydown', keyboard, true)
    return () => {
      document.removeEventListener('pointerdown', pointer, true)
      document.removeEventListener('keydown', keyboard, true)
    }
  }, [])
  const resultsId = useId()
  const resultsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (searchOpen && activeResult >= 0) resultsRef.current?.children[activeResult]?.scrollIntoView({ block: 'nearest' })
  }, [activeResult, searchOpen])
  const [modelFilter, setModelFilter] = useState(initialModel)
  const [sort, setSort] = useState('weakest')
  const focusRef = useRef<HTMLDivElement>(null)
  const selected = queries.find(q => q.id === selectedId)
  const scoped = selected ? [selected] : queries
  const days = Number(period)
  const series = scoped.flatMap(q => models.map((_, i) => observations(q, i, days))).filter(s => s.length)
  const overall = average(series.flat())
  const trendSeries = selected ? models.map((_, i) => observations(selected, i, 183)).filter(values => values.length) : []
  const trendValues = Array.from({ length: 183 }, (_, day) => average(trendSeries.map(values => values[day])))
  const byModel = models.map((model, i) => {
    const values = scoped.flatMap(q => observations(q, i, days))
    const current = average(values)
    const first = average(scoped.flatMap(q => observations(q, i, days * 2).slice(0, days)))
    const last = current
    return { ...model, rate: current, change: first === null || last === null ? null : Math.round((last - first) * 10) / 10 }
  })
  const queryRates = queries.map(q => {
    const rates = models.map((m, i) => ({ name: m.name, rate: average(observations(q, i, days)) })).filter(m => m.rate !== null)
    return { query: q, rate: average(rates.map(m => m.rate!)), weakest: rates.sort((a, b) => a.rate! - b.rate!)[0]?.name }
  })
  const measured = queryRates.filter(item => item.rate !== null).sort((a, b) => b.rate! - a.rate!)
  const highest = measured.slice(0, 5)
  const highestIds = new Set(highest.map(item => item.query.id))
  const lowest = measured.filter(item => !highestIds.has(item.query.id)).slice(-5).reverse()
  const ranked = queryRates.filter(item => modelFilter === 'All models' || item.query.models.includes(modelFilter as typeof models[number]['name']))
    .sort((a, b) => a.rate === null ? 1 : b.rate === null ? -1 : sort === 'weakest' ? a.rate - b.rate : b.rate - a.rate)
  function choose(id: string, scroll = false) {
    setSelectedId(id); setSearch(''); setSearchOpen(false)
    if (scroll) { focusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); focusRef.current?.focus({ preventScroll: true }) }
  }
  const matches = queries.filter(q => q.text.toLowerCase().includes(search.toLowerCase()))
  const options = [{ id: 'all', text: 'All tracked queries', rate: null }, ...matches]
  const queryPills = <div className="query-shortcuts-slot" ref={slotRef} data-open={searchOpen || undefined}>
  <div className="query-chips-layer" inert={searchOpen} aria-hidden={searchOpen}><div className="appearance-query-pills" role="group" aria-label="Query shortcuts">
    <button className="appearance-query-pill all-queries" aria-pressed={!selected} onClick={() => choose('all')}>All queries</button>
    {[...highest.map(item => ({ ...item, tier: 'high' })), ...lowest.map(item => ({ ...item, tier: 'low' }))].map(({ query, rate, tier }) =>
      <button key={query.id} className={`appearance-query-pill is-${tier}`} aria-pressed={selectedId === query.id} title={`${query.text} · ${tier === 'high' ? 'Highest' : 'Lowest'} performing · ${rate}% appearance`} onClick={() => choose(query.id)}>{pillLabels[query.id] ?? query.text}</button>
    )}
  </div></div>
  <div inert={!searchOpen} aria-hidden={!searchOpen} className="query-results" ref={resultsRef} id={resultsId} role="listbox" aria-label="Matching queries">
    {options.map((q, index) => <button key={q.id} id={`${resultsId}-${index}`} role="option" aria-selected={selectedId === q.id} data-active={activeResult === index || undefined} tabIndex={-1} onMouseDown={e => e.preventDefault()} onClick={() => { choose(q.id); inputRef.current?.focus() }}>
      <span className="query-result-label">{q.text}</span><span>{q.id === 'all' ? 'Overview' : q.rate === null ? 'No data yet' : `${queryRates.find(item => item.query.id === q.id)?.rate}%`}</span>
    </button>)}
    {!matches.length && <p role="status">No matching queries. Try another search.</p>}
  </div>
  </div>
  const queryPicker = <div className="query-picker" data-open={searchOpen || undefined} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget) && !resultsRef.current?.contains(e.relatedTarget)) setSearchOpen(false) }}>
    <Search size={16} aria-hidden="true" />
    <Input ref={inputRef} type="search" aria-label="Search tracked queries" aria-controls={searchOpen ? resultsId : undefined} aria-expanded={searchOpen} aria-activedescendant={searchOpen && activeResult >= 0 ? `${resultsId}-${activeResult}` : undefined} placeholder={selected ? selected.text : 'Search your tracked queries'} value={search}
      onFocus={() => { setSearchOpen(true); setActiveResult(-1) }}
      onClick={() => setSearchOpen(true)}
      onChange={e => { setSearch(e.target.value); setSearchOpen(true); setActiveResult(-1); if (resultsRef.current) resultsRef.current.scrollTop = 0 }}
      onKeyDown={e => {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setSearchOpen(false); setActiveResult(-1) }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault(); setSearchOpen(true)
          setActiveResult(index => index < 0 ? (e.key === 'ArrowUp' ? options.length - 1 : 0) : (index + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
        }
        if (e.key === 'Enter' && searchOpen && activeResult >= 0) { e.preventDefault(); choose(options[activeResult].id) }
      }} />
    {(selected || searchOpen) && <Button variant="ghost" className="app-button" aria-label={searchOpen ? 'Close query search' : 'Clear query selection'} onClick={() => { if (searchOpen) { setSearchOpen(false); setSearch('') } else choose('all') }}><X size={15} /></Button>}
  </div>
  return <div className="page-layout appearance-explorer">
    <div className="analytics-grid" ref={focusRef} tabIndex={-1}>
      <AppearanceChart querySearch={queryPicker} queryPills={queryPills} queryData={selected ? {
        id: selected.id,
        label: selected.text,
        summary: overall,
        competitor: competitorHistory(selected, trendValues),
        period,
        values: trendValues,
        change: average(byModel.map(m => m.change).filter((v): v is number => v !== null)),
      } : undefined} />
      <ModelPanel onSelect={setModelFilter} items={selected ? byModel : models.map(m => ({ ...m, change: Number(m.change) }))} reorderable />
    <Panel title="Competing Queries" titleIcon="friendly-rivals" className="competing-panel" action={<DashboardSelect className="competing-sort" label="Sort competing queries" value={sort} onValueChange={setSort} options={[{value:'weakest',label:'Lowest appearance first'},{value:'strongest',label:'Highest appearance first'}]}/>}>
      {modelFilter !== 'All models' && <button className="competing-active-filter" onClick={() => setModelFilter('All models')} aria-label={`Clear ${modelFilter} query filter`}>{modelFilter}<X size={12} aria-hidden="true" /></button>}
      <div className="competing-table" tabIndex={0} role="region" aria-label="Ranked competing queries"><div className="competing-columns"><span>Tracked query</span><span>Appearance rate</span><span>Weakest model</span><span>Losing to</span></div>
      {ranked.map(({query,rate,weakest}) => {
        // Persisted demo queries can predate the competitor field.
        const losingTo = query.losingTo ?? [...initialQueries, ...appearanceQueries].find(item => item.id === query.id)?.losingTo
        return <button className={`competing-row ${selectedId === query.id ? 'is-selected' : ''}`} key={query.id} aria-pressed={selectedId === query.id} onClick={() => choose(query.id, true)}>
          <span className="competing-query"><strong>{query.text}</strong><small>{query.models.join(' · ')}</small></span>
          <span className="competing-rate"><strong>{rate === null ? 'No data yet' : `${rate}%`}</strong>{rate !== null && <span className="competing-rate-track" aria-hidden="true"><i style={{width:`${rate}%`}}/></span>}</span>
          <span className="competing-weakest">{weakest && <img src={`${import.meta.env.BASE_URL}assets/logos/${weakest.toLowerCase()}.svg`} className={weakest === 'ChatGPT' ? 'logo-monochrome' : undefined} alt="" width="16" height="16" />}{weakest ?? 'Awaiting data'}</span>
          <span className="competing-competitor">{losingTo && <img src={`${import.meta.env.BASE_URL}assets/competitors/${campusBrands.find(brand => brand.name === losingTo)?.logo}.png`} alt="" width="16" height="16" />}{losingTo ?? '—'}</span>
        </button>
      })}
      {!ranked.length && <p className="explorer-no-data">No tracked queries for this model.</p>}</div>
    </Panel>
    </div>
  </div>
}

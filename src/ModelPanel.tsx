import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowDownRight, ArrowUp, ArrowUpDown, ArrowUpRight } from 'lucide-react'
import { Panel } from './components'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { models, type Model } from './data'
import './model-panel.css'

type ModelStat = { name: Model; rate: number | null; change: number | null }
const defaultItems: ModelStat[] = models.map(m => ({ ...m, change: Number(m.change.replace('−', '-')) }))

export function ModelPanel({ onSelect, items = defaultItems, reorderable = false }: { onSelect: (model: Model) => void; items?: ModelStat[]; reorderable?: boolean }) {
  const [order, setOrder] = useState<Model[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  const topFadeRef = useRef<HTMLSpanElement>(null)
  const bottomFadeRef = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const list = listRef.current
    if (!reorderable || !list) return
    // Native scrolling stays untouched. Only the two edge overlays update,
    // without triggering a React render or animating keyboard navigation.
    const updateEdges = () => {
      const remaining = list.scrollHeight - list.clientHeight - list.scrollTop
      const overflowing = list.scrollHeight > list.clientHeight + 1
      list.dataset.overflowing = String(overflowing)
      if (topFadeRef.current) topFadeRef.current.style.opacity = String(overflowing ? Math.min(1, Math.max(0, list.scrollTop) / 16) : 0)
      if (bottomFadeRef.current) bottomFadeRef.current.style.opacity = String(overflowing ? Math.min(1, Math.max(0, remaining) / 16) : 0)
    }
    const observer = new ResizeObserver(updateEdges)
    observer.observe(list)
    for (const row of list.children) observer.observe(row)
    list.addEventListener('scroll', updateEdges, { passive: true })
    updateEdges()
    return () => { observer.disconnect(); list.removeEventListener('scroll', updateEdges) }
  }, [reorderable, items, order])
  const ordered = [...items].sort((a, b) => {
    const index = (name: Model) => order.includes(name) ? order.indexOf(name) : order.length + items.findIndex(m => m.name === name)
    return index(a.name) - index(b.name)
  })
  function move(index: number, direction: number) {
    const next = ordered.map(m => m.name)
    const destination = index + direction
    if (destination < 0 || destination >= next.length) return
    ;[next[index], next[destination]] = [next[destination], next[index]]
    setOrder(next)
  }
  return <Panel title="Appearance by model" titleIcon="soft-layers" className={`model-panel compact-model-panel${reorderable ? ' full-height-models' : ''}`}>
    <div className="model-scroll-shell">
    <div className="model-list" ref={listRef}>{ordered.map(model => {
      const declining = (model.change ?? 0) < 0
      const Arrow = declining ? ArrowDownRight : ArrowUpRight
      return <Button variant="ghost" className="app-button model-row" key={model.name} onClick={() => onSelect(model.name)} aria-label={`View queries appearing in ${model.name}`}>
        <span className="model-name"><img className={`model-logo ${model.name === 'ChatGPT' ? 'logo-monochrome' : ''}`} src={`${import.meta.env.BASE_URL}assets/logos/${model.name.toLowerCase()}.svg`} alt="" width="18" height="18" />{model.name}</span>
        <span className="model-meter-score">
          <span className={`model-segments${declining ? ' is-declining' : ''}`} role="meter" aria-label={`${model.name} appearance rate`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={model.rate ?? undefined} aria-valuetext={model.rate === null ? 'No data' : `${model.rate}%`}>
            {Array.from({ length: 20 }, (_, i) => <span key={i} data-filled={model.rate !== null && i < Math.round(model.rate / 5) ? '' : undefined} />)}
          </span>
          <strong>{model.rate === null ? '—' : `${model.rate}%`}</strong>
        </span>
        <span className={`model-delta${declining ? ' is-declining' : ''}`} aria-label={model.change === null ? 'No data' : `${model.change === 0 ? 'Unchanged' : declining ? 'Decreased' : 'Increased'} by ${Math.abs(model.change)} versus previous period`}>
          {model.change !== null && model.change !== 0 && <Arrow size={12} strokeWidth={1.6} aria-hidden="true" />}<span>{model.change === null ? '—' : Math.abs(model.change)}</span>
        </span>
      </Button>
    })}</div>
    {reorderable && <><span className="model-scroll-fade is-top" ref={topFadeRef} aria-hidden="true"/><span className="model-scroll-fade is-bottom" ref={bottomFadeRef} aria-hidden="true"/></>}
    </div>
    {reorderable && <div className="model-ordering"><Dialog>
      <DialogTrigger asChild><Button variant="secondary" className="app-button reorder-models"><ArrowUpDown size={16} />Reorder models</Button></DialogTrigger>
      <DialogContent><DialogHeader><DialogTitle>Reorder models</DialogTitle><DialogDescription>Move models up or down to change their display order.</DialogDescription></DialogHeader>
        <div className="model-order-list">{ordered.map((model, i) => <div key={model.name}><span>{model.name}</span><Button variant="ghost" size="icon" aria-label={`Move ${model.name} up`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={16}/></Button><Button variant="ghost" size="icon" aria-label={`Move ${model.name} down`} disabled={i === ordered.length - 1} onClick={() => move(i, 1)}><ArrowDown size={16}/></Button></div>)}</div>
      </DialogContent>
    </Dialog></div>}
  </Panel>
}

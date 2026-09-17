import { useState, type FormEvent } from 'react'
import { ChevronDown, Layers, X } from 'lucide-react'
import { appearanceModels, type Model } from './data'
import { Button } from './components/ui/button'
import { Checkbox } from './components/ui/checkbox'
import { Textarea } from './components/ui/textarea'
import { Label } from './components/ui/label'
import { DialogTitle, DialogClose, DialogFooter } from './components/ui/dialog'

const featured: Model[] = ['Perplexity', 'Gemini', 'Claude', 'ChatGPT', 'DeepSeek']
const examples = ['Find a startup accelerator', 'Meet student founders', 'Launch your first startup', 'USC startup communities', 'Find a mentor', 'Explore early-stage funding', 'Build your founding team', 'University incubators', 'Startup pitch competitions', 'Find a cofounder', 'Validate your idea', 'Connect with investors', 'Startup programs in LA', 'Learn from founders', 'Student venture funding', 'Grow your startup']
const lanes = Array.from({ length: 10 }, (_, row) => Array.from({ length: 4 }, (_, col) => examples[(row * 3 + col) % examples.length]))

type Props = {
  input: string; onInput: (value: string) => void
  selected: Model[]; onSelect: (models: Model[]) => void
  error: string; onSubmit: (event: FormEvent) => void; onCancel: () => void
}

export function QueryDialog({ input, onInput, selected, onSelect, error, onSubmit, onCancel }: Props) {
  const [expanded, setExpanded] = useState(false)
  const allSelected = appearanceModels.every(model => selected.includes(model.name))
  const visibleModels = expanded ? [...featured, ...appearanceModels.map(model => model.name).filter(name => !featured.includes(name))] : featured
  return <div className="query-layout">
    <form id="add-queries-form" className="query-form" onSubmit={onSubmit}>
      <DialogTitle>Add search queries</DialogTitle>
      <div className="query-input-group">
        <Label htmlFor="query-input">Search queries</Label>
        <Textarea id="query-input" autoFocus rows={3} placeholder="Where do you find USC student startup accelerators?" value={input} onChange={event => onInput(event.target.value)} aria-describedby={error ? 'query-help query-error' : 'query-help'} aria-invalid={Boolean(error)} />
        <p id="query-help" className="sr-only">One query per line. Up to 20 at a time.</p>
      </div>
      <fieldset>
        <legend>Search models</legend>
        <div id="query-model-options" className="query-model-options">
          <Label className="query-model-pill"><Layers size={18} aria-hidden="true" /><span>All Models</span><Checkbox aria-label="All Models" checked={allSelected ? true : selected.length ? 'indeterminate' : false} onCheckedChange={() => onSelect(allSelected ? [] : appearanceModels.map(model => model.name))} /></Label>
          {visibleModels.map(name => <Label className="query-model-pill" key={name}>
            <img src={`${import.meta.env.BASE_URL}assets/logos/${name.toLowerCase()}.svg`} className={name === 'ChatGPT' || name === 'Grok' ? 'query-white-logo' : undefined} alt="" width={18} height={18} />
            <span>{name}</span><Checkbox aria-label={name} checked={selected.includes(name)} onCheckedChange={checked => onSelect(checked ? [...selected, name] : selected.filter(model => model !== name))} />
          </Label>)}
        </div>
        <Button type="button" variant="ghost" className="query-view-more" aria-expanded={expanded} aria-controls="query-model-options" onClick={() => setExpanded(!expanded)}>{expanded ? 'View fewer models' : 'View more models'}<ChevronDown size={12} aria-hidden="true" /></Button>
      </fieldset>
      {error && <p className="form-error" id="query-error" role="alert">{error}</p>}
    </form>
    <aside className="query-preview" aria-label="Search examples">
      <div className="query-preview-bubbles" aria-hidden="true">{lanes.map((lane, row) => <div className="query-preview-lane" key={row}><div className="query-preview-track"><div className="query-preview-segment">{lane.map(query => <span className="query-preview-bubble" key={query}>{query}</span>)}</div></div></div>)}</div>
      <DialogClose asChild><Button variant="ghost" className="app-button icon-button close-button" aria-label="Close dialog"><X size={16} strokeWidth={1.75} aria-hidden="true" /></Button></DialogClose>
      <DialogFooter className="modal-actions query-preview-actions">
        <Button variant="ghost" type="button" className="app-button button secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="ghost" type="submit" form="add-queries-form" className="app-button button primary">Add queries</Button>
      </DialogFooter>
    </aside>
  </div>
}

import { useRef, useState, type ReactNode, type PointerEvent } from 'react'
import { Card, CardHeader, CardTitle } from './components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'

export function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <img className={`icon ${className}`} src={`${import.meta.env.BASE_URL}assets/${name}.svg`} alt="" width="18" height="18" draggable="false" />
}

type PanelTitleIcon = 'soft-search' | 'soft-layers' | 'focus-pebble' | 'friendly-rivals' | 'live-pulse' | 'missing-search'

export function Panel({ title, titleIcon, action, children, className = '', id }: { title: string; titleIcon?: PanelTitleIcon; action?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return <Card id={id} className={`panel ${className}`} role="region" aria-label={title}><CardHeader className="panel-heading"><CardTitle><h2 className="panel-title">{titleIcon && <Icon name={`card-icons/${titleIcon}`} className="panel-title-icon" />}{title}</h2></CardTitle>{action}</CardHeader>{children}</Card>
}

export function DashboardSelect({ label, value, onValueChange, options, className = '' }: {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: (string | { value: string; label: string })[]
  className?: string
}) {
  const [animateChevron, setAnimateChevron] = useState(false)
  const pressAnimation = useRef<Animation | null>(null)
  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    setAnimateChevron(true)
    if (event.button !== 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const transform = getComputedStyle(event.currentTarget).transform
    pressAnimation.current?.cancel()
    pressAnimation.current = event.currentTarget.animate(
      [{ transform }, { transform: 'scale(.97)', offset: .35 }, { transform: 'scale(1)' }],
      { duration: 240, easing: 'cubic-bezier(.23, 1, .32, 1)' },
    )
  }
  return <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger className={`dashboard-select ${className}`} aria-label={label} data-animate-chevron={animateChevron} onPointerDownCapture={handlePointerDown} onKeyDownCapture={() => setAnimateChevron(false)}><SelectValue /></SelectTrigger>
    <SelectContent className="dashboard-select-menu" position="popper" side="bottom" align="start" sideOffset={8} onKeyDownCapture={() => setAnimateChevron(false)}>{options.map(option => {
      const item = typeof option === 'string' ? { value: option, label: option } : option
      return <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
    })}</SelectContent>
  </Select>
}

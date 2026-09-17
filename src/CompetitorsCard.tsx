import { campusBrands as brands } from './data'
import { Panel } from './components'
import { Button } from './components/ui/button'
import './competitors.css'

const baseline = brands.find(brand => brand.logo === 'lavalab')!.appearances
const number = new Intl.NumberFormat('en-US')

export function CompetitorsCard({ onViewAll }: { onViewAll: () => void }) {
  return <Panel title="Competitors" titleIcon="friendly-rivals" className="competitors-panel campus-competitors" action={<Button variant="ghost" className="app-button text-button" onClick={onViewAll}>View all <span aria-hidden="true">↗</span></Button>}>
    <ol className="campus-ranking" aria-label="Competitors ranked by search appearances">
      {brands.map((brand, index) => {
        const own = brand.logo === 'lavalab'
        const gap = brand.appearances - baseline
        const difference = gap === 0 ? '—' : `${gap > 0 ? '+' : '−'}${number.format(Math.abs(gap))}`
        return <li key={brand.logo}>
          <div className={`campus-competitor${own ? ' is-own' : ''}`}>
                <span className="campus-rank">{String(index + 1).padStart(2, '0')}</span>
                <img className="campus-logo" src={`${import.meta.env.BASE_URL}assets/competitors/${brand.logo}.png`} alt="" width="22" height="22" />
                <span className="campus-name">{brand.name}</span>
                <strong className="campus-total">{number.format(brand.appearances)}</strong>
                <span className={`campus-gap ${gap > 0 ? 'is-ahead' : gap < 0 ? 'is-behind' : ''}`} aria-hidden="true">{difference}</span>
          </div>
        </li>
      })}
    </ol>
  </Panel>
}

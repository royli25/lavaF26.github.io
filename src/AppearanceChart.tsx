import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Panel, DashboardSelect } from './components'
import { Badge } from './components/ui/badge'
import graph from './assets/appearance-chart/graph.svg?raw'
import grid from './assets/appearance-chart/grid.svg'
import './appearance-chart.css'
// Demo curve exported from the approved Figma design; tooltip values follow its geometry.
type QueryChartData = { id: string; label: string; summary: number | null; period: string; values: (number | null)[]; change: number | null }
export default function AppearanceChart({ querySearch, queryPills, queryData }: { querySearch?: ReactNode; queryPills?: ReactNode; queryData?: QueryChartData } = {}){
 const [range,setRange]=useState('6'),[point,setPoint]=useState<number|null>(null)
 const patternId=useId()
 const ref=useRef<HTMLDivElement>(null),path=useRef<SVGPathElement|null>(null)
 useEffect(()=>{path.current=ref.current?.querySelector('[id="Single graph line"]')??null;setPoint(null)},[queryData?.id])
 const offset=range==='3'?.5:0
 function sample(t:number){if(queryData){const v=queryData.values[Math.round(t*(queryData.values.length-1))]??0;return {y:144-v/100*122,value:v}}const p=path.current;if(!p)return {y:28.263,value:2846};let a=0,b=p.getTotalLength();for(let i=0;i<22;i++){const m=(a+b)/2;if(p.getPointAtLength(m).x<40+680*t)a=m;else b=m}const pos=p.getPointAtLength((a+b)/2);return {y:pos.y,value:Math.round((144-pos.y)/122*3000)}}
 const value=sample(point??1),x=40+((point??1)-offset)/(1-offset)*680
 const date=new Date(Date.UTC(2026,3,1+Math.round((point??1)*182))).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'})
 const labels=range==='6'?['Apr','May','Jun','Jul','Aug','Sep']:['Jul','Aug','Sep']
 const format=(n:number)=>queryData?`${Number(n.toFixed(1))}%`:n.toLocaleString()
 const noData=!!queryData&&queryData.summary===null
 const line=queryData?.values.map((v,i)=>`${i?'L':'M'}${40+i/(queryData.values.length-1)*680},${144-(v??0)/100*122}`).join(' ')
 const summary=queryData?(noData?'—':format(queryData.summary!)):'2,846'
 const delta=queryData?(queryData.change===null?'No data yet':`${queryData.change>=0?'+':''}${queryData.change} pp this period`):'+223% since April'
 return <Panel title="Search appearances" titleIcon="soft-search" className={`chart-panel zebra-panel${querySearch ? " has-query-search" : ""}`} action={<div className="appearance-chart-actions"><DashboardSelect className="subtle-select" label="Chart time range" value={range} onValueChange={v=>{setRange(v);setPoint(null)}} options={[{value:'6',label:'Last 6 months'},{value:'3',label:'Last 3 months'}]}/></div>}>
 <img className="zebra-corner" src={grid} alt=""/>
 {querySearch && <div className="appearance-query-controls">{queryPills}{querySearch}</div>}
 <div className="chart-summary" aria-live="polite"><strong>{summary}</strong><span>{queryData?`Last ${queryData.period} days`:'in September'}</span><Badge className="badge zebra-badge">{delta}</Badge></div>
 <div className="chart-container zebra-chart" aria-label={queryData?`${queryData.label}: ${summary} appearance rate`:'Search appearances from April to September 2026, ending at 2,846'}>
 <div className="zebra-art" ref={ref} aria-hidden="true">{queryData?<svg viewBox="0 0 738 174" preserveAspectRatio="none"><defs><pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="28" fill="white" fillOpacity=".05"/><rect x="14" width="14" height="28" fill="white" fillOpacity=".10"/></pattern></defs>{[0,1,2,3].map(i=><line key={i} x1="40" x2="720" y1={144-i*122/3} y2={144-i*122/3} stroke="white" strokeOpacity=".14" strokeWidth=".5"/>)}{!noData&&<g transform={range==='3'?'translate(-720 0) scale(2 1)':undefined}><path d={`${line} L720,144 L40,144 Z`} fill={`url(#${patternId})`}/><path d={line} fill="none" stroke="#6571ef" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/></g>}</svg>:<div style={{width:range==='3'?'200%':'100%',transform:range==='3'?'translateX(-48.7804878%)':undefined}} dangerouslySetInnerHTML={{__html:graph}}/>}</div>
 <svg className="zebra-interaction" viewBox="0 0 738 174" preserveAspectRatio="none" tabIndex={noData?-1:0} role="slider" aria-disabled={noData || undefined} aria-label="Inspect search appearances" aria-valuemin={Math.round(offset*182)} aria-valuemax={182} aria-valuenow={Math.round((point??1)*182)} aria-valuetext={noData?'No data yet':`${date}, ${format(value.value)} appearances`} onPointerMove={e=>{if(noData)return;const b=e.currentTarget.getBoundingClientRect();setPoint(offset+Math.max(0,Math.min(1,((e.clientX-b.left)/b.width*738-40)/680))*(1-offset))}} onPointerLeave={()=>setPoint(null)} onBlur={()=>setPoint(null)} onKeyDown={e=>{if(noData)return;if(['ArrowLeft','ArrowRight','Home','End','Escape'].includes(e.key)){e.preventDefault();e.stopPropagation();setPoint(e.key==='Escape'?null:e.key==='Home'?offset:e.key==='End'?1:Math.max(offset,Math.min(1,(point??1)+(e.key==='ArrowLeft'?-1:1)/182)))}}}>
 {(queryData?[0,33,67,100]:[0,1000,2000,3000]).map((n,i)=><text key={n} x="27" y={148-i*40.667} textAnchor="end" fill="#777780" fontSize={queryData?10:11}>{queryData?`${n}%`:n?n/1000+'k':'0'}</text>)}
 {point!==null&&<g><line x1={x} x2={x} y1="22" y2="144" stroke="#9a9ef0" strokeDasharray="3 4" strokeOpacity=".5"/><circle cx={x} cy={value.y} r="3.5" fill="#d4d6ff" stroke="#6571ef" strokeWidth="2"/></g>}
 </svg><div className="zebra-months">{labels.map(m=><span key={m}>{m}</span>)}</div>
 {noData?<span className="zebra-empty">No results yet</span>:<span className="zebra-latest" aria-label={`${date}: ${format(value.value)} appearances`} style={point===null&&!queryData?undefined:{left:`clamp(70px, ${x/738*100}%, calc(100% - ${point===null?38:70}px))`,right:'auto',top:`calc(${value.y/174*100}% - 10px)`,transform:'translate(-50%, -100%)'}}>{point===null?(queryData?format(value.value):'2,846'):`${date} · ${format(value.value)}`}</span>}
 </div></Panel>
}

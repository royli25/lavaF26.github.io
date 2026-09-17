export type Page = 'Overview' | 'Appearance' | 'Search activity' | 'Opportunities' | 'Competitors' | 'Reports' | 'Settings'
export const comingSoonPages: readonly Page[] = ['Search activity', 'Opportunities', 'Competitors', 'Reports']

export type Period = '7' | '28' | '90'
export type Model = 'ChatGPT' | 'Perplexity' | 'Gemini' | 'Claude' | 'DeepSeek' | 'Grok' | 'Copilot' | 'Meta AI' | 'Mistral' | 'Qwen'
export type Query = { id: string; text: string; models: Model[]; rate: number | null; losingTo?: 'Linear' | 'Notion' | 'Monday' | 'Mailchimp' | 'Semrush' | 'Buffer' | 'Webflow' }

export const navigation: { name: Page; icon: string }[] = [
  { name: 'Overview', icon: 'imgIconHome' },
  { name: 'Appearance', icon: 'imgIconChart' },
  { name: 'Search activity', icon: 'imgIconActivity' },
  { name: 'Opportunities', icon: 'imgIconSpark1' },
  { name: 'Competitors', icon: 'imgIconUsers' },
  { name: 'Reports', icon: 'imgIconFile' },
]

export const months = [
  { month: 'Apr', full: 'April', appearances: 880 },
  { month: 'May', full: 'May', appearances: 1140 },
  { month: 'Jun', full: 'June', appearances: 1520 },
  { month: 'Jul', full: 'July', appearances: 1940 },
  { month: 'Aug', full: 'August', appearances: 2400 },
  { month: 'Sep', full: 'September', appearances: 2846 },
]

export const periodMetrics: Record<Period, { score: string; appearances: string; share: string; opportunities: string; deltas: string[] }> = {
  '7': { score: '72.4', appearances: '768', share: '26.1%', opportunities: '6', deltas: ['2.1 points', '12.4%', '1.3 points'] },
  '28': { score: '72.4', appearances: '2,846', share: '24.8%', opportunities: '18', deltas: ['8.4 points', '18.6%', '3.2 points'] },
  '90': { score: '72.4', appearances: '7,186', share: '22.6%', opportunities: '32', deltas: ['15.2 points', '49.8%', '6.8 points'] },
}

export const models: { name: Model; rate: number; change: string; warm?: boolean }[] = [
  { name: 'ChatGPT', rate: 76, change: '+9.2' },
  { name: 'Perplexity', rate: 68, change: '-6.1' },
  { name: 'Gemini', rate: 61, change: '+4.8' },
  { name: 'Claude', rate: 54, change: '-3.4' },
]

// Additional demo coverage used by the Appearance screen.
export const appearanceModels = [...models,
  { name: 'DeepSeek' as Model, rate: 49, change: '+5.7' },
  { name: 'Grok' as Model, rate: 43, change: '+3.2' },
  { name: 'Copilot' as Model, rate: 38, change: '-2.4' },
  { name: 'Meta AI' as Model, rate: 32, change: '+4.1' },
  { name: 'Mistral' as Model, rate: 26, change: '+1.8' },
  { name: 'Qwen' as Model, rate: 21, change: '+2.6' },
]

export const appearanceQueries: Query[] = [
  { id: 'ai-visibility', losingTo: 'Semrush', text: 'Best AI visibility tools', rate: 92, models: appearanceModels.map(m => m.name) },
  { id: 'brand-mentions', losingTo: 'Semrush', text: 'How to track brand mentions', rate: 86, models: appearanceModels.map(m => m.name) },
  { id: 'ai-analytics', losingTo: 'Semrush', text: 'AI search analytics platforms', rate: 80, models: appearanceModels.map(m => m.name) },
  { id: 'chatgpt-visibility', losingTo: 'Semrush', text: 'Improve visibility in ChatGPT', rate: 74, models: appearanceModels.map(m => m.name) },
  { id: 'search-roi', losingTo: 'Semrush', text: 'Measure generative search ROI', rate: 68, models: appearanceModels.map(m => m.name) },
  { id: 'seo-templates', losingTo: 'Semrush', text: 'Free SEO reporting templates', rate: 3.8, models: appearanceModels.map(m => m.name) },
  { id: 'social-tools', losingTo: 'Buffer', text: 'Social media scheduling tools', rate: 9.2, models: appearanceModels.map(m => m.name) },
  { id: 'email-tools', losingTo: 'Mailchimp', text: 'Best email marketing software', rate: 2.4, models: appearanceModels.map(m => m.name) },
  { id: 'landing-page', losingTo: 'Webflow', text: 'How to build a landing page', rate: 16, models: appearanceModels.map(m => m.name) },
  { id: 'traffic-benchmarks', losingTo: 'Semrush', text: 'Website traffic benchmarks', rate: 4.9, models: appearanceModels.map(m => m.name) },
]

export const competitors = [
  { name: 'Acme', domain: 'acme.com', score: 72.4, change: '+8.4', appearances: 2846, share: '24.8%' },
  { name: 'Linear', domain: 'linear.app', score: 68.1, change: '+3.2', appearances: 1920, share: '21.3%' },
  { name: 'Notion', domain: 'notion.so', score: 63.8, change: '−1.1', appearances: 1742, share: '19.7%' },
  { name: 'Monday', domain: 'monday.com', score: 51.2, change: '+2.6', appearances: 1236, share: '14.2%' },
]

export const initialQueries: Query[] = [
  { id: 'startup', losingTo: 'Linear', text: 'Best project management tool for startups', models: appearanceModels.map(m => m.name), rate: 12 },
  { id: 'linear', losingTo: 'Notion', text: 'Linear alternatives for small teams', models: appearanceModels.map(m => m.name), rate: 18 },
  { id: 'launch', losingTo: 'Monday', text: 'How to manage a product launch', models: appearanceModels.map(m => m.name), rate: 24 },
  { id: 'planning', losingTo: 'Monday', text: 'Affordable team planning software', models: appearanceModels.map(m => m.name), rate: 31 },
  { id: 'async', losingTo: 'Notion', text: 'Best async collaboration tools', models: appearanceModels.map(m => m.name), rate: 36 },
]

export const activities = [
  { id: 1, title: 'New mention in ChatGPT', query: 'Best project tools for small teams', time: '12 min ago', model: 'ChatGPT' as Model, competitor: false, detail: 'Acme appeared as a recommended option in the sampled answer, alongside Linear and Notion.', source: 'acme.com/features' },
  { id: 2, title: 'Linear gained 3 citations', query: 'Project management for startups', time: '38 min ago', model: 'ChatGPT' as Model, competitor: true, detail: 'Linear gained three new citations across the latest sampled answers for this query.', source: 'linear.app/features' },
  { id: 3, title: 'Your guide was cited', query: 'How to plan a product launch', time: '1 hr ago', model: 'Perplexity' as Model, competitor: false, detail: 'Your product launch guide was included as a source in a sampled Perplexity response.', source: 'acme.com/guides/product-launch' },
  { id: 4, title: 'Acme joined the shortlist', query: 'Affordable team planning software', time: '3 hr ago', model: 'Gemini' as Model, competitor: false, detail: 'Acme appeared in the top three recommendations in the latest sampled answer.', source: 'acme.com/pricing' },
  { id: 5, title: 'Notion appeared in a new answer', query: 'Best async collaboration tools', time: '5 hr ago', model: 'Claude' as Model, competitor: true, detail: 'Notion was mentioned in a new sampled answer about asynchronous team collaboration.', source: 'notion.so/product' },
]

export const opportunities = [
  { id: 'comparison', title: 'Own the startup comparison', impact: 'High impact', count: '8 queries', description: 'Acme is missing from eight high-intent comparison answers that mention your competitors.', action: 'Publish a comparison page covering startup use cases, pricing, and integrations. Give each claim a specific example.', queries: ['Best project management tool for startups', 'Linear alternatives for small teams'] },
  { id: 'pricing', title: 'Refresh your pricing page', impact: 'Quick win', count: '4 answers', description: 'Four sampled answers still cite an older Acme plan.', action: 'Update your pricing page with current plans, clear feature comparisons, and a visible last-updated date.', queries: ['Affordable team planning software', 'Acme pricing for small teams'] },
  { id: 'launch', title: 'Build on your launch guide', impact: 'High impact', count: '3 queries', description: 'Your launch guide is being cited, but related planning queries still favor competitors.', action: 'Expand the guide with a launch checklist, an example timeline, and links to your planning features.', queries: ['How to manage a product launch', 'Product launch checklist for startups'] },
]

export function validateQueries(input: string, existing: string[], remaining: number): { queries: string[]; error: string } {
  const lines = input.split('\n').map(s => s.trim()).filter(Boolean)
  if (!lines.length) return { queries: [], error: 'Enter at least one search query.' }
  if (lines.some(s => s.length > 180)) return { queries: [], error: 'Keep each query under 180 characters.' }
  const known = new Set(existing.map(s => s.toLowerCase()))
  const queries = lines.filter(s => { const key = s.toLowerCase(); if (known.has(key)) return false; known.add(key); return true })
  if (!queries.length) return { queries: [], error: 'These queries are already tracked.' }
  if (queries.length > 20) return { queries: [], error: 'Add up to 20 queries at a time.' }
  if (queries.length > remaining) return { queries: [], error: `You have room for ${remaining} more queries on this plan.` }
  return { queries, error: '' }
}

export function loadSavedQueries(): Query[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem('lava-queries-v1') || '[]')
    if (!Array.isArray(stored)) return []
    return stored.filter((q): q is Query => Boolean(q && typeof q === 'object' && typeof q.id === 'string' && typeof q.text === 'string' && Array.isArray(q.models) && q.models.every((m: unknown) => models.some(model => model.name === m)) && q.rate === null)).slice(0, 72)
  } catch { return [] }
}

export function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map(row => row.map(value => {
    let text = String(value)
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
    return `"${text.replaceAll('"', '""')}"`
  }).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url; link.download = name; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

# Lava dashboard

A responsive React implementation of the [Lava overview design](https://www.figma.com/design/u2hOnqBvCMFgtCibZUyPhm/Lavalab?node-id=12-1001).

## Run

```sh
npm install
npm run dev
```

## Verify

```sh
npm run build
npm test
npm run test:e2e
```

React + TypeScript + Vite, shadcn/ui (Radix primitives), Tailwind CSS v4, locally bundled Geist, Recharts, and the original Figma icon assets. No external asset URLs are required at runtime.

The overview includes six months of appearance history, reporting-period filters, model coverage, opportunities, competitors, and search activity. The sidebar opens supporting views. Query creation validates and deduplicates input, supports model selection, and persists to localStorage. Opportunity action plans also persist locally. Reports and tracked queries export as CSV.

All analytics are illustrative sample data. Saved queries do not trigger actual search monitoring. Connect an analytics API and authentication before using this as a live product.

### Structure

- `src/App.tsx`: dashboard, supporting views, and dialogs
- `src/AppearanceChart.tsx`: separately loaded interactive six-month chart
- `src/components.tsx`: shared shadcn Card and Select compositions, plus Figma icons
- `src/AppSidebar.tsx`: shadcn Sidebar with mobile Sheet and collapsed tooltips
- `src/components/ui`: editable shadcn primitives installed from the official registry
- `src/shadcn.css`: Tailwind setup and dark semantic theme tokens
- `components.json`: shadcn CLI configuration
- `src/data.ts`: typed sample data, query validation, persistence, and CSV export
- `src/styles.css`: design tokens, component styles, and responsive layouts
- `public/assets`: original exported Figma SVG assets
- `tests`: browser interaction and responsive checks

The Playwright tests require Chromium (`npx playwright install chromium`).

### UI components

Controls, cards, badges, tables, forms, dialogs, the responsive sidebar, progress bars, avatars, notifications, and chart tooltips use shadcn components. Application layout and Figma-specific visual styling remain in `src/styles.css`. Chart data and geometry remain in Recharts through shadcn's `ChartContainer`.

Add future primitives with `npx shadcn@latest add <component>`. The `@/` alias points to `src/`. Prefer compositions of the existing primitives instead of adding native control implementations. The Progress primitive forwards its value to Radix for accessibility; the controlled dashboard dialog restores focus to its originating control on close.

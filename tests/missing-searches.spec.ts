import { expect, test } from '@playwright/test'

test('missing searches match the demo and fit desktop and mobile', async ({ page }) => {
  await page.goto('/')
  const card = page.getByRole('region', { name: 'Missing Searches', exact: true })
  await expect(card.locator('.missing-search-query')).toHaveText([
    'USC student startup accelerators', 'Entrepreneurship clubs at USC', 'Venture capital programs for students',
  ])
  await expect(card.locator('.missing-search-row img')).toHaveCount(0)
  await expect(card.locator('.opportunity-number')).toHaveText(['01', '02', '03'])
  await expect.poll(() => card.locator('img').evaluateAll(images => images.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true)
  for (const width of [1470, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: 920 })
    await page.evaluate(() => document.fonts.ready)
    expect(await card.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
    expect(await card.locator('.missing-search-query').evaluateAll(nodes => nodes.every(node => node.scrollWidth <= node.clientWidth))).toBe(true)
    await expect(card.locator('.missing-search-row').first()).toHaveCSS('border-radius', '12px')
    if (width === 1470 || width === 390) await card.screenshot({ path: `test-results/missing-searches-${width}.png` })
  }
  await card.getByRole('button', { name: 'View all' }).click()
  await expect(page).toHaveURL(/#Opportunities$/)
})

test('Implement opens query setup and saves the suggested searches', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('region', { name: 'Missing Searches' }).getByRole('button', { name: 'Implement', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByLabel('Search queries', { exact: true })).toHaveValue('USC student startup accelerators\nEntrepreneurship clubs at USC\nVenture capital programs for students')
  await dialog.getByRole('button', { name: 'Add queries', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lava-queries-v1') || '[]'))
  expect(saved.map((query: { text: string }) => query.text)).toEqual(['USC student startup accelerators', 'Entrepreneurship clubs at USC', 'Venture capital programs for students'])
})

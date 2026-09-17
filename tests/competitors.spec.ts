import { expect, test } from '@playwright/test'

test('competitor card preserves the approved ranking, assets, and non-interactive rows', async ({ page }) => {
  await page.goto('/')
  const card = page.getByRole('region', { name: 'Competitors', exact: true })
  await expect(card.locator('.campus-name')).toHaveText(['SparkSC', 'Sigma Eta Pi', 'LavaLab', 'TroyLabs', 'VC Academy'])
  await expect(card.locator('.campus-total')).toHaveText(['12,480', '9,620', '8,500', '7,840', '6,210'])
  await expect(card.locator('.is-own')).toContainText('LavaLab')
  await expect.poll(() => card.locator('img').evaluateAll(images => images.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true)
  await expect(card.locator('.campus-ranking button, .campus-ranking a, .campus-ranking [tabindex]')).toHaveCount(0)
  await card.locator('.campus-competitor').first().click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  for (const width of [1470, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: 920 })
    await page.evaluate(() => document.fonts.ready)
    const highlight = await card.locator('.campus-competitor.is-own').evaluate(row => {
      const paint = getComputedStyle(row, '::before')
      return { position: getComputedStyle(row).position, rowHeight: row.getBoundingClientRect().height, paintHeight: parseFloat(paint.height), left: paint.left, right: paint.right }
    })
    expect(highlight.position).toBe('relative')
    expect(highlight.paintHeight).toBe(highlight.rowHeight)
    expect([highlight.left, highlight.right]).toEqual(['-8px', '-8px'])
    expect(await card.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
    expect(await card.locator('.campus-name').evaluateAll(nodes => nodes.every(node => node.scrollWidth <= node.clientWidth))).toBe(true)
    if (width === 1470 || width === 390) await card.screenshot({ path: `test-results/competitors-${width}.png` })
  }
})

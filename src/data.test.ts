import test from 'node:test'
import assert from 'node:assert/strict'
import { appearanceModels, loadSavedQueries, validateQueries } from './data.ts'

test('new queries are trimmed and deduplicated against saved queries and the current batch', () => {
  assert.deepEqual(validateQueries('  Existing query\nNew query\nnew QUERY\n\nAnother query ', ['existing QUERY'], 2), { queries: ['New query', 'Another query'], error: '' })
})

test('quota applies to distinct new queries and never allows an oversized batch', () => {
  assert.match(validateQueries('One\nTwo', [], 1).error, /room for 1/)
  assert.match(validateQueries(Array.from({ length: 21 }, (_, i) => `Query ${i}`).join('\n'), [], 72).error, /20 queries/)
  assert.equal(validateQueries('One\nOne', [], 1).queries.length, 1)
})

test('empty, oversized, and already tracked queries produce actionable errors', () => {
  assert.match(validateQueries(' \n ', [], 72).error, /at least one/)
  assert.match(validateQueries('a'.repeat(181), [], 72).error, /180 characters/)
  assert.match(validateQueries('Tracked', ['tracked'], 72).error, /already tracked/)
})


test('saved queries retain every supported model and reject unknown providers', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const saved = { id: 'all-models', text: 'Find startup mentors', models: appearanceModels.map(model => model.name), rate: null }
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => JSON.stringify([saved, { ...saved, id: 'invalid', models: ['Unknown provider'] }]) } })
  try {
    assert.deepEqual(loadSavedQueries(), [saved])
    assert.ok(loadSavedQueries()[0].models.includes('DeepSeek'))
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  }
})

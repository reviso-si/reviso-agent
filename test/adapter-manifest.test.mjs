import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateFile, validateManifest } from '../scripts/validate-adapter-manifest.mjs'

const validPath = new URL('../contracts/fixtures/adapter-manifest.valid.json', import.meta.url)
const invalidPath = new URL('../contracts/fixtures/adapter-manifest.invalid.json', import.meta.url)

test('accepts the valid adapter fixture', async () => {
  assert.deepEqual(await validateFile(validPath), [])
})

test('rejects the invalid adapter fixture with actionable errors', async () => {
  const errors = await validateFile(invalidPath)
  assert.ok(errors.length >= 5)
  assert.ok(errors.some(e => e.includes('adapter must match')))
  assert.ok(errors.some(e => e.includes('authentication')))
  assert.ok(errors.some(e => e.includes('session_identity')))
  assert.ok(errors.some(e => e.includes('surfaces')))
  assert.ok(errors.some(e => e.includes('unsupported')))
})

test('rejects duplicate and missing operation declarations', () => {
  const errors = validateManifest({
    contract_version: '1',
    adapter: 'sample',
    authentication: ['bearer-config'],
    session_identity: 'none',
    surfaces: ['cli'],
    operations: ['publish', 'publish'],
    unsupported: ['list', 'list'],
    install: 'install',
    uninstall: 'uninstall',
  })
  assert.ok(errors.some(e => e.includes('operations must not contain duplicates')))
  assert.ok(errors.some(e => e.includes('unsupported must not contain duplicates')))
})

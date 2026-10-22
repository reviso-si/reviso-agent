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
  assert.ok(errors.some(e => e.includes('cross_host.write_idempotency')))
  assert.ok(errors.some(e => e.includes('cross_host.provenance_pair')))
  assert.ok(errors.some(e => e.includes('cross_host.review_url')))
  assert.ok(errors.some(e => e.includes('cross_host.error_classes')))
  assert.ok(errors.some(e => e.includes('cross_host.embed_revoke')))
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
    cross_host: {
      write_idempotency: 'operation_id_reused_on_retry',
      provenance_pair: ['source_kind', 'source_session_id'],
      review_url: 'canonical_absolute',
      error_classes: ['not_connected', 'auth_expired', 'forbidden', 'not_found', 'conflict', 'unavailable', 'unsupported'],
      embed_revoke: 'required_when_embedded',
    },
    install: 'install',
    uninstall: 'uninstall',
  })
  assert.ok(errors.some(e => e.includes('operations must not contain duplicates')))
  assert.ok(errors.some(e => e.includes('unsupported must not contain duplicates')))
})

test('rejects additional fields and operation overlap to match the schema', () => {
  const errors = validateManifest({
    contract_version: '1',
    adapter: 'sample',
    authentication: ['bearer-config'],
    session_identity: 'none',
    surfaces: ['cli'],
    operations: ['publish', 'list'],
    unsupported: ['publish'],
    cross_host: {
      write_idempotency: 'operation_id_reused_on_retry',
      provenance_pair: ['source_kind', 'source_session_id'],
      review_url: 'canonical_absolute',
      error_classes: ['not_connected', 'auth_expired', 'forbidden', 'not_found', 'conflict', 'unavailable', 'unsupported'],
      embed_revoke: 'required_when_embedded',
    },
    install: 'install',
    uninstall: 'uninstall',
    surprise: true,
  })
  assert.ok(errors.some(e => e.includes('unexpected field: surprise')))
  assert.ok(errors.some(e => e.includes('operations and unsupported must not overlap')))
})

test('requires the shared cross-host behavior block', () => {
  const errors = validateManifest({
    contract_version: '1',
    adapter: 'sample',
    authentication: ['bearer-config'],
    session_identity: 'none',
    surfaces: ['cli'],
    operations: ['publish', 'list', 'open', 'connect', 'status'],
    unsupported: [],
    install: 'install',
    uninstall: 'uninstall',
  })
  assert.ok(errors.some(e => e.includes('missing required field: cross_host')))
})

test('rejects partial provenance and non-canonical cross-host behavior', () => {
  const errors = validateManifest({
    contract_version: '1',
    adapter: 'sample',
    authentication: ['bearer-config'],
    session_identity: 'none',
    surfaces: ['embed'],
    operations: ['publish', 'list', 'open', 'connect', 'status'],
    unsupported: [],
    cross_host: {
      write_idempotency: 'fresh_key_each_retry',
      provenance_pair: ['source_kind'],
      review_url: 'relative_path',
      error_classes: ['not_connected'],
      embed_revoke: 'optional',
      surprise: true,
    },
    install: 'install',
    uninstall: 'uninstall',
  })
  assert.ok(errors.some(e => e.includes('unexpected field: cross_host.surprise')))
  assert.ok(errors.some(e => e.includes('cross_host.write_idempotency')))
  assert.ok(errors.some(e => e.includes('cross_host.provenance_pair')))
  assert.ok(errors.some(e => e.includes('cross_host.review_url')))
  assert.ok(errors.some(e => e.includes('cross_host.error_classes')))
  assert.ok(errors.some(e => e.includes('cross_host.embed_revoke')))
})


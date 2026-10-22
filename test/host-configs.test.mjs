import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const fixture = new URL('../contracts/fixtures/mcp-config.valid.json', import.meta.url)
const schemaFixture = new URL('../contracts/adapter-manifest.schema.json', import.meta.url)
const validAdapterFixture = new URL('../contracts/fixtures/adapter-manifest.valid.json', import.meta.url)
const root = new URL('../', import.meta.url)

test('parses the canonical hosted/stdio MCP config fixture', async () => {
  const config = JSON.parse(await readFile(fixture, 'utf8'))
  assert.deepEqual(Object.keys(config.mcpServers), ['reviso'])
  assert.equal(config.mcpServers.reviso.args.join(' '), '-m reviso.cli mcp')
  assert.equal(config.mcpServers.reviso.env.REVISO_SERVER, 'https://reviso.work')
})

test('host config kits document required capability and credential fields', async () => {
  const names = ['claude-code', 'codex', 'cursor', 'vscode', 'openclaw']
  for (const name of names) {
    const path = new URL(`../docs/host-configs/${name}.md`, import.meta.url)
    const text = await readFile(path, 'utf8')
    for (const heading of ['Transport:', 'Auth mode:', 'Session identity:', 'Install', 'Remove', 'Missing credential']) {
      assert.ok(text.includes(heading), `${name}.md is missing ${heading}`)
    }
    assert.ok(!text.includes('token='), `${name}.md appears to contain a token URL`)
  }
})

test('documents one verified CLI stdio entry point across MCP setup docs', async () => {
  const setup = await readFile(new URL('../references/mcp-setup.md', import.meta.url), 'utf8')
  const fixtureText = await readFile(fixture, 'utf8')
  assert.ok(setup.includes('"args": ["-m", "reviso.cli", "mcp"]'))
  assert.ok(!setup.includes('"args": ["-m", "reviso", "mcp"]'))
  assert.ok(fixtureText.includes('"reviso.cli", "mcp"'))
})

test('keeps cross-host constants aligned across schema, fixture, and contract', async () => {
  const schema = JSON.parse(await readFile(schemaFixture, 'utf8'))
  const manifest = JSON.parse(await readFile(validAdapterFixture, 'utf8'))
  const contract = await readFile(new URL('docs/host-integration-contract.md', root), 'utf8')
  const properties = schema.properties.cross_host.properties

  assert.deepEqual(manifest.cross_host.error_classes, properties.error_classes.const)
  assert.deepEqual(manifest.cross_host.provenance_pair, properties.provenance_pair.const)
  assert.equal(manifest.cross_host.review_url, properties.review_url.const)
  assert.equal(manifest.cross_host.write_idempotency, properties.write_idempotency.const)
  assert.equal(manifest.cross_host.embed_revoke, properties.embed_revoke.const)

  for (const errorClass of properties.error_classes.const) {
    assert.ok(contract.includes(errorClass), `contract is missing ${errorClass}`)
  }
  assert.ok(contract.includes('operation_id'))
  assert.ok(contract.includes('canonical, absolute Reviso `review_url`'))
  assert.ok(contract.includes('all-or-none pair'))
  assert.ok(contract.includes('revoke the embedded Reviso session'))
})

test('MCP and CLI references document retries, provenance, and canonical URLs', async () => {
  const mcp = await readFile(new URL('references/mcp-tools.md', root), 'utf8')
  const cli = await readFile(new URL('references/cli-usage.md', root), 'utf8')

  for (const rawText of [mcp, cli]) {
    const text = rawText.replace(/\s+/g, ' ')
    assert.ok(text.includes('all-or-none pair'))
    assert.ok(text.includes('canonical absolute'))
    for (const errorClass of ['not_connected', 'auth_expired', 'forbidden', 'not_found', 'conflict', 'unavailable', 'unsupported']) {
      assert.ok(text.includes(errorClass), `reference is missing ${errorClass}`)
    }
  }

  assert.ok(mcp.includes('reviso_document_create')
    && mcp.includes('operation_id')
    && mcp.includes('idempotency_key'))
  assert.ok(cli.includes('--json')
    && cli.includes('--base-version-id')
    && cli.includes('--force-latest'))
})


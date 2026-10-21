import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const fixture = new URL('../contracts/fixtures/mcp-config.valid.json', import.meta.url)

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


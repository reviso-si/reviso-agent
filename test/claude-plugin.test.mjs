import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const marketplaceFile = '.claude-plugin/marketplace.json'

test('the Claude plugin exposes the root skill and its reference files', async () => {
  const plugin = JSON.parse(await readFile(join(root, '.claude-plugin/plugin.json'), 'utf8'))
  const directory = resolve(root, plugin.skills)
  const skill = await readFile(join(directory, 'SKILL.md'), 'utf8')
  assert.match(skill, /^name: reviso$/m)
  const references = [...skill.matchAll(/\]\((references\/[^)]+)\)/g)]
  assert.ok(references.length)
  for (const [, reference] of references) assert.ok((await readFile(join(directory, reference))).length)
})

test('a fresh Claude Code session discovers the installed marketplace skill', async t => {
  if (spawnSync('claude', ['--version']).error?.code === 'ENOENT') {
    return t.skip('Claude Code is unavailable')
  }
  const temp = await mkdtemp(join(tmpdir(), 'reviso-agent-install-'))
  t.after(() => rm(temp, { recursive: true, force: true }))
  const market = join(temp, 'market')
  const project = join(temp, 'project')
  await mkdir(project)
  await mkdir(join(market, '.claude-plugin'), { recursive: true })
  await cp(root, join(market, 'reviso'), { recursive: true, filter: path => basename(path) !== '.git' })
  const manifest = JSON.parse(await readFile(join(root, marketplaceFile), 'utf8'))
  const entry = manifest.plugins.find(plugin => plugin.name === 'reviso')
  assert.deepEqual(entry.source, { source: 'github', repo: 'reviso-si/reviso-agent', ref: 'main' })
  entry.source = './reviso'
  await writeFile(join(market, marketplaceFile), JSON.stringify(manifest))
  const env = { PATH: process.env.PATH, CLAUDE_CONFIG_DIR: join(temp, 'config'),
    XDG_CONFIG_HOME: join(temp, 'xdg'), XDG_CACHE_HOME: join(temp, 'cache'),
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1', DISABLE_AUTOUPDATER: '1' }
  const options = { cwd: project, env, encoding: 'utf8', timeout: 30000 }
  execFileSync('git', ['init', '-q'], options)
  execFileSync('claude', ['plugin', 'validate', join(root, marketplaceFile)], options)
  execFileSync('claude', ['plugin', 'marketplace', 'add', market, '--scope', 'project'], options)
  execFileSync('claude', ['plugin', 'install', 'reviso@reviso-agent', '--scope', 'project'], options)
  const request = { type: 'control_request', request_id: 'skills', request: { subtype: 'initialize' } }
  const output = execFileSync('claude', ['-p', '--verbose', '--input-format', 'stream-json',
    '--output-format', 'stream-json', '--no-session-persistence', '--setting-sources', 'user,project,local',
    '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}'], { ...options, input: JSON.stringify(request) + '\n' })
  const response = output.trim().split('\n').map(line => JSON.parse(line))
    .find(message => message.type === 'control_response' && message.response.request_id === 'skills')
  assert.equal(response?.response.subtype, 'success')
  assert.ok(response.response.response.commands.some(({ name }) => name === 'reviso' || name === 'reviso:reviso'))
})

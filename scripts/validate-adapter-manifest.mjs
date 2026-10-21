#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const AUTH_MODES = new Set(['native-host-bridge', 'local-oauth-store', 'bearer-config'])
const SESSION_MODES = new Set(['native-session', 'workspace-context', 'none'])
const OPERATIONS = new Set(['publish', 'list', 'open', 'connect', 'status'])
const FIELDS = new Set(['contract_version', 'adapter', 'authentication', 'session_identity', 'surfaces', 'operations', 'unsupported', 'install', 'uninstall', 'update'])

function isStringArray(value, allowed) {
  return Array.isArray(value) && value.every(item => typeof item === 'string' && (allowed === undefined || allowed.has(item)))
}

export function validateManifest(value) {
  const errors = []
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return ['manifest must be a JSON object']
  }
  const required = ['contract_version', 'adapter', 'authentication', 'session_identity', 'surfaces', 'operations', 'unsupported', 'install', 'uninstall']
  for (const key of required) if (!(key in value)) errors.push(`missing required field: ${key}`)
  for (const key of Object.keys(value)) if (!FIELDS.has(key)) errors.push(`unexpected field: ${key}`)
  if (value.contract_version !== '1') errors.push('contract_version must be "1"')
  if (typeof value.adapter !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/.test(value.adapter)) {
    errors.push('adapter must match ^[a-z0-9][a-z0-9._-]*$')
  }
  if (!isStringArray(value.authentication, AUTH_MODES) || value.authentication.length === 0) {
    errors.push('authentication must be a non-empty array of supported auth modes')
  }
  if (!SESSION_MODES.has(value.session_identity)) errors.push('session_identity is not supported')
  if (!isStringArray(value.surfaces) || value.surfaces.length === 0 || value.surfaces.some(s => s.length === 0)) {
    errors.push('surfaces must be a non-empty array of non-empty strings')
  }
  if (!isStringArray(value.operations, OPERATIONS) || value.operations.length === 0) {
    errors.push('operations must be a non-empty array of supported operations')
  }
  if (!isStringArray(value.unsupported, OPERATIONS)) errors.push('unsupported must be an array of supported operations')
  for (const key of ['install', 'uninstall']) {
    if (typeof value[key] !== 'string' || value[key].length === 0) errors.push(`${key} must be a non-empty string`)
  }
  if ('update' in value && (typeof value.update !== 'string' || value.update.length === 0)) {
    errors.push('update must be a non-empty string when present')
  }
  if (Array.isArray(value.authentication) && new Set(value.authentication).size !== value.authentication.length) errors.push('authentication must not contain duplicates')
  if (Array.isArray(value.surfaces) && new Set(value.surfaces).size !== value.surfaces.length) errors.push('surfaces must not contain duplicates')
  if (Array.isArray(value.operations) && new Set(value.operations).size !== value.operations.length) errors.push('operations must not contain duplicates')
  if (Array.isArray(value.unsupported) && new Set(value.unsupported).size !== value.unsupported.length) errors.push('unsupported must not contain duplicates')
  if (Array.isArray(value.operations) && Array.isArray(value.unsupported)) {
    const overlap = value.operations.filter((operation) => value.unsupported.includes(operation))
    if (overlap.length > 0) errors.push(`operations and unsupported must not overlap: ${overlap.join(', ')}`)
  }
  return errors
}

export async function validateFile(path) {
  let value
  try {
    value = JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    return [`cannot read JSON: ${error instanceof Error ? error.message : String(error)}`]
  }
  return validateManifest(value)
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const path = process.argv[2]
  if (path === undefined) {
    console.error('usage: node scripts/validate-adapter-manifest.mjs <manifest.json>')
    process.exit(2)
  }
  const errors = await validateFile(path)
  if (errors.length > 0) {
    for (const error of errors) console.error(`invalid: ${error}`)
    process.exit(1)
  }
  console.log(`valid: ${path}`)
}

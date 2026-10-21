# Reviso host integration contract

Status: v1 draft, 2026-10-21

This document is the architecture decision and discovery contract for exposing
Reviso inside agent hosts. It keeps Reviso as the only capability source and
makes each host adapter a thin, independently publishable integration.

## Decision

Reviso owns documents, versions, comments, permissions, provenance,
`session_key`, OAuth, and the `/mcp` endpoint. Host adapters do not copy those
semantics. They translate one host's capabilities into the common operations
below.

```text
reviso
  = capability source: document/version/comment/permission model,
    session_key, OAuth, /mcp

integration contract
  = discovery, authentication modes, operations, session identity,
    error shape, adapter manifest

host adapters
  = transport, credential placement, UI slot/command/webview, manifest

MCP
  = generic call protocol; not the only route

CLI
  = optional local auth/refresh/stdio bridge, not a required host layer
```

DSH uses a native host bridge and does not require the CLI. MCP-native hosts
can use `/mcp` with their own credential configuration. Local hosts without a
native bridge may use the CLI. The CLI is not a prerequisite for DSH, VS Code,
or any host that already provides a credential and transport bridge.

## Host surfaces

Keep these browser-related surfaces distinct:

| Surface | Ownership | Contract |
| --- | --- | --- |
| Reviso Web | Reviso product | existing user-facing review surface |
| Browser extension | host adapter | Chrome/Edge packaging and permissions |
| Embedded web | integration surface | iframe/web component plus postMessage bridge |
| VS Code webview | VS Code adapter | extension-owned UI, not a standalone browser adapter |

An embedded surface may render a Reviso document, but it must not acquire
product credentials directly. The host remains responsible for authentication
and for passing only the minimum necessary context to the embedded surface.

## Common operations

Every adapter exposes the same logical operations, subject to the host
capability matrix:

- `publish(document, provenance)`: create or update through Reviso's existing
  publish path. The adapter supplies `source_kind` and, when available, a bare
  `source_session_id`; Reviso forms `session_key` as `kind:id`.
- `list(session?)`: read documents visible to the current connection. Session
  filtering is used only when the host has a stable session identity.
- `open(document)`: return a canonical Reviso URL or open the host's native
  document surface.
- `connect()`: start the host-appropriate authorization flow.
- `status()`: report connected, missing credential, expired credential, or
  host capability limitations.

Adapters must not invent a local document model. The Reviso API and its
`/mcp` tool catalog remain the source of truth for fields and operations.

## Authentication modes

Authentication is a host capability, not a universal browser rule:

| Mode | Used by | Token placement |
| --- | --- | --- |
| `native-host-bridge` | DSH, VS Code webview | host credential store; browser UI receives no Reviso token |
| `local-oauth-store` | Claude Code, Gemini CLI, Codex CLI | host/CLI local credential store with refresh |
| `bearer-config` | generic MCP, Cursor, Cline | MCP client configuration or process environment |

The host adapter must declare one mode. It must not silently fall back to a
different mode. An unauthenticated adapter must return a recoverable
`not_connected` result and show the host's connection instructions.

## Session identity

A stable user conversation session is optional. The adapter manifest declares:

- `native-session`: the host exposes a stable session identifier.
- `workspace-context`: only a workspace or project identity is available.
- `none`: only an MCP protocol session exists; do not claim user-session
  filtering.

Only `native-session` adapters may bind documents to a host session tab. The
other modes use workspace provenance or no automatic session association.
Never substitute the MCP transport session id for a user conversation id.

## Error shape

Adapters normalize host and transport failures into these classes:

```text
not_connected       no credential; show connect instructions
auth_expired        refresh failed; ask the user to reconnect
forbidden           Reviso permission denied; do not retry blindly
not_found           document or workspace is unavailable
conflict            version/hash precondition failed; re-read before writing
unavailable         transport or server failure; retry only read-only work
unsupported         host lacks the requested capability
```

The original Reviso error code and request id may be attached as diagnostics,
but adapters must not expose tokens or raw credentials.

## Adapter manifest

Each adapter publishes a manifest with at least:

```json
{
  "contract_version": "1",
  "adapter": "dsh",
  "authentication": ["native-host-bridge"],
  "session_identity": "native-session",
  "surfaces": ["slot", "tool"],
  "operations": ["publish", "list", "open", "connect", "status"],
  "install": "dsh plugin --profile web add <package>",
  "uninstall": "dsh plugin --profile web remove dsh-reviso"
}
```

Host-specific fields belong in the adapter section, not in the common contract.
The manifest is descriptive; the Reviso API remains authoritative.

The JSON Schema validates the manifest shape and the cross-field invariant
that `operations` and `unsupported` must be disjoint. The companion validator
implements the same rules for consumers that cannot run a JSON Schema engine;
both are covered by tests.

## Capability matrix

| Host | Primary transport | Authentication | Session identity | UI surface | Priority |
| --- | --- | --- | --- | --- | --- |
| DSH | native bundle + host tool | native-host-bridge | native-session | slot + tab | P0.1 |
| Generic MCP | hosted `/mcp` or CLI stdio | bearer-config or local-oauth-store | none | none | P0.2 |
| Claude Code | MCP + skill/plugin | local-oauth-store | capability dependent | skill + marketplace | P0.3 |
| Gemini CLI | extension + MCP | local-oauth-store | to be verified | extension | P1.0 |
| VS Code | MCP-only first | host secret or bearer | workspace-context | command | P1.1 |
| VS Code webview | extension + host bridge | native-host-bridge | workspace-context | webview | P1.2 |
| Cursor / Codex / Cline / Roo / Continue | MCP + rules/skill | bearer-config or local store | usually none | host-native | P2 |
| OpenClaw | plugin + hooks + MCP | host capability dependent | to be verified | plugin | P2 |

## Adapter template

Every adapter submission contains:

- adapter manifest and host package metadata
- install, uninstall, and update commands
- authentication implementation for exactly one declared mode
- `publish/list/open/session` behavior, with unsupported capabilities explicit
- contract tests against the common operations
- one real-host smoke test
- README with setup, rollback, and limitations
- evidence without credentials
- version and changelog

## Delivery order

1. Fix the DSH client type/import and `dsh.client.inject` manifest alignment.
2. Treat the existing Reviso `/mcp` endpoint and CLI stdio path as the shared
   MCP base; do not create a parallel MCP business server.
3. Finalize `reviso-agent` as the Claude Code marketplace/skill surface.
4. Add a Gemini CLI extension manifest over MCP.
5. Ship VS Code MCP-only before investing in a webview.
6. Add Cursor, Codex, Cline, Roo, Continue, and OpenClaw as config/rules
   adapters that reuse MCP; add native code only for a demonstrated host gap.

## Non-goals

- A second Reviso document or permission model.
- A universal agent plugin runtime.
- A new MCP business server when the existing endpoint already provides the
  needed tools.
- Claiming session binding on hosts without a stable user session.
- Copying the DSH OAuth bridge into hosts that do not provide equivalent
  credential isolation.

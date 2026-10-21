# Codex MCP setup

Transport: hosted HTTP MCP.

Auth mode: `local-oauth-store`; Codex owns its OAuth credentials.

Session identity: `none`. Do not treat the MCP transport session as a Codex
conversation session.

Install:

```bash
codex mcp add reviso --url https://reviso.work/mcp --oauth-client-registration dcr
codex mcp login reviso --oauth-client-registration dcr
```

Do not add `--oauth-resource`; discovery supplies it. Start a new Codex session
after configuration; existing sessions do not gain new tools.

Equivalent user configuration:

```toml
[mcp_servers.reviso]
url = "https://reviso.work/mcp"
```

Remove: remove the `mcp_servers.reviso` entry from Codex configuration and
restart the session.

Missing credential: run the Codex MCP login flow. Do not copy a Reviso key into
an argument, prompt or repository.

## Verification status

The P0 review verified `codex --help` and config-only MCP registration in an
isolated HOME. It did not verify a real login or a tool call. Treat the OAuth
commands above as requiring a final client-version check before documentation
is presented as production-ready.


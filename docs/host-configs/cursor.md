# Cursor MCP setup

Transport: hosted HTTP MCP or the user's local stdio configuration.

Auth mode: `bearer-config` or `local-oauth-store`, selected by the user's
Cursor MCP configuration.

Session identity: `workspace-context` at most. Cursor does not provide a
portable Reviso user-conversation id for this adapter.

Hosted endpoint:

```text
https://reviso.work/mcp
```

For a local stdio fallback, use the existing Reviso CLI/MCP package. Do not
start a new MCP server implementation.

Remove: delete the Reviso MCP entry from Cursor settings and restart the host.

Missing credential: show the Reviso connection instructions and stop. Do not
invent a session tab or publish automatically.

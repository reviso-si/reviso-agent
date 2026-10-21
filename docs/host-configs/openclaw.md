# OpenClaw MCP setup

Transport: hosted HTTP MCP when the installed OpenClaw build supports remote MCP;
otherwise use its local MCP/plugin configuration without creating a second
Reviso server.

Auth mode: `bearer-config` or the host's local credential store, whichever
OpenClaw actually exposes.

Session identity: `none` until OpenClaw provides and the adapter verifies a
stable user conversation id.

Endpoint:

```text
https://reviso.work/mcp
```

Remove: remove the Reviso MCP/plugin entry using OpenClaw's own plugin command
and restart the session.

Missing credential: direct the user to Reviso's hosted connection flow. Do not
add a custom Reviso business implementation to OpenClaw in this P0.

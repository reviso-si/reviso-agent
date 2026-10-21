# VS Code MCP-only setup

Transport: hosted HTTP MCP.

Auth mode: `bearer-config` until a VS Code host credential bridge is built.

Session identity: `workspace-context` at most. VS Code webview is not part of
this MCP-only slice.

Install the Reviso MCP endpoint using VS Code's MCP configuration UI or the
user's project-local MCP configuration. Use:

```text
https://reviso.work/mcp
```

Do not put a token in `.vscode/settings.json`, a workspace file or source
control. Use VS Code's secret/input mechanism when supported.

Remove: delete the Reviso MCP entry and reload the VS Code window.

Missing credential: show the MCP setup instructions. A full webview and native
host bridge are a later adapter phase, not claimed here.

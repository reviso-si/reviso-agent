# Claude Code MCP setup

Transport: hosted HTTP MCP.

Auth mode: `local-oauth-store` or `bearer-config`, depending on the Claude
Code connection flow the user chooses.

Session identity: `none` by default. Do not claim a Reviso session tab or bind
documents to a Claude conversation unless a stable host session identity is
available and explicitly implemented.

Install:

```
/plugin marketplace add reviso-si/reviso-agent
/plugin install reviso@reviso-agent
```

Then connect the Reviso MCP endpoint through Claude Code's MCP/connector
configuration. Reuse the hosted `/developers/mcp` flow rather than copying a
token into the repository.

Remove:

```
/plugin uninstall reviso@reviso-agent
```

Missing credential: show the hosted Reviso connection instructions. Never fall
back silently to the CLI. Never put a token in a skill, README or committed
configuration.

The installation test starts a fresh Claude Code session and checks that it
lists the Reviso skill. Connect the hosted MCP endpoint separately to use its tools.

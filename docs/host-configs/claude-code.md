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
/plugin install reviso
```

Then connect the Reviso MCP endpoint through Claude Code's MCP/connector
configuration. Reuse the hosted `/developers/mcp` flow rather than copying a
token into the repository.

Remove:

```
/plugin uninstall reviso
```

Missing credential: show the hosted Reviso connection instructions. Never fall
back silently to the CLI. Never put a token in a skill, README or committed
configuration.

Verification: `claude --help` plus manifest parsing in an isolated HOME. The
global marketplace install remains a user-manual step.

## Status

This is a P0 configuration kit, not a marketplace release. The repository's
`main` branch does not yet contain this P0 branch until it is pushed and
reviewed. Run `/plugin marketplace add reviso-si/reviso-agent` only after the
reviewed contract is on `main`; otherwise use a local checkout or
`--plugin-dir` for testing.


# OpenClaw MCP setup

Transport: hosted HTTP MCP when the installed OpenClaw build supports remote MCP;
otherwise use its local MCP/plugin configuration without creating a second
Reviso server.

Auth mode: `bearer-config` or the host's local credential store, whichever
OpenClaw actually exposes.

Session identity: `none` until OpenClaw provides and the adapter verifies a
stable user conversation id.

## Install

Configure the existing Reviso hosted MCP endpoint with OpenClaw's MCP command
or configuration: `https://reviso.work/mcp`. Use `openclaw --help` and the
installed OpenClaw MCP/plugin subcommand for the exact local syntax; do not
invent a provider-specific Reviso transport.

## Remove

Remove the Reviso MCP/plugin entry using OpenClaw's own plugin command and
restart the session.

Missing credential: direct the user to Reviso's hosted connection flow. Do not
add a custom Reviso business implementation to OpenClaw in this P0.

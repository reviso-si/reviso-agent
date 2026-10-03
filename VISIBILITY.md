# Visibility Policy

This repository is public. Reviso is a hosted product and is **not** open source.
This file defines the boundary so the two do not get confused.

Default stance: publish only what a reader needs to use the agent integration.

## Public

This repository may contain:

- Agent instructions: how to publish, read feedback, and revise.
- The names and public arguments of the MCP tools an agent can call.
- User-facing connection steps and what to do when a connection fails.
- Behavioral rules the agent must follow, such as never overwriting a concurrent
  edit and never speaking for a human reviewer.
- Known limitations of the command line, so an agent does not paper over them.

## Private

Keep the following out of this repository:

- Server source code, internal modules, and implementation details.
- The authorization model: capability names, role-to-permission mappings, and how
  access decisions are made.
- Internal HTTP routes. Only MCP tool names and their public arguments belong
  here, never the transport beneath them.
- Database, storage, deployment, and CI details.
- Credential names, key formats, token prefixes, and anything describing how a
  credential is validated.
- Private repository names, internal runbooks, local filesystem paths other than
  paths the client itself documents to users, and machine-specific setup.
- Customer content, real document bodies, real reviewer comments, and real
  workspace names.
- Unreleased product plans and any claim about a connector or client that has not
  been verified end to end.

## Review Standard

Before publishing, ask whether the content helps an agent complete the review
loop without helping a reader reconstruct anything in the private list above.

Agent instructions are unusually easy to leak through by accident: an example
that uses a real internal hostname, a failure table that names an internal error
code, or a "why this happens" paragraph that explains server internals all cross
the boundary while looking like helpful documentation. Prefer describing the
symptom and the user-facing recovery step over explaining the cause.

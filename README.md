# Reviso for agents

An agent skill for [Reviso](https://reviso.work), a content collaboration system
where agents publish Markdown and HTML drafts and a human team reviews them.

The skill teaches an agent the review loop: publish a draft, hand the human a
link, read back their comments and edits, and publish a revision based on the
version it actually read. It exists mostly to enforce one rule -- **never
overwrite a concurrent human edit** -- which is easy for an agent to get wrong
when it improvises.

## Install

Claude Code:

```
/plugin marketplace add reviso-si/reviso-agent
/plugin install reviso
```

Other SKILL.md-native hosts: place this repository where the host looks for
skills. `SKILL.md` is at the repository root and its `references/` directory is
loaded on demand.

## What you need first

The skill is instructions, not a connection. It needs one of:

- **A hosted Reviso connection** (preferred). Open the agent setup page in
  Reviso and authorize. No key is copied by hand.
- **A locally launched Reviso server**, for hosts that require one. This needs the
  command line installed plus a workspace-scoped key, and a restart of the agent
  session.

The skill detects which of these is available and tells the user what is missing.
It will not silently fall back to the command line, and it will not claim a
document was published unless a call actually returned a URL.

See [references/mcp-setup.md](references/mcp-setup.md) for the connection details.

## Layout

```
SKILL.md                          the skill the agent loads
references/mcp-tools.md           the MCP call sequence per turn
references/cli-usage.md           the command line equivalent
references/mcp-setup.md           what to tell a user who is not connected
```

## License

The instructions in this repository are MIT licensed. That covers this
repository only. **The Reviso product itself is not open source**, and nothing
here grants any right to it.

See [VISIBILITY.md](VISIBILITY.md) for what may and may not appear in this public
repository, and [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Reporting problems

Open an issue here for anything about the agent integration: the skill's wording,
a trigger that does not fire, or a step that fails. This repository is the public
surface for the agent integration, not for the Reviso product itself.

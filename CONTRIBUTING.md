# Contributing

This public repository is the agent integration surface for Reviso. Keep
contributions small and public-safe.

## Rules

- Read [VISIBILITY.md](VISIBILITY.md) before adding anything. It lists what must
  not appear here.
- Do not add secrets, tokens, keys, or generated auth files. Not even expired or
  obviously fake ones: a token prefix is itself information.
- Do not add internal hostnames, routes, error codes, capability names, or
  database and deployment details.
- Do not add real document bodies, real reviewer comments, or real workspace
  names. Use invented examples.
- Do not claim a client or connector works unless it was verified end to end
  against the product. A setup guide or a local test is not verification.
- Do not add product marketing copy. This repository teaches an agent how to use
  Reviso; positioning belongs elsewhere.

## Changes to the instructions

`SKILL.md` is loaded by an agent on every matching turn, so it is a budget, not a
document. Prefer:

- Adding detail to `references/` and linking it, rather than growing `SKILL.md`.
- Changing the `description` only for real trigger problems -- it decides whether
  the skill fires at all.
- Removing a rule only when it is genuinely redundant. The safety rules around
  concurrent edits and untrusted comments are not negotiable.

## Reporting problems

Open an issue for the agent integration. For problems with the Reviso product
itself, use the support channel on the product site instead; they are separate.

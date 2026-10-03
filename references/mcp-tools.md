# Reviso MCP tools

Use this file when Reviso MCP tools are present in the session. The whole loop is
feedforward, not a single call: publish, wait for a human, read what they said,
publish a revision based on the version you actually read.

Tool results can carry `isError: true` on a result that otherwise looks fine.
Always check that field. A JSON-RPC `result` wrapper is not proof of success.

## Turn 1: publish a draft

```
reviso_document_create
  title          "Q3 launch plan"          (required)
  content        "<the full Markdown>"      (required)
  description    "Initial draft"            (required)
  source_format  "markdown" | "html"        (default markdown)
  workspace_id   optional
```

`description` is required even on create; say what this version is.

The result carries the document link. Give the human the plain document URL, not
a share link, unless they asked for a share link. Keep the `document_id` for later
turns; every result returns it.

If the account has several workspaces the call fails and names them. Call
`reviso_list_workspaces` and ask the user which one, rather than guessing.

## Turn 2: read the feedback

```
reviso_document_retrieve
  document_id  "doc_..."
  include      ["comments", "versions", "blocks"]
```

`comments` gives the threads, `versions` gives the version metadata you need to
write safely, and `blocks` gives a block index with a quote per block so you can
anchor without regexing ids out of the Markdown.

Cheaper options when you only need to know whether anything changed:

- `reviso_document_status` -- title, latest `version_id`, access. No body.
- `reviso_event_wait` -- pass `after_seq` to stream changes. Returns immediately
  by default; pass `timeout` (max 60) to wait for the first event.

Do not poll in a tight loop. Either ask the human to tell you when they are done,
or long-poll with `reviso_event_wait`.

## Turn 3: publish a revision

Two write paths. Pick by document, not by preference.

**Targeted edits to Markdown -- preferred.**

```
reviso_document_read_structure
  document_id  "doc_..."

reviso_document_apply_patch
  document_id      "doc_..."
  ops              [{ "type": "replace_block", ... }]
  base_version_id  "<ver_... from read_structure>"
  description      "Address reviewer feedback"
```

`read_structure` returns the document's `base_version_id`, `update_seq`, and a
`block_hash` per block. Those hashes are the preconditions. Copy each
`block_hash` verbatim into that operation's `base_block_hash`; do not recompute
them. Every operation must carry its `type` as the first field.

This path is block-aware: a stale base still merges when concurrent edits touched
*other* blocks. A same-block conflict fails closed rather than overwriting.

**Wholesale rewrite, or any HTML document.**

```
reviso_document_status                    # read the current head first
  document_id  "doc_..."

reviso_document_update
  document_id      "doc_..."
  content          "<the full new body>"
  base_version_id  "<version_id you just read>"
  description      "Rewrite the launch plan"
  source_format    "markdown" | "html"
```

There is no cross-version merge here. A stale `base_version_id` is rejected as a
conflict. Re-read, re-apply your edit on top of the fresh content, try again.

## When a write is rejected

A same-block conflict returns a recoverable failed-intent handle (`pei_...`).
Recover it rather than starting over:

1. `reviso_document_list_failed_intents` or `reviso_document_failed_intent` to
   see what was rejected and what it collided with.
2. Re-read: `reviso_document_read_structure`.
3. Re-apply your change against the fresh base.
4. `reviso_document_resolve_failed_intent` to close the handle.

Never retry by dropping the base version or by re-sending the same patch
unchanged. If you did not expect the human's edit, tell the user what changed
instead of quietly working around it.

## Comparing versions

```
reviso_version_diff
  document_id      "doc_..."
  from_version_id  "ver_..."
  to_version_id    "ver_..."
```

Use this instead of fetching both bodies and diffing them yourself. It is useful
when explaining to a human what changed between their edit and yours.

## Retries

`reviso_document_create` and `reviso_document_update` accept an `operation_id`,
and `reviso_document_apply_patch` accepts an `idempotency_key`. If a call times
out, reuse the *same* value on the retry so a committed-but-lost response replays
instead of writing a second version. A fresh key is for a genuinely new edit.

## Related tools

- `reviso_comment_create` / `reviso_comment_reply` -- add a comment yourself.
- `reviso_share_create` / `reviso_list_invites` -- only when the user asks to
  bring someone else in.
- `reviso_document_rename`, `reviso_document_restore`, `reviso_document_rollback`
  -- rollback is CAS-protected too; read the head first.

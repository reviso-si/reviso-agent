# Reviso command line

Use this file only when the user asked for the command line, or when their
environment has no MCP support. Check that `reviso` exists before running
anything. If it does not, ask before installing:

```bash
pip install reviso-cli
```

It installs the `reviso` command and has no runtime dependencies. Do not install
it without the user's agreement.

## One rule that overrides convenience

**Always pass `--base-version-id` when you revise something.** `update` and
`rollback` reject an omitted base by default. `--force-latest` is the explicit
last-writer-wins opt-in; it re-reads the newest version once and is not a
conflict workaround.

The safe shape is always two steps:

```
reviso versions <document_id>          # take the newest version_id
reviso update <document_id> draft.md --description "..." --base-version-id <ver_...>
```

If the write is rejected as a conflict, re-read and re-apply. Do not retry with
the flag removed or reach for `--force-latest`.

## Connecting

```
reviso auth status
reviso auth login --server <origin>     # key comes from the environment
```

Never paste a key on the command line where it lands in shell history or in the
conversation. Set `REVISO_AUTOMATION_KEY` in the environment instead. If a key
was pasted into chat, tell the user to rotate it.

`reviso doctor --json` reports whether the server, the credential, and the
workspace are reachable. Run it first when something looks wrong.

When a command fails, use the normalized class rather than guessing from the
message: `not_connected` means connect, `auth_expired` means reconnect,
`forbidden` means stop and request access, `not_found` means re-check the id or
workspace, `conflict` means re-read before writing, `unavailable` means a
transport/server failure, and `unsupported` means the command or host lacks that
capability. Preserve `retryable`, `request_id`, and sanitized `details` in any
error report.

## Publishing

```
reviso publish draft.md \
  --title "Q3 launch plan" \
  --description "Initial draft" \
  --workspace-id "$REVISO_WORKSPACE_ID"
```

Format is inferred from the file extension; `--format html` overrides it.

**Provenance flags.** `source_kind` and `source_session_id` are an all-or-none
pair. When the draft is produced inside a host session with its own identity — a
DeepSeek Harness session (`--source-kind dsh --source-session-id
"$DSH_SESSION_ID"`), a CI run, or another agent runtime — pass both flags so the
document binds to that session.
Source-scoped host surfaces list documents for that exact `session_key`; without
the pair the draft is not session-scoped. If only one value is available, omit
both and say so.

**Machine-readable publish.** Use `--json` when you need the returned
`document_id`, `version_id`, `workspace_id`, and canonical absolute
`review_url`. The default legacy output remains URL-only. Do not derive a review
URL from the document id; use the returned value as supplied.

```
reviso publish draft.md --title "Q3 launch plan" --description "Initial draft" \
  --source-kind dsh --source-session-id "$DSH_SESSION_ID" --json
```

## Reading feedback

```
reviso packet <document_id> --format json   # writes the packet to a file, prints its path
reviso status <document_id> --json          # latest version, no body
reviso versions <document_id>               # version list (always JSON)
```

`packet` **writes the packet to a local file and prints the path**, rather than
printing the payload. Read that file. It also takes `--thread-id <id>` to narrow
to one thread.

## Revising

```
reviso versions <document_id>                      # read the current version id
reviso update <document_id> revised.md \
  --description "Address reviewer feedback" \
  --base-version-id <ver_...> \
  --agent-name "Claude"
```

The command prints JSON with the new version metadata on success.

```
reviso diff <document_id> <from_version_id> <to_version_id> --json
reviso rollback <document_id> <target_version_id> \
  --description "Restore reviewed draft" \
  --base-version-id <ver_...>
```

`rollback` creates a new version; it does not destroy history. It is
CAS-protected the same way, so pass the base version.

## Other useful commands

```
reviso workspaces --json
reviso search "<query>" --json --limit 10
reviso open <document_id>          # prints the browser URL
reviso export <document_id> --output review-export.json
reviso import review-export.json
```

## Known gaps

These are real limitations of the command line today. Work around them, and tell
the user rather than papering over them.

- The default `publish` output remains URL-only for compatibility. Pass
  `--json` when the next step needs `document_id` or the other returned ids.
- `update` and `rollback` require `--base-version-id` by default. The explicit
  `--force-latest` opt-in re-reads the head and is only for a deliberate
  last-writer-wins request; it is not a conflict workaround.

Prefer MCP when it is available. The MCP tools return structured ids, enforce the
base version, and reject a stale write by construction.

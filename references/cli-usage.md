# Reviso command line

Use this file only when the user asked for the command line, or when their
environment has no MCP support. Check that `reviso` exists before running
anything. If it does not, ask before installing.

## One rule that overrides convenience

**Always pass `--base-version-id` when you revise something.** Omitting it is not
a safe default: the command then re-bases onto whatever version is newest and
lets your write win. That silently discards a human's concurrent edit.

The safe shape is always two steps:

```
reviso versions <document_id>          # take the newest version_id
reviso update <document_id> draft.md --description "..." --base-version-id <ver_...>
```

If the write is rejected as a conflict, re-read and re-apply. Do not retry with
the flag removed.

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

## Publishing

```
reviso publish draft.md \
  --title "Q3 launch plan" \
  --description "Initial draft" \
  --workspace-id "$REVISO_WORKSPACE_ID"
```

Format is inferred from the file extension; `--format html` overrides it.

**Publishing prints only the document URL.** There is no `--json` on this command
and no document id in the output. To act on the document afterwards you need its
id, so pick it up from the document list:

```
reviso documents --json            # match by title, take the id
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

- `publish` cannot return the document id, and unlike the other read commands it
  has no `--json` flag. It prints the URL on one line, so use
  `reviso documents --json` to pick the id back up.
- `update` and `rollback` default to last-writer-wins when the base version is
  omitted. This contradicts the safety guarantee the MCP tools give you. Always
  pass the flag.

Prefer MCP when it is available. The MCP tools return structured ids, enforce the
base version, and reject a stale write by construction.

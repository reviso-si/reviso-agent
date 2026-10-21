# Reviso adapter template

Copy this directory into the adapter repository or package. The adapter is a
thin host integration; Reviso remains the only source of documents, versions,
comments, permissions, OAuth and session_key behavior.

## Required files

- `adapter-manifest.json`: machine-validated capability declaration.
- `README.md`: install, uninstall, update, auth, supported operations and limits.
- `CHANGELOG.md`: released behavior and host compatibility.
- tests for every declared operation.
- one opt-in real-host smoke test.

## Adapter boundary

The adapter may implement only:

- transport to Reviso's existing API or hosted `/mcp`;
- the host's credential placement;
- host UI registration, command or webview;
- host session identity mapping;
- normalization to Reviso's shared error classes.

It must not implement a second document model, permission model, OAuth stack or
MCP business server.

## Required behavior

Declare every operation in `operations` or `unsupported`. Unsupported behavior
must fail with `unsupported`; it must not silently disappear.

Authentication must use exactly one declared mode. A missing credential returns
`not_connected`; an expired or rejected credential returns `auth_expired`.
Never place a Reviso token in committed files, logs, screenshots or chat.

If the host lacks a stable user session, declare `session_identity: "none"`.
Do not use the MCP transport session as a user conversation identity.

## Validation

```bash
node scripts/validate-adapter-manifest.mjs templates/adapter/adapter-manifest.json
```

Before review, run the adapter's build, tests, manifest validator, install
dry-run and host smoke test. Include the exact commands and evidence paths in
the submission.

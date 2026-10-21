# Adapter review checklist

- [ ] `adapter-manifest.json` passes the shared validator.
- [ ] The adapter uses Reviso's existing API or hosted `/mcp`; no business logic copied.
- [ ] Every operation is declared in `operations` or `unsupported`.
- [ ] Authentication mode matches where the host actually stores credentials.
- [ ] Session identity is honest; `none` is used when the host has no stable user session.
- [ ] Install, uninstall and update commands were executed or marked as user-manual.
- [ ] Missing credential produces `not_connected`, not a crash or blank UI.
- [ ] Expired credential produces `auth_expired`, not a blind retry loop.
- [ ] No token appears in git, logs, screenshots, fixtures or test output.
- [ ] Unit/contract tests pass.
- [ ] One real-host smoke test exists and is explicitly opt-in.
- [ ] README documents supported operations and known limitations.
- [ ] CHANGELOG/version is present.
- [ ] Evidence paths and exact commands are included in the review report.

# Testing and validation

Verify the affected behavior first, then the relevant module suite. Keep security, data-integrity, persistence and native-process boundaries; do not hide failures or loosen assertions to make cleanup pass.

## Entry points

Run from the repository root unless noted.

| Scope | Command |
| --- | --- |
| One UI/server module | `pnpm --dir ui exec vitest run <file-or-directory>` |
| UI server / client suites | `pnpm --dir ui test:server` / `pnpm --dir ui test:client` |
| Full UI/server regression | `pnpm --dir ui test` |
| Checkpoint execution and restore | `pnpm test:checkpoints` (build Core first) |
| Changed/related imports | `pnpm --dir ui test:changed` or `pnpm --dir ui test:related src/path/to/file.ts` |
| Model protocol/streaming | `node --import tsx --test "tests/model/**/*.spec.ts"` |
| Desktop helpers | `pnpm --filter 9gclaw-desktop test` |
| Complete built backend suite | `pnpm test` |
| UI type check / build | `pnpm --dir ui typecheck` / `pnpm --dir ui build` |
| Desktop TypeScript | `pnpm --filter 9gclaw-desktop compile` |

Changed/related selection follows import edges, not every dynamically read template, workflow, icon or plugin. Broaden checks for shared protocols, native resources, dependency locks and build inputs. Real browser acceptance belongs under ui/e2e/ and is separate from Vitest discovery.

Run chat browser regressions with `pnpm --dir ui exec playwright test -c e2e/streaming-scroll.config.mjs`. With desktop Electron installed, set `NINEGCLAW_SCROLL_ELECTRON=1` and select `streaming-scroll.spec.mjs chat-media-scroll.spec.mjs` to repeat scroll gestures, live generation/disclosure interactions and media reflow in isolated native renderer profiles. These fixtures start no application services or model providers.

## Pull request CI selection

This fork keeps four Windows workflows. Desktop PR checks run checkpoints,
MCP and product-identity regressions, Web typechecking/builds, desktop helper
checks, branding/localization checks and updater regressions. Native Windows
x64 and ARM64 jobs package and validate their own installers without publishing.
The manual Windows Release workflow is the only publisher; a separate retry
workflow may repeat the first failed build once. OBS, Docker and non-Windows
Actions are disabled. Shared cross-platform tests and sources remain available
for local validation, with explicit platform prerequisites.

Upstream synchronization must also verify new runtime/tool contracts, scoped
reload and deferred editor behavior. Use synthetic providers and isolated
profiles; real provider calls require explicit opt-in. Local Windows runners
may need a configured Git Bash path and Python on PATH. Preserve assertions
and report platform limits instead of removing unsupported cases.

After `pnpm --dir ui build`, run `node scripts/check-ui-build-graph.mjs` to
verify that the startup and text-editor import graphs exclude deferred features.
`pnpm --dir ui exec playwright test -c e2e/editor-loading.config.mjs` serves the
production build with synthetic APIs and checks editor/PDF requests and tab state.

## Test quality and isolation

- Every retained case must identify a meaningful regression it would catch. Assert user outcomes, wire payloads, persisted contents, exit results and resource release.
- Mock external providers and uncontrolled systems while exercising the target implementation. Do not preserve obsolete implementation-text assertions after a feature is removed, or delete unique safety cases because they are slow.
- Use isolated NINEGCLAW_HOME, profiles, databases and workspaces. Some server modules open a database at import time, so establish isolation before importing them. Declare real Git, Python, shell, symlink and platform prerequisites.
- Use readiness signals, controlled clocks and observable state instead of fixed sleeps. Keep distinct timing, authorization, path-escape, rollback and account-isolation cases; avoid multiplying every language/theme/platform combination without a distinct behavior.
- Small fixtures may be shared; do not create one giant test file or an end-to-end flow for unrelated behavior. Real provider calls require explicit opt-in and synthetic credentials must not be mistaken for production secrets.
- Follow [CONTRIBUTING](../CONTRIBUTING.md) for placement, English documentation and artifact rules. New module tests remain visible to Git; only root test/ and test.ts drafts are ignored.

## Maintained diagnostic checks

With Vite on port 5187, `node ui/e2e/form-controls.smoke.mjs` checks the shared form chrome in all six paired palettes: grouped/disabled options, keyboard and pointer selection, nested-dialog Escape, native form values, calendar/time selection and a 1,000-option menu in a narrow viewport. `node ui/e2e/settings-navigation-theme.smoke.mjs` exercises actual settings persistence and native desktop navigation. These use synthetic data and isolated profiles.

Windows Web tests use at most four workers to limit concurrent Node/jsdom and Git processes. Real repository update tests have a separate 60-second integration budget; UI assertions retain the default timeout, with cold backend imports completed in setup hooks. Directory-link security fixtures use Windows junctions and run without elevation. File-symlink cases run when the host permits them; only an actual Windows `EPERM` skips that individual case with a Developer Mode/elevation explanation. POSIX CI continues to exercise the file-link assertions.

Checkpoint execution cases use separate Python, subagent and background-task
files with a shared isolated workspace fixture. Each keeps the runner's 60-second
file deadline instead of sharing one cumulative budget across all execution modes.

First build the relevant Core/Desktop/Web outputs when a command consumes compiled code.

| Check | Entry and prerequisites |
| --- | --- |
| Synthetic startup/history benchmark | `node scripts/benchmark-startup.mjs --samples 3 --sessions 1000 --artifacts artifacts/startup --output artifacts/startup/summary.json`; add --serial for the serial comparison or --root for another compiled checkout |
| Session-list disk benchmark | `node scripts/benchmark-session-list.mjs 1000`; synthetic data, not full client startup time |
| Real desktop fault injection | `node scripts/benchmark-startup.mjs --desktop --fault slow-start --artifacts artifacts/startup --hold-ms 180000`; also abort, oom, module-missing, web-module-missing and config-invalid; a stop file ends the isolated instance |
| Windows installer/shortcut | `node apps/desktop/scripts/verify-installer.cjs` and `node apps/desktop/scripts/verify-installer-shortcut.cjs`; require Windows and desktop build dependencies |
| Windows uninstall boundary | `node apps/desktop/scripts/verify-uninstaller.cjs`; verifies default data retention, localization and update guards |
| Windows native notifications | `pnpm --filter 9gclaw-desktop exec electron scripts/verify-windows-notifications.cjs`; compiled Desktop and an isolated notification identity |
| TUI permissions | `node --import tsx --test tests/adapters/tui-permissions.spec.tsx`; automatic temporary profile, mocked Gateway, no model calls |
| UI import/export analysis | `node scripts/audit-ui-reachability.mjs --exports`; read-only candidates, not automatic deletion authority |

Appearance, native file selection and window chrome acceptance use ui/e2e/appearance.smoke.mjs, file-picker.smoke.mjs and desktop-chrome.smoke.mjs. With Vite on port 5187, run `node ui/e2e/theme-components.smoke.mjs` for all six light/dark palettes on the real chat menus and skills screen, including warning semantics, selected states, placeholders and text contrast. `node ui/e2e/dialog-appearance.smoke.mjs` checks confirmation actions and image overlays. Prepare their Vite/Desktop prerequisites and isolated profiles. Preview pages do not replace the real startup-flow regression. Native package installation, update, signing and OS permission acceptance remain platform-specific.

Record commands, outcomes and limits in the PR/CI artifacts. Put temporary screenshots, logs, request dumps and benchmark data in ignored artifacts/<topic>/ or outputs/<topic>/, never in a new tracked delivery report. The [session timeline](architecture/session-timeline.md) and [reasoning reference](reasoning-settings.md) are durable contracts, not test-run logs.

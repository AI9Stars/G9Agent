# G9Agent branding

The public product name is **九格智能体** in Chinese and **G9Agent** in English and other interface languages. Native, Web and React startup screens use the same localized name beside the nine-cell icon, retaining continuous progress in light, dark and reduced-motion modes.

## Identity and assets

The primary identity prompt is `src/context/prompt/productIdentity.ts`. Default prompts, custom task roles and built-in subagents retain that identity. Historical conversations, summaries and memories do not change the platform name. Model/provider answers use active runtime context and must not claim the platform developed the underlying model.

Branding covers titles, login/onboarding, sidebar, settings, notifications, PWA installation, native windows/menus/tray, startup, terminal and runtime skills. React wordmarks use live text and follow interface language changes. Agent identity follows the active conversation language, including custom roles and built-in subagents. Internal API names and paths retain the ASCII namespace below for compatibility.

The maintained source is `ui/public/g9agent-mark.svg`. `node scripts/rebuild-brand-assets.mjs` derives Web, PWA, favicon, memory and desktop icons and an English image lockup. The shared native icon builder supplies all ICO and ICNS sizes. Generated runtime images are ordinary Git blobs; normal builds require neither font rendering nor Git LFS. The generator does not overwrite the preserved root README artwork in `assets/`.

The browser favicon uses `ui/public/9gclaw-icon-128.png`, generated from the same source as the PWA 128px icon. `node scripts/check-branding.mjs` verifies their hashes, the source logo, namespace policy and release configuration.

## Namespaces and data

| Surface | Contract |
| --- | --- |
| CLI and packages | `9gclaw`, `9gclaw-ui`, `9gclaw-desktop`, `@9gclaw/config` |
| Global state and config | `~/.9gclaw`, `9gclaw.yaml`; overrides `NINEGCLAW_HOME`, `NINEGCLAW_CONFIG_PATH` |
| Environment and identifiers | `NINEGCLAW_*`; legal code identifiers use `NineGClaw` or `ninegclaw` |
| Windows program/install directory | `9GClaw` |
| Electron user data | `%APPDATA%/9gclaw-desktop`; runtime logs under `logs` |
| Installer and log exports | `9GClaw-<version>-win-<arch>-setup.exe`, `9GClaw-logs-*.log` |

Protocols, HTTP headers, local storage keys, executable names and internal module references keep their existing namespace. Renaming this fork to G9Agent does not move existing configuration, sessions or desktop user data. Older upstream data directories still require an explicit, backed-up migration. User-selected paths retain their names.

## Distribution

The installer defaults to the `main` branch of `AI9Stars/G9Agent`. Desktop updates use only this repository's GitHub Releases. Windows x64 and ARM64 are the supported packaging targets; shared cross-platform source remains available. The application does not enable upstream analytics by default.

This fork is based on OpenBMB's upstream open-source project and retains original copyright and license notices. Root README content and existing source media remain preserved. See [releases](release.md) and [upstream synchronization](upstream-sync.zh.md) for maintenance rules.

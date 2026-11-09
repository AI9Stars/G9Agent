# G9Agent branding

The public product name is **九格智能体** in Chinese and **G9Agent** in English and other interface languages. Native, Web and React startup screens use the same localized name beside the original fork logo, retaining continuous progress in light, dark and reduced-motion modes.

## Identity and assets

The primary identity prompt is `src/context/prompt/productIdentity.ts`. Default prompts, custom task roles and built-in subagents retain that identity. Historical conversations, summaries and memories do not change the platform name. Model/provider answers use active runtime context and must not claim the platform developed the underlying model.

Branding covers titles, login/onboarding, sidebar, settings, notifications, PWA installation, native windows/menus/tray, startup, terminal and runtime skills. React wordmarks use live text and follow interface language changes. Agent identity follows the active conversation language, including custom roles and built-in subagents. Internal API names and paths retain the ASCII namespace below for compatibility.

The preserved source is `ui/public/logo-256.png` (SHA-256 `36c58fcbe68e6c7231358bed117acacbe37e5e76da791dd60c577ac93ed27a4b`). `node scripts/rebuild-brand-assets.mjs` derives Web, PWA, favicon, memory and desktop icons and an English image lockup without replacing the source artwork. The shared native icon builder supplies all ICO and ICNS sizes. Generated runtime images are ordinary Git blobs; normal builds require neither font rendering nor Git LFS. The generator does not overwrite the preserved root README artwork in `assets/`.

The browser favicon uses `ui/public/g9agent-icon-128.png`, generated from the same source as the PWA 128px icon. `node scripts/check-branding.mjs` verifies their hashes, the source logo, namespace policy and release configuration.

## Namespaces and data

| Surface | Contract |
| --- | --- |
| CLI and packages | `g9agent`, `g9agent-ui`, `g9agent-desktop`, `@g9agent/config` |
| Global state and config | `~/.g9agent`, `g9agent.yaml`; overrides `G9AGENT_HOME`, `G9AGENT_CONFIG_PATH` |
| Environment and identifiers | `G9AGENT_*`; legal code identifiers use `G9Agent` or `g9agent` |
| Windows program/install directory | `G9Agent` |
| Electron user data | `%APPDATA%/g9agent-desktop`; runtime logs under `logs` |
| Installer and log exports | `G9Agent-<version>-win-<arch>-setup.exe`, `G9Agent-logs-*.log` |

The CLI, packages, protocols, HTTP headers, local storage keys, executable names and internal module references use the G9Agent namespace. On first startup, the namespace bridge copies the previous fork's default configuration, history and desktop profile into the new owned directories only when their destinations are absent. It preserves original files, existing new data, YAML content and explicit user-selected locations. Old environment overrides remain readable as compatibility aliases; current overrides win. Project state and instruction filenames receive the same compatibility treatment. Registered General workspaces retain their existing path and identity. Older upstream product profiles are not automatically imported.

Windows keeps the previous NSIS installation GUID while using the new application ID and executable name, so the installer finds the existing installation. The first update across the filename change may use the full-download fallback instead of differential download. Repository-rename compatibility retains the old repository wire identity only in release manifests; see [release compatibility](release.md).

## Distribution

The installer defaults to the `main` branch of `AI9Stars/G9Agent`. Desktop updates use only this repository's GitHub Releases. Windows x64 and ARM64 are the supported packaging targets; shared cross-platform source remains available. The application does not enable upstream analytics by default.

This fork is based on OpenBMB's upstream open-source project and retains original copyright and license notices. Root README content and existing source media remain preserved. See [releases](release.md) and [upstream synchronization](upstream-sync.zh.md) for maintenance rules.

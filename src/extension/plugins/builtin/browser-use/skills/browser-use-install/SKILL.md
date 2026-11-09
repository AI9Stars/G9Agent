---
name: browser-use-install
description: Use before browser-use, Playwright MCP, web browsing, browser automation, or when browser-use fails with a missing browser, missing executable, "Executable doesn't exist", or Chrome/Chromium install error in G9Agent Desktop.
---

# Browser-Use Install

G9Agent Desktop ships browser-use without a bundled Chrome browser. When browser automation is needed, install the Playwright Chrome for Testing browser into the user's writable application data directory, then retry the browser-use tool.

## Install

Run this from any working directory:

```bash
node "$G9AGENT_RUNTIME_ROOT/dist/src/extension/plugins/builtin/browser-use/scripts/install-browser.mjs"
```

In PowerShell, use:

```powershell
node "$env:G9AGENT_RUNTIME_ROOT/dist/src/extension/plugins/builtin/browser-use/scripts/install-browser.mjs"
```

If `G9AGENT_RUNTIME_ROOT` is not set, find the application runtime root first. It is the directory that contains `node_modules/@playwright/mcp/cli.js` and `dist/src/cli/g9agent.js`, then run:

```bash
G9AGENT_RUNTIME_ROOT="/path/to/runtime" node "/path/to/runtime/dist/src/extension/plugins/builtin/browser-use/scripts/install-browser.mjs"
```

PowerShell equivalent:

```powershell
$env:G9AGENT_RUNTIME_ROOT = 'C:\Path\To\G9Agent\resources\runtime'
node "$env:G9AGENT_RUNTIME_ROOT/dist/src/extension/plugins/builtin/browser-use/scripts/install-browser.mjs"
```

## Mirrors And Offline

Use the same environment variables as desktop packaging when the default network is blocked:

```bash
G9AGENT_DESKTOP_DOWNLOAD_MIRROR=china node "$G9AGENT_RUNTIME_ROOT/dist/src/extension/plugins/builtin/browser-use/scripts/install-browser.mjs"
```

For fully offline installs, point to a directory containing the matching `chrome-*.zip` archive:

```bash
G9AGENT_DESKTOP_PLAYWRIGHT_ARCHIVE_DIR="/path/to/playwright-archives" node "$G9AGENT_RUNTIME_ROOT/dist/src/extension/plugins/builtin/browser-use/scripts/install-browser.mjs"
```

## After Install

Retry the browser-use request after the install succeeds. If the current MCP session still reports the old missing-browser error, tell the user to send the same request once more so G9Agent can start a fresh browser-use session.

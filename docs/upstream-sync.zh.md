# Upstream synchronization

Maintain a customization patch stack directly on the selected upstream commit. Start from a fresh private copy of the current patch branch and replay only the fork patches onto the new upstream base. Do not rebase shared branches or force-push `main`. Keep existing fork history and recovery refs; retain root README files and their original media.

```powershell
git fetch origin main
git fetch upstream main
git switch -c codex/sync-upstream <current-customization-head>
git rebase --onto upstream/main <previous-upstream-base>
```

Keep mechanical namespace changes separate from product and distribution customizations. Resolve conflicts using current upstream behavior plus the fork's product policy. The namespace tool catches newly added upstream files after replay; it does not replace review of changed logic, prompts and release inputs. It defaults to a preview and infers the source name from the `upstream` remote; `--from <name>` works without that remote.

```powershell
node scripts/rebrand-tracked-files.mjs
node scripts/rebrand-tracked-files.mjs --apply
pnpm install --frozen-lockfile
git add -A
node scripts/check-branding.mjs
```

The tool rewrites tracked UTF-8 text and filenames, retaining binary bytes. It preserves legal TypeScript and CSS identifiers. Dot selectors are scanned only in CSS; code contributes explicit `className` values, so environment variables cannot become CSS identifiers. The branding checker intentionally retains the legacy namespace it audits and is excluded from rewriting.

## Fork contracts

- Display **九格智能体** in Chinese and **G9Agent** in English. Agent identity follows the conversation language. Use the maintained nine-cell vector and its generated icons; preserve root README content and its existing media.
- Use `9gclaw`, `@9gclaw/config`, `NINEGCLAW_*`, and legal `NineGClaw`/`ninegclaw` code identifiers. Programs, installer names and default directories use ASCII. See [branding](9gclaw-branding.md) for data paths.
- Keep the identity block in default and custom prompts and built-in subagents. Preserve the current upstream tool, context, permission and delegation instructions. Identity does not change the active model/provider description.
- Keep only the four Windows workflows. PRs run regressions and native x64/ARM64 packaging; the manual Windows Release entry point is the only publisher. Preserve Shanghai-date versions, bounded retries and unsigned packaging with checksum verification.
- Keep GitHub-only desktop updates from `AI9Stars/G9Agent`, including metadata/payload validation, cancellation, pause/resume and runtime recovery. Do not restore OBS routes, mirrors, signing secrets or other platform release jobs.
- Carry forward upstream fixes and regression coverage, including new runtime skills and test/build inputs. Accept upstream documentation consolidation without restoring obsolete task reports.

Review `src/context/prompt/productIdentity.ts`, `PromptAssembler.ts`, built-in subagent prompts, runtime skills, desktop `brand.ts`/startup templates, React/Web startup, favicon/PWA assets, both lockfiles and update defaults. Binary logos need an explicit check: renaming a new upstream image does not rebrand its pixels.

## Validation

```powershell
pnpm run build
node --test dist/tests/context/product-identity.spec.js
pnpm run test:mcp
pnpm run test:checkpoints
pnpm --filter 9gclaw-desktop compile
pnpm --filter 9gclaw-desktop test
node --test packages/config/tests/*.test.cjs scripts/lib/*.test.mjs scripts/rebrand-tracked-files.test.mjs
pnpm --dir ui typecheck
pnpm --dir ui test
pnpm --dir ui build
node ui/e2e/startup-continuity.smoke.mjs
node scripts/check-branding.mjs
node scripts/rebrand-tracked-files.mjs
```

The final rewrite preview should report zero pending files. Verify root README and original-logo blob hashes against fork `main`. Review the diff against upstream as well as against the fork; this catches accidentally discarded upstream behavior. Record actual results and platform limits in the PR, with temporary evidence under ignored `artifacts/` or `outputs/`.

Run the Desktop workflow to validate native Windows x64 and ARM64 packages. Do not trigger a Release merely to test a sync. Retain the private patch branch as the next replay source; its base must be the selected upstream commit, without ancestry-only merge commits. Review the final tree against the fork's current `main` before opening the synchronization PR.

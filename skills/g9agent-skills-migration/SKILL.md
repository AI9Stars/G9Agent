---
name: g9agent-skills-migration
description: >-
  Migrate Claude Code, OpenClaw, Hermes, or custom Agent Skill directories into
  G9Agent's global skills directory. Use when the user asks to migrate,
  import, copy, or consolidate skills into G9Agent, or mentions
  ~/.claude/skills, ~/.openclaw, ~/.hermes, ~/.agents/skills, or
  ~/.g9agent/skills.
---

# G9Agent Skills Migration

Use this skill to migrate Agent Skill folders into G9Agent's global skill
store, `~/.g9agent/skills`.

## Workflow

Use the repo npm script from the repo root:

```bash
npm run skills:migrate
```

`npm run dev` runs `predev`, which syncs this repo skill into
`$G9AGENT_HOME/skills` (`~/.g9agent/skills` by default). The migration command
itself stays available as `npm run skills:migrate` without requiring a global
`g9agent` command on `PATH`.

1. Ask the user which source to migrate before running any migration command.
   Use `ask_user_question` with these options:

```text
Which skills should I migrate into G9Agent?
- Claude Code
- OpenClaw
- Hermes
- Custom path
```

For "Custom path", ask for the source directory path before continuing.

2. Run a dry run for only the selected source:

```bash
npm run skills:migrate -- --from cc
npm run skills:migrate -- --from openclaw
npm run skills:migrate -- --from hermes
npm run skills:migrate -- --source /path/to/skills
```

3. If the dry run finds no source path or no migratable skill directories,
   stop. Do not run `--execute`. Tell the user which source was checked and
   that no matching `SKILL.md` directories were found.

4. Review the dry-run report with the user, especially conflicts and
   validation errors.

5. Copy skills only after confirmation:

```bash
npm run skills:migrate -- --from cc --execute
npm run skills:migrate -- --from openclaw --execute
npm run skills:migrate -- --from hermes --execute
npm run skills:migrate -- --source /path/to/skills --execute
```

## Common Commands

Migrate only selected sources:

```bash
npm run skills:migrate -- --from cc,openclaw --execute
npm run skills:migrate -- --from hermes --execute
```

Handle destination conflicts:

```bash
npm run skills:migrate -- --rename --execute
npm run skills:migrate -- --overwrite --execute
```

Migrate a custom source directory:

```bash
npm run skills:migrate -- --source /path/to/skills --execute
```

Use JSON for scripts or machine-readable reports:

```bash
npm run skills:migrate -- --json
```

## Default Sources

The G9Agent migrator scans immediate child directories containing `SKILL.md`
from:

- Claude Code: `~/.claude/skills`, `<project>/.claude/skills`
- OpenClaw: `~/.openclaw/workspace/skills`,
  `~/.openclaw/workspace-main/skills`,
  `~/.openclaw/workspace-assistant/skills`, `~/.openclaw/skills`,
  `~/.agents/skills`
- Hermes: `~/.hermes/skills`, `~/.hermes/.claude/skills`,
  `~/.hermes/.agents/skills`

## Safety Rules

- Always ask which source to migrate first; do not assume all sources.
- If the selected source path is missing, or the dry run reports no
  migratable skills, do not execute the migration. Report that nothing was
  found.
- Do not delete source skills.
- Prefer `--rename` over `--overwrite` unless the user explicitly wants to
  replace existing G9Agent skills.
- The repo bootstrap syncs this skill into `$G9AGENT_HOME/skills` from
  `skills/g9agent-skills-migration/SKILL.md`; it skips existing targets.

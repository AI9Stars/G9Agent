import { migrateLegacyProject } from '@g9agent/config';

/**
 * G9AGENT.md instruction file discovery — multi-scope instruction hierarchy.
 *
 * Files are loaded in the following order (later = higher priority, model pays
 * more attention to content that appears later in the system prompt):
 *
 *   1. Managed     — $G9AGENT_MANAGED_CONFIG/G9AGENT.md
 *   2. User        — ~/.g9agent/G9AGENT.md
 *   3. User rules  — ~/.g9agent/rules/*.md
 *   4. Project     — per directory from projectRoot toward cwd:
 *                      <dir>/G9AGENT.md
 *                      <dir>/.g9agent/G9AGENT.md
 *                      <dir>/.g9agent/rules/*.md
 *   5. Local       — <dir>/G9AGENT.local.md  (private, not committed)
 *
 * Design mirrors the legacy upstream instruction-file discovery, adapted to
 * G9Agent path conventions (~/.g9agent/, .g9agent/).
 */

import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

export type InstructionScope =
  | "managed"
  | "user"
  | "project"
  | "project-rules"
  | "local";

export type InstructionLayer = {
  scope: InstructionScope;
  path: string;
  content: string;
};

export class InstructionDiscovery {
  constructor(
    private readonly projectRoot: string,
    private readonly cwd: string,
    private readonly pilotHome: string,
  ) {}

  async discover(signal?: AbortSignal): Promise<InstructionLayer[]> {
    signal?.throwIfAborted();
    const layers: InstructionLayer[] = [];
    const seen = new Set<string>();

    // 1. Managed (administrator-level, e.g. /etc/g9agent/)
    const managedDir = process.env.G9AGENT_MANAGED_CONFIG;
    if (managedDir) {
      await this.tryAdd(layers, seen, "managed", join(managedDir, "G9AGENT.md"), signal);
    }

    // 2. User-level
    await this.tryAdd(layers, seen, "user", join(this.pilotHome, "G9AGENT.md"), signal);
    await this.tryAddRulesDir(layers, seen, "user", join(this.pilotHome, "rules"), signal);

    // 3–5. Project + Local — from root toward cwd (root first = lower priority)
    const dirs = this.collectDirectoryChain();
    for (const dir of dirs) {
      signal?.throwIfAborted();
      migrateLegacyProject(dir);
      await this.tryAdd(layers, seen, "project", join(dir, "G9AGENT.md"), signal);
      await this.tryAdd(layers, seen, "project", join(dir, ".g9agent", "G9AGENT.md"), signal);
      await this.tryAddRulesDir(layers, seen, "project-rules", join(dir, ".g9agent", "rules"), signal);
      await this.tryAdd(layers, seen, "local", join(dir, "G9AGENT.local.md"), signal);
    }

    signal?.throwIfAborted();
    return layers;
  }

  /**
   * Collect the directory chain from projectRoot down to cwd (inclusive).
   * Returns directories in root-first order so closer-to-cwd directories
   * are loaded last (= higher priority).
   */
  private collectDirectoryChain(): string[] {
    const root = resolve(this.projectRoot);
    const current = resolve(this.cwd);

    if (root === current) {
      return [root];
    }

    const dirs: string[] = [];
    let dir = current;
    while (dir !== root && dir !== dirname(dir)) {
      dirs.push(dir);
      dir = dirname(dir);
    }
    dirs.push(root);
    dirs.reverse();
    return dirs;
  }

  private async tryAdd(
    layers: InstructionLayer[],
    seen: Set<string>,
    scope: InstructionScope,
    filePath: string,
    signal?: AbortSignal,
  ): Promise<void> {
    signal?.throwIfAborted();
    const resolved = resolve(filePath);
    if (seen.has(resolved)) return;
    seen.add(resolved);
    try {
      const content = await readFile(resolved, { encoding: "utf-8", signal });
      const trimmed = content.trim();
      if (trimmed.length > 0) {
        layers.push({ scope, path: resolved, content: trimmed });
      }
    } catch {
      signal?.throwIfAborted();
      // ENOENT / EISDIR / EACCES — all expected when files don't exist
    }
  }

  private async tryAddRulesDir(
    layers: InstructionLayer[],
    seen: Set<string>,
    scope: InstructionScope,
    dirPath: string,
    signal?: AbortSignal,
  ): Promise<void> {
    signal?.throwIfAborted();
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      const mdFiles = entries
        .filter(e => e.isFile() && e.name.endsWith(".md") && e.name !== "SKILL.md")
        .map(e => e.name)
        .sort();
      for (const file of mdFiles) {
        await this.tryAdd(layers, seen, scope, join(dirPath, file), signal);
      }
    } catch {
      signal?.throwIfAborted();
      // Directory doesn't exist — normal
    }
  }
}

export function scopeDescription(scope: InstructionScope): string {
  switch (scope) {
    case "managed":
      return " (managed instructions, set by administrator)";
    case "user":
      return " (user's global instructions for all projects)";
    case "project":
      return " (project instructions, checked into the codebase)";
    case "project-rules":
      return " (project rule, checked into the codebase)";
    case "local":
      return " (user's private project instructions, not checked in)";
  }
}

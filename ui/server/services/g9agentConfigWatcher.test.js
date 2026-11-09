import {
  mkdtempSync,
  mkdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fileSymlinkOrSkip } from '../test-support/symlink.js';

let watcherModule;
let tempDir;

afterEach(() => {
  watcherModule?.stopG9AgentConfigWatcher();
  watcherModule = null;
  delete process.env.G9AGENT_CONFIG_PATH;
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  tempDir = null;
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('g9agent config watcher', () => {
  it.for(['directory', 'file'])('reloads when a config through a %s link is atomically replaced', async (type, context) => {
    tempDir = mkdtempSync(join(tmpdir(), 'g9agent-config-watcher-'));
    const linkDir = join(tempDir, 'link');
    const targetDir = join(tempDir, 'managed');
    mkdirSync(targetDir);
    const configPath = join(linkDir, 'g9agent.yaml');
    const targetPath = join(targetDir, 'g9agent.yaml');
    writeFileSync(targetPath, 'schemaVersion: 1\ncustomEnv:\n  VALUE: before\n', 'utf8');
    if (type === 'file') {
      mkdirSync(linkDir);
      if (!fileSymlinkOrSkip(context, targetPath, configPath)) return;
    } else symlinkSync(targetDir, linkDir, process.platform === 'win32' ? 'junction' : 'dir');
    process.env.G9AGENT_CONFIG_PATH = configPath;

    const reloadG9AgentConfig = vi.fn(async () => ({ reloaded: true }));
    vi.doMock('./g9agentConfigReloader.js', () => ({ reloadG9AgentConfig }));
    watcherModule = await import('./g9agentConfigWatcher.js');

    const event = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for config event')), 3000);
      void watcherModule.startG9AgentConfigWatcher({
        onEvent: (payload) => {
          clearTimeout(timeout);
          resolve(payload);
        },
      }).then(() => {
        const replacement = join(targetDir, '.g9agent.yaml.external.tmp');
        writeFileSync(replacement, 'schemaVersion: 1\ncustomEnv:\n  VALUE: after\n', 'utf8');
        renameSync(replacement, targetPath);
      }).catch(reject);
    });

    await expect(event).resolves.toMatchObject({
      source: 'watcher',
      config: { customEnv: { VALUE: 'after' } },
    });
    expect(reloadG9AgentConfig).toHaveBeenCalledOnce();
  });
});

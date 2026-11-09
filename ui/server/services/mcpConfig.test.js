import { mkdirSync, mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getGlobalMcpConfigPath,
  readMcpConfigFile,
  writeMcpConfigFile,
} from './mcpConfig.js';

describe('MCP config writable paths', () => {
  let root;
  let previousPilotHome;
  let previousDesktop;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'g9agent-ui-mcp-config-'));
    previousPilotHome = process.env.G9AGENT_HOME;
    previousDesktop = process.env.G9AGENT_DESKTOP;
    process.env.G9AGENT_HOME = join(root, 'pilot-home');
    process.env.G9AGENT_DESKTOP = '1';
  });

  afterEach(() => {
    if (previousPilotHome === undefined) {
      delete process.env.G9AGENT_HOME;
    } else {
      process.env.G9AGENT_HOME = previousPilotHome;
    }
    if (previousDesktop === undefined) {
      delete process.env.G9AGENT_DESKTOP;
    } else {
      process.env.G9AGENT_DESKTOP = previousDesktop;
    }
    rmSync(root, { recursive: true, force: true });
  });

  it('disables project MCP config for desktop runtime roots', async () => {
    const runtimeRoot = join(root, 'Program Files', 'G9Agent', 'resources', 'runtime');

    const config = await readMcpConfigFile('project', runtimeRoot);

    expect(config.disabled).toBe(true);
    expect(config.path).toBeNull();
    await expect(
      writeMcpConfigFile('project', JSON.stringify({ mcpServers: {} }), runtimeRoot),
    ).rejects.toThrow(/real project/i);
  });

  it('writes global MCP config under pilotHome', async () => {
    const raw = JSON.stringify({
      mcpServers: {
        local: { command: 'node', args: ['server.js'] },
      },
    });

    const config = await writeMcpConfigFile('global', raw, null);

    expect(config.path).toBe(getGlobalMcpConfigPath());
    expect(config.path).toBe(join(process.env.G9AGENT_HOME, 'mcp.json'));
    expect(readFileSync(config.path, 'utf8')).toContain('"local"');
  });

  it('writes project MCP config under real projects', async () => {
    const projectRoot = join(root, 'repo');
    mkdirSync(projectRoot, { recursive: true });

    const config = await writeMcpConfigFile(
      'project',
      JSON.stringify({ mcpServers: { local: { command: 'node' } } }),
      projectRoot,
    );

    expect(config.path).toBe(join(projectRoot, '.g9agent', 'mcp.json'));
  });
});

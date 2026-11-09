import express from 'express';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

const nativeFetch = globalThis.fetch;
const tempDirs = [];

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  delete process.env.G9AGENT_HOME;
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('commands routes', () => {
  it('executes user commands discovered under custom G9AGENT_HOME', async () => {
    const pilotHome = mkdtempSync(join(tmpdir(), 'g9agent-commands-route-'));
    tempDirs.push(pilotHome);
    process.env.G9AGENT_HOME = pilotHome;

    const commandsDir = join(pilotHome, 'commands');
    mkdirSync(commandsDir, { recursive: true });
    const commandPath = join(commandsDir, 'hello.md');
    writeFileSync(commandPath, '---\ndescription: Says hello\n---\nHello $1', 'utf8');

    const { request } = await createCommandsApp();

    const result = await request('/api/commands/execute', {
      method: 'POST',
      body: JSON.stringify({
        commandName: '/hello',
        commandPath,
        args: ['G9Agent'],
      }),
    });

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      type: 'custom',
      command: '/hello',
      content: 'Hello G9Agent',
    });
  });
});

async function createCommandsApp() {
  vi.doMock('../g9agent-bridge.js', () => ({
    getG9AgentGateway: vi.fn(() => { throw new Error('A local Markdown command must not connect to Gateway'); }),
  }));
  vi.doMock('../../shared/modelConstants.js', () => ({
    CODEX_MODELS: [],
    CURSOR_MODELS: [],
  }));
  vi.doMock('../utils/claude-runtime-config.js', () => ({
    getClaudeRuntimeModelConfig: vi.fn(() => ({})),
    getClaudeRuntimeModelValues: vi.fn(() => []),
  }));
  vi.doMock('../services/g9agentConfig.js', () => ({
    readG9AgentConfigFile: vi.fn(() => ({ config: {} })),
    resolveModel: vi.fn((model) => model),
  }));
  vi.doMock('../turnkey-slash.js', () => ({
    executeTurnkeySlashCommand: vi.fn(async () => ({})),
  }));
  vi.doMock('../../../src/adapters/channel/protocol/ChannelCommandRegistry.js', () => ({
    getRegisteredCommands: vi.fn(() => []),
  }));
  vi.doMock('../../../src/cli/commands/chatSearch.js', () => ({
    runChatSearchFormatted: vi.fn(async () => ({ result: {}, text: '' })),
  }));

  const { default: commandsRoutes } = await import('./commands.js');
  const app = express();
  app.use(express.json());
  app.use('/api/commands', commandsRoutes);

  return {
    request: (path, init) => requestJson(app, path, init),
  };
}

async function requestJson(app, path, init = {}) {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    const response = await nativeFetch(`http://127.0.0.1:${port}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
      ...init,
    });
    return { status: response.status, body: await response.json() };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

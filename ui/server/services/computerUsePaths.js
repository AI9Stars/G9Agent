import path from 'node:path';
import os from 'node:os';

export function computerUseDirectory(env = process.env) {
  if (env.G9AGENT_COMPUTER_USE_DIRECTORY) return path.resolve(env.G9AGENT_COMPUTER_USE_DIRECTORY);
  return path.join(path.resolve(env.G9AGENT_HOME || path.join(os.homedir(), '.g9agent')), 'computer-use');
}

export function computerUseMcpConfigPath(env = process.env) {
  return env.G9AGENT_COMPUTER_USE_MCP_CONFIG || path.join(computerUseDirectory(env), 'mcp.json');
}

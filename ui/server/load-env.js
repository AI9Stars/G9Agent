import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  applyConfigToProcessEnv,
  getG9AgentConfigPath,
  readG9AgentConfigFile,
} from './services/g9agentConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../..');

// EDGECLAW_API_BASE_URL / EDGECLAW_API_KEY / EDGECLAW_MODEL used to be
// required here, but no code in ui/ actually consumes those variables —
// chat execution goes through g9agent-bridge.js → src/gateway, which
// reads ~/.g9agent/g9agent.yaml directly. The sanity check has been
// retired; ui/server boots even when the config file is missing.

function applyDerivedRuntimeEnv() {
  const { config } = readG9AgentConfigFile();
  applyConfigToProcessEnv(config);
}

export function getRepoRootDir() {
  return REPO_ROOT;
}

export function getG9AgentConfigFilePath() {
  return getG9AgentConfigPath();
}

export function hasG9AgentConfigFile() {
  return fs.existsSync(getG9AgentConfigPath());
}

// Stub for the deprecated boot-time sanity check. Kept as a named export
// so existing callers (e.g. ui/server/index.js) don't need a coordinated
// removal; the function is now a no-op that returns the empty list of
// missing keys.
export function assertRequiredG9AgentEnv() {
  return [];
}

export function loadRootG9AgentEnv() {
  applyDerivedRuntimeEnv();

  if (!process.env.DATABASE_PATH) {
    process.env.DATABASE_PATH = path.join(process.env.G9AGENT_HOME || path.join(os.homedir(), '.g9agent'), 'auth.db');
  }

  return hasG9AgentConfigFile();
}

loadRootG9AgentEnv();

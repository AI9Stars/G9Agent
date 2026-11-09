// Upgrade only owned namespace locations. Sources remain available for recovery.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const LEGACY_PRODUCT_NAME = '9GClaw';
const LEGACY_PROJECT_DIR = '.9gclaw';
const LEGACY_WORKSPACE_MARKER = '.9gclaw-workspace';
const LEGACY_GENERAL_NAMES = /^9GClaw(?:General)?(?:[2-9]|[1-9]\d+)?$/;
const LEGACY_INSTALLER_GUID = '08ed5a8d-9d33-5436-8d8c-6ce3ff9bc924';
function exists(file) { try { fs.lstatSync(file); return true; } catch (error) { if (['ENOENT', 'ENOTDIR'].includes(error.code)) return false; throw error; } }
function copyMissing(source, destination) {
  if (exists(destination) || !exists(source)) return;
  try { fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
}
function upgradeNames(directory, removeCopiedLegacy = false) {
  for (const [oldName, name] of [['9gclaw.yaml', 'g9agent.yaml'], ['NINEGCLAW.md', 'G9AGENT.md'], ['NINEGCLAW.local.md', 'G9AGENT.local.md']]) {
    copyMissing(path.join(directory, oldName), path.join(directory, name));
    if (removeCopiedLegacy && exists(path.join(directory, oldName))) fs.unlinkSync(path.join(directory, oldName));
  }
  const runtimes = path.join(directory, 'runtimes'), python = path.join(runtimes, 'python');
  if (!exists(python) || fs.lstatSync(runtimes).isSymbolicLink() || !fs.lstatSync(python).isDirectory()) return;
  for (const entry of fs.readdirSync(python, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^[a-f0-9]{24}$/.test(entry.name)) continue;
    const old = path.join(python, entry.name, '.9gclaw-ready');
    copyMissing(old, path.join(python, entry.name, '.g9agent-ready'));
    if (removeCopiedLegacy && exists(old)) fs.unlinkSync(old);
  }
}
function copyDirectory(source, destination) {
  source = path.resolve(source); destination = path.resolve(destination);
  if (exists(destination) || !exists(source)) return;
  if (!fs.statSync(source).isDirectory()) throw new Error(`Legacy state is not a directory: ${source}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true, mode: 0o700 });
  const staging = fs.mkdtempSync(path.join(path.dirname(destination), '.g9agent-migration-'));
  try {
    fs.cpSync(source, staging, { recursive: true, preserveTimestamps: true, dereference: false, verbatimSymlinks: true });
    upgradeNames(staging, true);
    try { fs.renameSync(staging, destination); }
    catch (error) { if (!exists(destination)) throw error; }
  } finally {
    // mkdtemp created this absolute directory beside the destination.
    if (path.dirname(staging) !== path.dirname(destination) || !path.basename(staging).startsWith('.g9agent-migration-')) throw new Error('Invalid migration staging directory');
    fs.rmSync(staging, { recursive: true, force: true });
  }
}
function migrateLegacyEnvironment(env) {
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('NINEGCLAW_') && value !== undefined) {
      const current = `G9AGENT_${key.slice('NINEGCLAW_'.length)}`;
      if (env[current] === undefined) env[current] = value;
    }
  }
}
function migrateLegacyNamespace(env = process.env, { homeDirectory = os.homedir(), appData } = {}) {
  migrateLegacyEnvironment(env);
  if (!env.G9AGENT_HOME) copyDirectory(path.join(homeDirectory, '.9gclaw'), path.join(homeDirectory, '.g9agent'));
  const home = env.G9AGENT_HOME || path.join(homeDirectory, '.g9agent');
  upgradeNames(path.resolve(home === '~' ? homeDirectory : /^~[\\/]/.test(home) ? path.join(homeDirectory, home.slice(2)) : home));
  if (appData) copyDirectory(path.join(appData, '9gclaw-desktop'), path.join(appData, 'g9agent-desktop'));
}
function migrateLegacyProject(projectRoot) {
  copyDirectory(path.join(projectRoot, '.9gclaw'), path.join(projectRoot, '.g9agent'));
  upgradeNames(projectRoot);
  upgradeNames(path.join(projectRoot, '.g9agent'));
}
module.exports = { migrateLegacyNamespace, migrateLegacyProject, migrateLegacyEnvironment,
  LEGACY_PRODUCT_NAME, LEGACY_PROJECT_DIR, LEGACY_WORKSPACE_MARKER, LEGACY_GENERAL_NAMES, LEGACY_INSTALLER_GUID };

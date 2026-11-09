const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { migrateLegacyNamespace, migrateLegacyProject } = require('../legacyNamespace.cjs');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'g9agent-namespace-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
test('default state and desktop profile copy once, preserving history, unknown config and original files', t => {
  const root = fixture(t), old = path.join(root, '.9gclaw'), current = path.join(root, '.g9agent');
  fs.mkdirSync(path.join(old, 'projects', 'example', 'chats'), { recursive: true });
  const yaml = '# keep comments\nunknown: retained\nsecret: synthetic\n';
  fs.writeFileSync(path.join(old, '9gclaw.yaml'), yaml);
  const runtimeKey = 'a'.repeat(24);
  fs.mkdirSync(path.join(old, 'runtimes', 'python', runtimeKey), { recursive: true });
  fs.writeFileSync(path.join(old, 'runtimes', 'python', runtimeKey, '.9gclaw-ready'), 'verified-manifest');
  fs.writeFileSync(path.join(old, 'projects', 'example', 'chats', 'history.jsonl'), '{"text":"history"}\n');
  const appData = path.join(root, 'AppData');
  fs.mkdirSync(path.join(appData, '9gclaw-desktop'), { recursive: true });
  fs.writeFileSync(path.join(appData, '9gclaw-desktop', 'appearance.json'), '{"language":"en"}');
  migrateLegacyNamespace({}, { homeDirectory: root, appData });
  assert.equal(fs.readFileSync(path.join(current, 'g9agent.yaml'), 'utf8'), yaml);
  assert.equal(fs.existsSync(path.join(current, '9gclaw.yaml')), false);
  assert.equal(fs.readFileSync(path.join(current, 'runtimes', 'python', runtimeKey, '.g9agent-ready'), 'utf8'), 'verified-manifest');
  assert.equal(fs.readFileSync(path.join(current, 'projects', 'example', 'chats', 'history.jsonl'), 'utf8'), '{"text":"history"}\n');
  assert.equal(fs.readFileSync(path.join(appData, 'g9agent-desktop', 'appearance.json'), 'utf8'), '{"language":"en"}');
  assert.equal(fs.readFileSync(path.join(old, '9gclaw.yaml'), 'utf8'), yaml);
  fs.writeFileSync(path.join(current, 'g9agent.yaml'), 'new: wins');
  migrateLegacyNamespace({}, { homeDirectory: root, appData });
  assert.equal(fs.readFileSync(path.join(current, 'g9agent.yaml'), 'utf8'), 'new: wins');
  assert.ok(!fs.readdirSync(root).some(name => name.startsWith('.g9agent-migration-')));
});
test('explicit locations and current environment win over legacy aliases', t => {
  const root = fixture(t), custom = path.join(root, 'custom'); fs.mkdirSync(custom);
  fs.writeFileSync(path.join(custom, '9gclaw.yaml'), 'custom: true');
  const env = { G9AGENT_HOME: custom, NINEGCLAW_HOME: path.join(root, 'unused'), NINEGCLAW_PROXY: 'http://example.com', G9AGENT_PROXY: 'http://example.org' };
  migrateLegacyNamespace(env, { homeDirectory: root });
  assert.equal(env.G9AGENT_HOME, custom); assert.equal(env.G9AGENT_PROXY, 'http://example.org');
  assert.equal(fs.readFileSync(path.join(custom, 'g9agent.yaml'), 'utf8'), 'custom: true');
  assert.equal(fs.existsSync(path.join(root, '.g9agent')), false);
  const legacyEnv = { NINEGCLAW_HOME: custom, NINEGCLAW_CONFIG_PATH: path.join(custom, 'override.yaml') };
  migrateLegacyNamespace(legacyEnv, { homeDirectory: root });
  assert.equal(legacyEnv.G9AGENT_HOME, custom); assert.equal(legacyEnv.G9AGENT_CONFIG_PATH, legacyEnv.NINEGCLAW_CONFIG_PATH);
});
test('project state and instruction names migrate without overwriting new files', t => {
  const root = fixture(t); fs.mkdirSync(path.join(root, '.9gclaw'));
  fs.writeFileSync(path.join(root, '.9gclaw', '9gclaw.yaml'), 'project: true');
  fs.writeFileSync(path.join(root, 'NINEGCLAW.md'), 'legacy instructions');
  migrateLegacyProject(root);
  assert.equal(fs.readFileSync(path.join(root, '.g9agent', 'g9agent.yaml'), 'utf8'), 'project: true');
  assert.equal(fs.readFileSync(path.join(root, 'G9AGENT.md'), 'utf8'), 'legacy instructions');
  fs.writeFileSync(path.join(root, 'G9AGENT.md'), 'current instructions'); migrateLegacyProject(root);
  assert.equal(fs.readFileSync(path.join(root, 'G9AGENT.md'), 'utf8'), 'current instructions');
});
test('failed state publication does not leave a partial new profile', t => {
  const root = fixture(t); fs.writeFileSync(path.join(root, '.9gclaw'), 'not a directory');
  assert.throws(() => migrateLegacyNamespace({}, { homeDirectory: root }), /not a directory/);
  assert.equal(fs.existsSync(path.join(root, '.g9agent')), false);
});
test('interrupted copies preserve the source and remove private partial staging files', t => {
  const root = fixture(t), old = path.join(root, '.9gclaw'); fs.mkdirSync(old);
  fs.writeFileSync(path.join(old, '9gclaw.yaml'), 'secret: synthetic');
  t.mock.method(fs, 'cpSync', (_source, destination) => {
    fs.writeFileSync(path.join(destination, 'partial.yaml'), 'secret: synthetic');
    throw Object.assign(new Error('copy interrupted'), { code: 'EIO' });
  });
  assert.throws(() => migrateLegacyNamespace({}, { homeDirectory: root }), /copy interrupted/);
  assert.equal(fs.existsSync(path.join(root, '.g9agent')), false);
  assert.equal(fs.readFileSync(path.join(old, '9gclaw.yaml'), 'utf8'), 'secret: synthetic');
  assert.ok(!fs.readdirSync(root).some(name => name.startsWith('.g9agent-migration-')));
});
test('Core and Web startup resolve the same renamed default home and preserve raw configuration', t => {
  const root = fixture(t), repository = path.resolve(__dirname, '../../..');
  fs.mkdirSync(path.join(root, '.9gclaw'));
  fs.writeFileSync(path.join(root, '.9gclaw', '9gclaw.yaml'), '# original\nunknown: preserved\n');
  const env = { ...process.env, HOME: root, USERPROFILE: root };
  for (const key of Object.keys(env)) if (/^(?:G9AGENT|NINEGCLAW)_/.test(key)) delete env[key];
  const code = `import {resolvePilotHome, getPilotConfigFilePath} from './src/pilot/paths.ts';
    import {resolvePilotHome as webHome} from './ui/server/utils/pilotPaths.js';
    const home = resolvePilotHome(); process.stdout.write(JSON.stringify([home, webHome(), getPilotConfigFilePath(home)]));`;
  const result = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', code], { cwd: repository, env, encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 0, result.stderr);
  const home = path.join(root, '.g9agent');
  assert.deepEqual(JSON.parse(result.stdout), [home, home, path.join(home, 'g9agent.yaml')]);
  assert.equal(fs.readFileSync(path.join(home, 'g9agent.yaml'), 'utf8'), '# original\nunknown: preserved\n');
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import ts from 'typescript';

test('namespace sync preserves valid code/CSS identifiers, wire keys, binary bytes and dry-run safety', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'g9agent-rebrand-'));
  const script = path.join(import.meta.dirname, 'rebrand-tracked-files.mjs');
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  const run = (...args) => execFileSync(process.execPath, [script, '--from', 'LegacyDeck', ...args], { cwd: root, encoding: 'utf8' });
  try {
    git('init', '--quiet');
    const original = `export class LegacyDeckRuntime {}
export const legacydeckDesktop = {};
export const providers = { legacydeck: true };
export const style = 'legacydeck-widget legacydeck-docx-wrapper';
export const renderOptions = { className: 'legacydeck-docx' };
export const directory = 'LegacyDeckGeneral';
export const uppercaseDirectory = '.LEGACYDECK';
export const setting = process.env.LEGACYDECK_CONFIG_PATH;
export const help = 'Set LEGACYDECK_CONFIG_PATH to choose a configuration.';
export const bridge = window.legacydeckDesktop;
`;
    const bytes = Buffer.from([0, 255, 12, 13, 128]);
    fs.writeFileSync(path.join(root, 'legacydeck.ts'), original);
    fs.writeFileSync(path.join(root, 'style.css'), '.legacydeck-widget { color: red }');
    fs.writeFileSync(path.join(root, 'legacydeck-logo.png'), bytes);
    git('add', '-A');
    assert.match(run(), /Would rebrand 3 tracked files/);
    assert.equal(fs.readFileSync(path.join(root, 'legacydeck.ts'), 'utf8'), original);
    run('--apply');
    assert.equal(fs.existsSync(path.join(root, 'legacydeck.ts')), false);
    const code = fs.readFileSync(path.join(root, 'g9agent.ts'), 'utf8');
    assert.match(code, /class G9AgentRuntime/);
    assert.match(code, /const g9agentDesktop/);
    assert.match(code, /g9agent: true/);
    assert.match(code, /g9agent-widget g9agent-docx-wrapper/);
    assert.match(code, /'G9AgentGeneral'/);
    assert.match(code, /'\.G9AGENT'/);
    assert.match(code, /env\.G9AGENT_CONFIG_PATH/);
    assert.match(code, /Set G9AGENT_CONFIG_PATH to choose a configuration/);
    assert.match(code, /window\.g9agentDesktop/);
    assert.doesNotMatch(code, /g9agent_CONFIG_PATH/);
    assert.equal(ts.createSourceFile('g9agent.ts', code, ts.ScriptTarget.Latest).parseDiagnostics.length, 0);
    assert.equal(fs.readFileSync(path.join(root, 'style.css'), 'utf8'), '.g9agent-widget { color: red }');
    assert.deepEqual(fs.readFileSync(path.join(root, 'g9agent-logo.png')), bytes);
    git('add', '-A');
    assert.match(run(), /Would rebrand 0 tracked files/);
  } finally {
    assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep));
    fs.rmSync(root, { recursive: true, force: true });
  }
});

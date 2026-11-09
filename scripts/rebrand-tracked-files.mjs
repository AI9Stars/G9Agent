// Reapply the fork namespace after syncing upstream; preserve original media.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).trim();
const args = process.argv.slice(2);
const source = args.includes('--from') ? args[args.indexOf('--from') + 1]
  : path.posix.basename(git('remote', 'get-url', 'upstream')).replace(/\.git$/, '');
if (!source || source.toLowerCase() === 'g9agent' || !/^[a-z0-9]+$/i.test(source)) {
  throw new Error('Provide an upstream brand using --from <name>, or configure the upstream remote.');
}
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const lower = source.toLowerCase(), upper = source.toUpperCase();
const camel = source[0].toLowerCase() + source.slice(1);
const forms = new RegExp([...new Set([source, camel, lower, upper])].map(escape).sort((a,b) => b.length-a.length).join('|'), 'g');
const plain = value => {
  if (lower === '9gclaw') value = value.replace(/NINEGCLAW/g, 'G9AGENT').replace(/NineGClaw/g, 'G9Agent').replace(/nineGClaw|ninegclaw/g, 'g9agent');
  return value.replace(forms, match => match === upper ? 'G9AGENT' : match === source ? 'G9Agent' : 'g9agent')
    .replace(new RegExp(escape(source), 'gi'), 'g9agent').replaceAll('PILOT_HOME', 'G9AGENT_HOME');
};
const references = value => value
  .replace(new RegExp(`https://github\\.com/(?:OpenBMB|mssssss123)/${escape(source)}/actions/runs/\\d+`, 'gi'), 'https://github.com/AI9Stars/G9Agent/actions')
  .replace(new RegExp(`OpenBMB/${escape(source)}`, 'gi'), 'AI9Stars/G9Agent')
  .replace(new RegExp(`https?://${escape(lower)}\\.openbmb\\.cn(?:/[a-zA-Z0-9_./-]*)?`, 'g'), 'https://github.com/AI9Stars/G9Agent')
  .replace(new RegExp(`https://github\\.com/${escape(lower)}\\b`, 'g'), 'https://github.com/AI9Stars');

const root = git('rev-parse', '--show-toplevel');
process.chdir(root);
const preserved = new Set([
  'scripts/rebrand-tracked-files.mjs', 'scripts/check-branding.mjs',
  'ui/shared/releaseRepository.js', 'packages/config/legacyNamespace.cjs',
  'packages/config/tests/legacyNamespace.test.cjs',
  'ui/shared/legacyNamespace.js', 'ui/src/lib/legacyNamespace.spec.ts',
]);
const apply = args.includes('--apply');
let count = 0;
for (const file of git('ls-files', '-z').split('\0')) {
  if (!file || preserved.has(file) || /^README[^/]*\.md$/.test(file) || file.startsWith('assets/') || !fs.existsSync(file)) continue;
  const bytes = fs.readFileSync(file), original = bytes.toString('utf8');
  const next = !bytes.includes(0) && Buffer.from(original).equals(bytes) ? plain(references(original)) : original;
  const renamed = plain(file);
  if (next === original && renamed === file) continue;
  count++;
  if (apply) {
    const destination = path.resolve(renamed);
    if (!destination.startsWith(path.resolve(root) + path.sep)) throw new Error(`Unexpected destination: ${renamed}`);
    if (next !== original) fs.writeFileSync(file, next);
    if (renamed !== file) {
      if (fs.existsSync(destination)) throw new Error(`Destination already exists: ${renamed}`);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.renameSync(file, destination);
    }
  }
}
console.log(`${apply ? 'Rebranded' : 'Would rebrand'} ${count} tracked files.`);

// Shared runtime paths and diagnostics. Namespace migration preserves raw files;
// configuration readers/writers retain schema and storage ownership.
const os=require('node:os'), path=require('node:path');
const legacy = require('./legacyNamespace.cjs');
legacy.migrateLegacyEnvironment(process.env);
function resolveConfigHome(env=process.env) {
  legacy.migrateLegacyNamespace(env);
  const home=env.G9AGENT_HOME || path.join(os.homedir(),'.g9agent');
  return path.resolve(home==='~'?os.homedir():/^~[\\/]/.test(home)?path.join(os.homedir(),home.slice(2)):home);
}
module.exports={resolveConfigHome,...require('./legacyNamespace.cjs'),...require('./errors.cjs'),...require('./runtimeLogs.cjs')};

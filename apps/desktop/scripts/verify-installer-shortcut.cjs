// Exercise the real shortcut macro in a disposable directory, without installing.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { createRequire } = require('node:module');
const builder = createRequire(require.resolve('electron-builder'));
const lib = path.dirname(builder.resolve('app-builder-lib/package.json'));
const { getMakeNsisPath, getNsisPluginsPath } = require(path.join(lib, 'out/toolsets/windows.js'));
const { NsisScriptGenerator } = require(path.join(lib, 'out/targets/nsis/nsisScriptGenerator.js'));
(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'g9agent-shortcut-'));
  try {
    const app = path.join(root, 'application 中文'), desktop = path.join(root, 'desktop 中文');
    fs.mkdirSync(app); fs.mkdirSync(desktop);
    fs.copyFileSync(path.join(process.env.WINDIR, 'System32/where.exe'), path.join(app, 'G9Agent.exe'));
    const binary = await getMakeNsisPath(), plugins = await getNsisPluginsPath();
    const generator = new NsisScriptGenerator();
    generator.addIncludeDir(path.join(lib, 'templates/nsis/include'));
    generator.addPluginDir('x86-unicode', path.join(plugins, 'x86-unicode'));
    generator.include(path.join(lib, 'templates/nsis/include/StdUtils.nsh'));
    generator.flags(['updated']);
    const output = path.join(root, 'shortcut-test.exe');
    const script = `Unicode true
RequestExecutionLevel user
SilentInstall silent
${generator.build()}
!define PRODUCT_NAME "G9Agent"
!define PRODUCT_FILENAME "G9Agent"
!define APP_ID "cn.g9agent.test"
!define VERSION "2026.1102.0"
!define PROJECT_DIR "${path.resolve(__dirname, '..')}"
!include "${path.resolve(__dirname, '../resources/installer.nsh')}"
!include "common.nsh"
Name "G9Agent shortcut verification"
OutFile "${output}"
InstallDir "${app}"
Section
  !insertmacro G9AgentDesktopShortcut "${desktop}"
SectionEnd
`;
    execFileSync(binary.path, ['-V2', '-INPUTCHARSET', 'UTF8', '-'], { cwd: path.join(lib, 'templates/nsis'), input: script, env: { ...process.env, ...binary.env }, stdio: 'pipe' });
    execFileSync(output, ['/S'], { windowsHide: true, timeout: 30000 });
    const link = path.join(desktop, 'G9Agent.lnk');
    assert.ok(fs.statSync(link).size > 0);
    const inspect = path.join(root, 'inspect.ps1');
    fs.writeFileSync(inspect, "[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)\n$linkPath = $env:PD_TEST_SHORTCUT\n$shell = New-Object -ComObject WScript.Shell\n$link = $shell.CreateShortcut($linkPath)\n$folder = (New-Object -ComObject Shell.Application).Namespace([IO.Path]::GetDirectoryName($linkPath))\n@{target=$link.TargetPath;icon=$link.IconLocation;id=$folder.ParseName([IO.Path]::GetFileName($linkPath)).ExtendedProperty('System.AppUserModel.ID')} | ConvertTo-Json -Compress\n");
    const result = JSON.parse(execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-File', inspect], { encoding: 'utf8', windowsHide: true, env: { ...process.env, PD_TEST_SHORTCUT: link }, timeout: 30000 }));
    assert.equal(result.target.toLowerCase(), path.join(app, 'G9Agent.exe').toLowerCase());
    assert.equal(result.id, 'cn.g9agent.test');
    assert.ok(result.icon.toLowerCase().startsWith(result.target.toLowerCase()));
    console.log('PASS: real desktop shortcut target, icon and AppUserModelID; Unicode paths; no user desktop modified.');
  } finally {
    const resolved = fs.realpathSync(root), parent = fs.realpathSync(os.tmpdir());
    if (path.dirname(resolved) !== parent || !path.basename(resolved).startsWith('g9agent-shortcut-')) throw new Error('Unexpected test cleanup path');
    fs.rmSync(resolved, { recursive: true, force: true });
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });

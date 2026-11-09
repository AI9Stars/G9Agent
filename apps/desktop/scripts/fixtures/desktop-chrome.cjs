// Isolated native smoke host: no real G9Agent runtime, profile or user files.
const { app, BrowserWindow, ipcMain, Menu, nativeTheme, screen } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { isRendererEditingShortcut, windowChromeOptions, windowPalette, WINDOWS_CAPTION_HEIGHT } = require('../../dist/windowChrome');
const { buildApplicationMenu } = require('../../dist/applicationMenu');
const { WindowsCaptionMenu } = require('../../dist/windowsCaptionMenu');
const { normalizeMenuState, emptyMenuState, commandEnabled } = require('../../dist/desktopCommands');
const { desktopAboutInfo, presentDesktopAbout } = require('../../dist/desktopAbout');
const profile = process.env.G9AGENT_CHROME_PROFILE || fs.mkdtempSync(path.join(os.tmpdir(), 'g9agent-chrome-'));
app.setPath('userData', profile);
app.setName('G9Agent Chrome Test');
let window;
let loaded = false;
let state = { ...emptyMenuState };
let appearance = { language: 'en', themeMode: 'dark' };
let checks = 0;
let menuRequests = [];
const openedDirectories = [];
let captionMenu;
let aboutDialogs = [], copiedVersion = '', openedWebsite = '';
function menuTemplate() {
  return buildApplicationMenu(process.platform, appearance.language, undefined, {
    state, dispatch: command => { if (commandEnabled(command, state)) window.webContents.send('g9agent:command', command); },
    help: action => {
      if (action === 'about') void presentDesktopAbout({ language: appearance.language, appVersion: '0.1.0-test',
        metadata: { version: '2026.930.0-test', buildTime: '2026-09-30T04:00:00Z', commitSha: 'abc123fixture' },
        platform: process.platform, arch: process.arch, osRelease: os.release(), versions: process.versions }, {
        showDialog: async options => { aboutDialogs.push(options); return { response: global.aboutResponse || 0 }; },
        copy: text => { copiedVersion = text; }, openWebsite: async url => { openedWebsite = url; },
      });
    },
  });
}
function refresh() {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate()));
  if ((process.platform === 'win32' || process.platform === 'linux') && window) window.setMenuBarVisibility(false);
  if (process.platform === 'linux' && window && !window.isDestroyed()) window.webContents.send('g9agent:application-menu-updated');
}
function publish() {
  if (!window) return;
  const fullscreen = window.isFullScreen();
  const palette = windowPalette(nativeTheme.shouldUseDarkColors, process.platform, appearance.lightAppearance);
  window.setBackgroundColor(palette.background);
  if ((process.platform === 'win32' || process.platform === 'linux') && !fullscreen) window.setTitleBarOverlay({
    color: palette.caption,
    symbolColor: palette.symbol, height: WINDOWS_CAPTION_HEIGHT,
  });
  window.webContents.send('g9agent:window-state', { fullscreen, dark: nativeTheme.shouldUseDarkColors, palette });
}
ipcMain.on('g9agent:get-appearance', e => { e.returnValue = appearance; });
ipcMain.on('g9agent:get-window-state', e => { e.returnValue = { fullscreen: window.isFullScreen(), dark: nativeTheme.shouldUseDarkColors, palette: windowPalette(nativeTheme.shouldUseDarkColors, process.platform, appearance.lightAppearance) }; });
ipcMain.handle('g9agent:set-appearance', (_e, value) => { appearance = value; nativeTheme.themeSource = value.themeMode; publish(); refresh(); });
ipcMain.handle('g9agent:menu-state', (_e, value) => {
  const next = normalizeMenuState(value);
  // Match production: unchanged renderer state must not rebuild native menus.
  if (JSON.stringify(next) === JSON.stringify(state)) return;
  state = next;
  refresh();
});
ipcMain.handle('g9agent:get-runtime-info', () => null);
ipcMain.handle('g9agent:notification-status', () => ({ supported: false, permission: 'unknown',
  preferences: { enabled: false, sound: false, badge: false, preview: false } }));
// Record native folder requests without launching the user's file manager.
ipcMain.handle('g9agent:open-directory', (_event, directory) => { openedDirectories.push(directory); return true; });
// The shared pre-bundle startup page reads this synchronously, just like the
// production shell. A missing handler leaves Chromium waiting during navigation.
ipcMain.on('g9agent:get-runtime-status', event => {
  event.returnValue = { phase: 'ready', progress: 96, startedAt: Date.now(), phaseStartedAt: Date.now() };
});
ipcMain.handle('g9agent:about-info', () => desktopAboutInfo({ language: appearance.language, appVersion: '0.1.0-test',
  metadata: { version: '2026.930.0-test', buildTime: '2026-09-30T04:00:00Z', commitSha: 'abc123fixture' },
  platform: process.platform, arch: process.arch, osRelease: os.release(), versions: process.versions }));

ipcMain.handle('g9agent:update-check', () => { checks++; return { current: { version: '0.1.0-test' }, latest: null, hasUpdate: false, canDownload: false, checkUnavailable: false }; });
ipcMain.handle('g9agent:update-status', () => ({ state: 'idle', progress: 0 }));
ipcMain.handle('g9agent:show-menu', (_e, request) => {
  menuRequests.push(request || { id: 'all' });
  captionMenu ||= new WindowsCaptionMenu(window, menuTemplate, items => Menu.buildFromTemplate(items), () => screen.getCursorScreenPoint());
  return captionMenu.show(request);
});
ipcMain.handle('g9agent:chrome-close-menu', () => captionMenu?.close());
nativeTheme.on('updated', publish);
global.chromeTest = { loaded: () => loaded, state: () => state, checks: () => checks, menuRequests: () => menuRequests,
  refreshMenu: refresh, openedDirectories: () => openedDirectories,
  about: () => ({ dialogs: aboutDialogs, copiedVersion, openedWebsite }) };
app.whenReady().then(async () => {
  nativeTheme.themeSource = 'dark';
  window = new BrowserWindow({ ...windowChromeOptions(process.platform, true), show: true, width: 1320, height: 900,
    autoHideMenuBar: process.platform === 'win32' || process.platform === 'linux',
    webPreferences: { preload: path.join(__dirname, 'desktop-chrome-preload.cjs'), contextIsolation: true, sandbox: false, nodeIntegration: false, backgroundThrottling: false },
  });
  window.once('ready-to-show', () => window.show());
  window.webContents.on('render-process-gone', (_event, details) => console.error('Chrome renderer exited:', details));
  window.on('enter-full-screen', () => setImmediate(publish));
  window.on('leave-full-screen', () => setImmediate(publish));
  window.webContents.on('before-input-event', (_event, input) => {
    window.webContents.setIgnoreMenuShortcuts(isRendererEditingShortcut(process.platform, input));
  });
  refresh();
  await window.loadURL('about:blank');
  loaded = true;
});
app.on('window-all-closed', () => app.quit());
// The parent removes its temporary profile after Chromium releases Windows locks.

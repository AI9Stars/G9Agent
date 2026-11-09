import { contextBridge, ipcRenderer, webFrame, type IpcRendererEvent } from "electron";

import { installWindowChrome } from "./preloadChrome";
import type { DesktopCommand, DesktopMenuState } from "./desktopCommands";
import type { DesktopAppearance } from './appearance';
import type { FilePickerRequest, FilePickerResult } from './filePicker';
import type { NotificationPreferences, SystemNotification } from '../../../ui/shared/notifications';

installWindowChrome(process.platform, ipcRenderer);

type RuntimeStatus = {
  phase: string;
  message: string;
  logPath?: string;
  error?: string;
  progress?: number;
  startedAt?: number;
  phaseStartedAt?: number;
};

contextBridge.exposeInMainWorld("g9agentDesktop", {
  platform: process.platform,
  getUninstallStatus: () => ipcRenderer.invoke('g9agent:uninstall-status') as Promise<{ supported: boolean }>,
  uninstall: () => ipcRenderer.invoke('g9agent:uninstall') as Promise<{ canceled: boolean }>,
  getNotificationStatus: () => ipcRenderer.invoke('g9agent:notification-status'),
  setNotificationPreferences: (value: NotificationPreferences) => ipcRenderer.invoke('g9agent:notification-preferences', value),
  showNotification: (value: SystemNotification) => ipcRenderer.invoke('g9agent:notification-show', value),
  recordTaskReminder: (value: SystemNotification) => ipcRenderer.invoke('g9agent:notification-reminder', value),
  setNotificationScope: (scope: string | null) => ipcRenderer.invoke('g9agent:notification-scope', scope),
  openNotificationSettings: () => ipcRenderer.invoke('g9agent:notification-settings'),
  onNotificationNavigate: (callback: (data: SystemNotification['data']) => void) => {
    const listener = (_event: IpcRendererEvent, data: SystemNotification['data']) => callback(data);
    ipcRenderer.on('g9agent:notification-navigate', listener);
    return () => ipcRenderer.off('g9agent:notification-navigate', listener);
  },
  // Zoom roles in the application menu drive these; the renderer polls the
  // factor on window resize to show transient feedback (webFrame has no events).
  getZoomFactor: () => webFrame.getZoomFactor(),
  resetZoom: () => {
    webFrame.setZoomLevel(0);
  },
  setMenuState: (state: DesktopMenuState) => ipcRenderer.invoke("g9agent:menu-state", state),
  onCommand: (callback: (command: DesktopCommand) => void) => {
    const listener = (_event: IpcRendererEvent, command: DesktopCommand) => callback(command);
    ipcRenderer.on("g9agent:command", listener);
    return () => ipcRenderer.off("g9agent:command", listener);
  },
  getAppearance: () => ipcRenderer.sendSync("g9agent:get-appearance") as DesktopAppearance | null,
  getAppearanceCapabilities: () => ipcRenderer.invoke('g9agent:appearance-capabilities') as Promise<{ hardwareAcceleration: boolean }>,
  setAppearance: (value: Partial<DesktopAppearance>) => ipcRenderer.invoke("g9agent:set-appearance", value),
  saveAppearanceImage: (bytes: Uint8Array) => ipcRenderer.invoke('g9agent:save-appearance-image', bytes),
  readAppearanceImage: (id: string) => ipcRenderer.invoke('g9agent:read-appearance-image', id),
  deleteAppearanceImage: (id: string) => ipcRenderer.invoke('g9agent:delete-appearance-image', id),
  checkUpdates: () => ipcRenderer.invoke("g9agent:update-check"),
  getUpdateStatus: () => ipcRenderer.invoke("g9agent:update-status"),
  startUpdate: () => ipcRenderer.invoke("g9agent:update-start"),
  cancelUpdate: () => ipcRenderer.invoke("g9agent:update-cancel"),
  pauseUpdate: () => ipcRenderer.invoke("g9agent:update-pause"),
  resumeUpdate: () => ipcRenderer.invoke("g9agent:update-resume"),
  getRuntimeInfo: () => ipcRenderer.invoke("g9agent:get-runtime-info"),
  getRuntimeStatus: () => ipcRenderer.sendSync('g9agent:get-runtime-status') as RuntimeStatus | null,
  saveRuntimeLogs: () => ipcRenderer.invoke('g9agent:save-runtime-logs') as Promise<{ canceled: boolean }>,
  getAboutInfo: () => ipcRenderer.invoke("g9agent:about-info"),
  onRuntimeStatus: (callback: (status: RuntimeStatus) => void) => {
    const listener = (_event: IpcRendererEvent, status: RuntimeStatus) => callback(status);
    ipcRenderer.on("g9agent:runtime-status", listener);
    return () => ipcRenderer.off("g9agent:runtime-status", listener);
  },
  retryRuntime: () => ipcRenderer.invoke("g9agent:retry-runtime"),
  openRuntimeLog: () => ipcRenderer.invoke("g9agent:open-runtime-log"),
  pickFolder: () => ipcRenderer.invoke("g9agent:pick-folder"),
  openDirectory: (directory: string) => ipcRenderer.invoke('g9agent:open-directory', directory) as Promise<boolean>,
  pickFiles: (request: FilePickerRequest) => ipcRenderer.invoke('g9agent:pick-files', request) as Promise<FilePickerResult>,
});

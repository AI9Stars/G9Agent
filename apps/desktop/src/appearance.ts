import { productName } from './brand';
import { startupLabels, startupVisualProgress } from './startupPresentation';
import { startupStyle } from './startupStyle';
import { LEGACY_LIGHT_PRESETS, LIGHT_PRESETS, normalizeLightAppearance, deriveLightColors, type LightAppearance } from './lightAppearance';
import { normalizeInterfacePreferences, type InterfacePreferences } from './interfacePreferences';
export type DesktopAppearance = { language: 'en' | 'zh-CN'; themeMode: 'light' | 'dark' | 'system'; lightAppearance?: LightAppearance; interfacePreferences?: InterfacePreferences };

export function normalizeAppearance(value: unknown, locale = 'en'): DesktopAppearance {
  const record = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    language: record.language === 'en' || record.language === 'zh-CN' ? record.language : locale.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en',
    themeMode: record.themeMode === 'light' || record.themeMode === 'dark' ? record.themeMode : 'system',
    ...(record.lightAppearance !== undefined ? { lightAppearance: normalizeLightAppearance(record.lightAppearance) } : {}),
    ...(record.interfacePreferences !== undefined ? { interfacePreferences: normalizeInterfacePreferences(record.interfacePreferences) } : {}),
  };
}

const STARTUP_ZH: Record<string, string> = {
  "Preparing G9Agent runtime...": "正在准备 九格智能体 运行环境…",
  "Checking local configuration...": "正在检查本地配置…",
  "Starting Web UI server...": "正在启动网页服务…",
  "G9Agent is ready for model setup.": "九格智能体 已就绪，请配置模型。",
  "G9Agent runtime stopped.": "九格智能体 运行环境已停止。",
  "Gateway exited unexpectedly. The Web UI is still available.": "Gateway 意外退出，网页界面仍可使用。",
  "Model configuration needs attention.": "模型配置需要修复。",
  "Starting local gateway...": "正在启动本地 Gateway…",
  "G9Agent is ready.": "九格智能体 已就绪。",
  "Gateway failed to start. The Web UI is still available.": "Gateway 启动失败，网页界面仍可使用。",
  "server exited unexpectedly. See runtime log for details.": "网页服务意外退出，请查看运行日志。",
  "gateway exited unexpectedly. See runtime log for details.": "Gateway 意外退出，请查看运行日志。",
  "G9Agent failed to start.": "九格智能体 启动失败。",
  "G9Agent failed to restore window.": "九格智能体 无法恢复窗口。",
  "Retry": "重试",
  "Open Log": "打开日志",
  "Starting G9Agent...": "正在启动 九格智能体…",
  "Log: ": "日志：",
  "Unknown startup error.": "未知的启动错误。",
  "G9Agent could not stop": "九格智能体 无法停止"
};

export function startupText(message: string, language: DesktopAppearance['language']): string {
  return language === 'zh-CN' ? STARTUP_ZH[message] || message : message;
}

export function renderLoadingHtml(appearance: DesktopAppearance, web = false, logoBase64?: string): string {
  const labels = startupLabels(appearance.language);
  const light = normalizeLightAppearance(appearance.lightAppearance);
  const canvas = light.preset === 'default' ? '#ffffff' : deriveLightColors(light).background;
  return `<!doctype html><html lang="${appearance.language}" data-theme="${appearance.themeMode}">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${productName(appearance.language)}</title>
<style>
:root{color-scheme:light;--startup-bg:${canvas};--startup-fg:#171717;--startup-muted:#737373;--startup-line:#e5e5e5}
:root[data-theme="dark"]{color-scheme:dark;--startup-bg:#23252b;--startup-fg:#f5f5f5;--startup-muted:#a3a3a3;--startup-line:#262626}
@media(prefers-color-scheme:dark){:root[data-theme="system"]{color-scheme:dark;--startup-bg:#23252b;--startup-fg:#f5f5f5;--startup-muted:#a3a3a3;--startup-line:#262626}}
${startupStyle}
#failure{display:none}#startup[data-error=true] #loading{display:none}#startup[data-error=true] #failure{display:block}#saveStatus:empty{display:none}
</style></head><body style="margin:0"><div class="pd-startup-screen" id="startup"><main><h1 class="pd-startup-brand"><img class="pd-startup-logo" src="${logoBase64 ? `data:image/png;base64,${logoBase64}` : '/logo-256.png'}" alt=""/><span>${productName(appearance.language)}</span></h1>
<div id="loading" role="status"><div class="pd-startup-track" role="progressbar" aria-label="${productName(appearance.language)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="8"><div class="pd-startup-bar" id="bar" style="width:8%"></div></div><p class="pd-startup-message" id="message">${labels.starting}</p></div>
<section class="pd-startup-failure" id="failure" role="alert"><h2>${labels.failed}</h2><p class="reason" id="reason"></p><div class="pd-startup-meta" id="code"></div><p class="pd-startup-meta" id="log"></p><div class="pd-startup-actions"><button id="retry">${labels.restart}</button><button id="saveLog" class="secondary">${labels.save}</button></div><p class="pd-startup-meta" id="saveStatus" role="status"></p></section>
</main></div><script>(()=>{
const web=${web};
const languages=${JSON.stringify({ en: startupLabels('en'), 'zh-CN': startupLabels('zh-CN') })};
const saved=key=>{try{return localStorage.getItem(key)}catch{return null}};
const appearance=web?(window.g9agentDesktop?.getAppearance?.()||{language:saved('userLanguage')||'en',themeMode:saved('themeMode')||saved('theme')||'system'}):${JSON.stringify({ language: appearance.language, themeMode: appearance.themeMode })};
let labels=languages[appearance.language]||languages.en;
const brandNames=${JSON.stringify({ en: productName('en'), 'zh-CN': productName('zh-CN') })};
function localize(language){
 labels=languages[language]||languages.en;
 const name=brandNames[language]||brandNames.en;
 document.title=name;document.documentElement.lang=language==='zh-CN'?'zh-CN':'en';
 document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content',name);
 document.querySelector('link[rel="manifest"]')?.setAttribute('href',language==='zh-CN'?'/manifest.zh-CN.json':'/manifest.json');
 document.querySelector('.pd-startup-brand span').textContent=name;
 document.querySelector('[role="progressbar"]').setAttribute('aria-label',name);
 document.querySelector('#failure h2').textContent=labels.failed;
 document.getElementById('retry').textContent=labels.restart;
 document.getElementById('saveLog').textContent=labels.save;
}
localize(appearance.language);
if(web){
 document.documentElement.dataset.theme=appearance.themeMode;
 // The application's default canvas is lavender. Keep the startup canvas the
 // same as the native document, even after the application's CSS has loaded.
 let preference=appearance.lightAppearance;try{preference??=JSON.parse(saved('g9agent-light-appearance-v1')||'null')}catch{}
 const presets=${JSON.stringify({ ...LIGHT_PRESETS, ...LEGACY_LIGHT_PRESETS })};
 const background=preference?.preset==='custom'?preference.custom?.background:preference?.preset!=='default'?presets[preference?.preset]?.background:null;
 const dark=appearance.themeMode==='dark'||appearance.themeMode==='system'&&window.matchMedia?.('(prefers-color-scheme: dark)').matches;
 document.documentElement.style.setProperty('--startup-bg',dark?'#23252b':/^#[0-9a-f]{6}$/i.test(background)?background:'#ffffff');
}
const root=document.getElementById('startup'),bar=document.getElementById('bar'),message=document.getElementById('message');
const visualProgress=${startupVisualProgress.toString()};
let current={phase:'starting',progress:8,startedAt:Date.now(),phaseStartedAt:Date.now()};
let animationStart=0;
function draw(){bar.style.width=visualProgress(current)+'%';bar.parentElement.setAttribute('aria-valuenow',String(current.progress||8))}
function update(status){
 if(!status)return;
 const reset=status.phase==='starting'&&current.phase!=='starting';
 const finishing=current.completed&&!reset&&status.phase!=='error'&&status.phase!=='stopped';
 current={...status,completed:!!(status.completed||finishing),leaving:!!(status.leaving||finishing&&current.leaving),progress:reset?8:Math.max(current.progress||8,status.progress||8),startedAt:status.startedAt||(reset?Date.now():current.startedAt),phaseStartedAt:status.phaseStartedAt||(status.phase===current.phase?current.phaseStartedAt:Date.now())};
 if(status.language)localize(status.language);
 if(animationStart!==current.startedAt){animationStart=current.startedAt;root.style.setProperty('--startup-animation-offset',-(Date.now()-animationStart)+'ms')}
 window.__g9agentStartupState=current;root.dataset.error=String(status.phase==='error');root.dataset.complete=String(current.completed);root.dataset.leaving=String(current.leaving);draw();
 if(status.phase==='error'){
  const code=(status.error||'').match(/\\bPD_[A-Z_]+\\b/)?.[0]||'PD_RUNTIME_PROCESS_FAILED';
  document.getElementById('reason').textContent=labels[code]||labels.unknown;
  document.getElementById('code').textContent=code;
  document.getElementById('log').textContent=status.logPath?labels.log+': '+status.logPath:'';
 }else message.textContent=labels[status.phase]||labels.starting;
}
message.textContent=labels.starting;document.querySelector('#failure h2').textContent=labels.failed;document.getElementById('retry').textContent=labels.restart;document.getElementById('saveLog').textContent=labels.save;
// Seed the real position before enabling transitions. A new document must not
// animate from the template's 8% after the native loading page nearly finished.
bar.style.transition='none';
const unsubscribe=window.g9agentDesktop?.onRuntimeStatus(update);update(window.g9agentDesktop?.getRuntimeStatus?.()||current);
bar.getBoundingClientRect();bar.style.transition='';
const timer=setInterval(draw,400);window.__g9agentStartupCleanup=()=>{clearInterval(timer);unsubscribe?.()};window.__g9agentStartupUpdate=update;
document.getElementById('retry').addEventListener('click',()=>window.g9agentDesktop?.retryRuntime?window.g9agentDesktop.retryRuntime():window.location.reload());
document.getElementById('saveLog').addEventListener('click',async()=>{
 const button=document.getElementById('saveLog'),status=document.getElementById('saveStatus');button.disabled=true;status.textContent='';
 try{
  if(window.g9agentDesktop?.saveRuntimeLogs){const result=await window.g9agentDesktop.saveRuntimeLogs();if(!result.canceled)status.textContent=labels.saved}
  else{const response=await fetch('/api/diagnostics/logs');if(!response.ok)throw Error('Download failed');const url=URL.createObjectURL(await response.blob()),a=document.createElement('a');a.href=url;a.download='G9Agent-runtime.log';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 }catch{status.textContent=labels.saveFailed}finally{button.disabled=false}
});
})();</script></body></html>`;
}

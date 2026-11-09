export {
  BackgroundTaskRuntime,
  type BackgroundTaskRuntimeOptions,
  type StartTaskSpec,
  type StopTaskOptions,
} from "./runtime/BackgroundTaskRuntime.js";
export { TaskOutputStore, type TaskOutputStoreOptions } from "./storage/TaskOutputStore.js";
export type {
  G9AgentBackgroundBashTask,
  G9AgentBackgroundTaskKind,
  G9AgentBackgroundTaskListFilter,
  G9AgentBackgroundTaskStatus,
  G9AgentTaskOutputSlice,
} from "./protocol/types.js";

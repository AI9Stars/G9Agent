import type { PermissionDecision, PermissionDecisionReason, PermissionMode } from "../../permission/index.js";
import type { G9AgentToolErrorCode } from "../protocol/errors.js";

export type G9AgentPermissionAuditRecord = {
  type: "permission";
  sessionId: string;
  turnId: string;
  toolCallId: string;
  toolName: string;
  mode: PermissionMode;
  decision: PermissionDecision["type"];
  reason: PermissionDecisionReason;
  createdAt: string;
};

export type G9AgentToolAuditRecord = {
  type: "tool";
  sessionId: string;
  turnId: string;
  toolCallId: string;
  toolName: string;
  status: "success" | "error";
  errorCode?: G9AgentToolErrorCode;
  startedAt: string;
  completedAt: string;
  durationMs: number;
};

export type G9AgentToolAuditRecorder = {
  recordPermission(record: G9AgentPermissionAuditRecord): void | Promise<void>;
  recordTool(record: G9AgentToolAuditRecord): void | Promise<void>;
};

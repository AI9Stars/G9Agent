export type G9AgentPermissionHookDecision =
  | {
      behavior: "allow";
      updatedInput?: Record<string, unknown>;
      updatedPermissions?: unknown[];
    }
  | {
      behavior: "deny";
      message?: string;
      interrupt?: boolean;
    };

export type G9AgentHookSpecificOutput = {
  hookEventName: string;
  additionalContext?: string;
  initialUserMessage?: string;
  watchPaths?: string[];
  permissionDecision?: "allow" | "deny" | "ask" | "passthrough";
  permissionDecisionReason?: string;
  updatedInput?: Record<string, unknown>;
  updatedMCPToolOutput?: unknown;
  decision?: G9AgentPermissionHookDecision;
  retry?: boolean;
  worktreePath?: string;
};

export type G9AgentHookSyncOutput = {
  type: "sync";
  continue?: boolean;
  suppressOutput?: boolean;
  stopReason?: string;
  decision?: "approve" | "block";
  reason?: string;
  systemMessage?: string;
  specific?: G9AgentHookSpecificOutput;
  raw?: unknown;
};

export type G9AgentHookAsyncOutput = {
  type: "async";
  raw?: unknown;
};

export type G9AgentHookOutput = G9AgentHookSyncOutput | G9AgentHookAsyncOutput;

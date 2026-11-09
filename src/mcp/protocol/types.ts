/**
 * MCP runtime protocol (C1 §6.1 of the deferred-feature guide).
 * Mirrors the legacy contracts in `services/mcp/client.ts` (M1-M16).
 */

export type G9AgentMcpServerSpec =
  | {
      id: string;
      transport: "stdio";
      command: string;
      args?: string[];
      env?: Record<string, string>;
      cwd?: string;
      /** Optional per-server tool timeout for slow first-load operations. */
      callTimeoutMs?: number;
      /** False opts read-only tools out of parallel tool batches (not a session lock). */
      concurrencySafe?: boolean;
      /**
       * When true, the MCP runtime injects a unique `--user-data-dir` per
       * spawn so multiple concurrent sessions each get their own isolated
       * browser profile on disk.  The temp directory is cleaned up when the
       * client closes.
       */
      perSession?: boolean;
    }
  | {
      id: string;
      transport: "streamable_http";
      url: string;
      headers?: Record<string, string>;
      /** Optional per-server tool timeout for slow first-load operations. */
      callTimeoutMs?: number;
      /** False opts read-only tools out of parallel tool batches (not a session lock). */
      concurrencySafe?: boolean;
    };

export type G9AgentMcpToolAnnotations = {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  openWorldHint?: boolean;
  idempotentHint?: boolean;
};

/**
 * Runtime view of a tool advertised by an MCP server. Already sanitized
 * (M9), wire-named (M10), and description-truncated (M11).
 */
export type G9AgentMcpToolSpec = {
  serverId: string;
  toolName: string;
  wireName: string;
  description: string;
  inputSchema: unknown;
  annotations?: G9AgentMcpToolAnnotations;
  meta?: Record<string, unknown>;
};

export type G9AgentMcpStatus =
  | "idle"
  | "connecting"
  | "ready"
  | "error"
  | "needs-auth";

export type G9AgentMcpServerInstructions = {
  serverId: string;
  instructions: string;
};

export type G9AgentMcpClientStatusEntry = {
  serverId: string;
  status: G9AgentMcpStatus;
  error?: string;
};

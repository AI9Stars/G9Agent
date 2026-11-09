export type G9AgentToolInputSchema = {
  type: "object";
  properties?: Record<string, G9AgentJsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  [key: string]: unknown;
};

export type G9AgentJsonSchema = {
  type?: string | string[];
  properties?: Record<string, G9AgentJsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  items?: G9AgentJsonSchema;
  enum?: unknown[];
  [key: string]: unknown;
};

export type G9AgentToolValidationIssue = {
  path: string;
  code: "required" | "unknown_property" | "invalid_type" | "invalid_enum" | "invalid_schema";
  message: string;
};

export type G9AgentToolValidationResult =
  | { ok: true; input: unknown }
  | { ok: false; issues: G9AgentToolValidationIssue[] };

export type G9AgentExtensionError = {
  code: "extension_load_failed" | "extension_invalid";
  message: string;
};

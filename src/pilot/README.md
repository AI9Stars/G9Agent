# Configuration and paths

Resolves G9Agent paths and loads, validates and updates application configuration.

Entry points: [paths.ts](paths.ts), [loadPilotConfig.ts](config/loadPilotConfig.ts), [PilotConfigStore.ts](config/PilotConfigStore.ts).

Preserve unknown configuration fields, masked secrets and concurrent-write checks. General workspace registration must protect existing files and directory identity.

Default state uses `~/.g9agent/g9agent.yaml`; `G9AGENT_HOME` and `G9AGENT_CONFIG_PATH` select explicit locations. Shared namespace migration preserves previous fork profiles and project state without overwriting current data. See [branding and upgrade compatibility](../../docs/g9agent-branding.md).

Tests: [tests/pilot](../../tests/pilot). See the [test guide](../../docs/testing.md) for runner selection.

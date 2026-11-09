import React from "react";
import { Box, Text } from "ink";
import { g9agentDarkBlueTheme } from "./theme.js";

export function G9AgentLogo({ tagline }: { tagline?: string } = {}): React.ReactNode {
  return (
    <Box flexDirection="column">
      <CondensedLogo />
      {tagline ? (
        <Box marginTop={1}>
          <Text color={g9agentDarkBlueTheme.brandAccent} bold>
            {"↗  "}
          </Text>
          <Text color={g9agentDarkBlueTheme.subtle}>{tagline}</Text>
        </Box>
      ) : null}
    </Box>
  );
}

export function CondensedLogo(): React.ReactNode {
  return (
    <Text>
      <Text color={g9agentDarkBlueTheme.brand} bold>
        九格
      </Text>
      <Text color={g9agentDarkBlueTheme.brandAccent} bold>
        智能体平台
      </Text>
      <Text color={g9agentDarkBlueTheme.brandAccent}> ↗</Text>
    </Text>
  );
}

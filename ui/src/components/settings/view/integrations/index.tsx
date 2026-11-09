import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useG9AgentConfig } from "../../../../hooks/useG9AgentConfig";
import { configToYamlString, safeParseYaml } from "../modelPool/utils/configYaml";
import type { G9AgentConfig } from "../modelPool/types";
import { ConfigSaveError } from "../../shared/view";
import GatewayConfigSection from "./components/GatewayConfigSection";
import ImChannelsSection from "./im";

type IntegrationsSectionsProps = {
  title: string;
};

export default function IntegrationsSections({
  title: _title,
}: IntegrationsSectionsProps) {
  const { t } = useTranslation("settings");
  const { raw, commitRaw, loading, error } = useG9AgentConfig();
  const parsedConfig = useMemo(() => safeParseYaml(raw), [raw]);

  const onFormChange = (next: G9AgentConfig) => {
    try {
      void commitRaw(configToYamlString(next));
    } catch (caught) {
      console.error("Failed to serialise integrations config patch", caught);
    }
  };

  return (
    <div className="integration-page-content">
      <ConfigSaveError error={error} />
      {loading ? (
        <div className="py-6 text-xs text-muted-foreground">
          {t("g9agentConfig.loading")}
        </div>
      ) : parsedConfig ? (
        <GatewayConfigSection config={parsedConfig} onChange={onFormChange} />
      ) : (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-[var(--pd-danger-ink)]">
          {t("settingsPage.invalidYaml.integrations")}
        </div>
      )}
      <ImChannelsSection />
    </div>
  );
}

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { SettingsProject } from "../../shared/types";
import { useG9AgentConfig } from "../../../../hooks/useG9AgentConfig";
import { configToYamlString, safeParseYaml } from "../modelPool/utils/configYaml";
import type { G9AgentConfig } from "../modelPool/types";
import { ConfigSaveError } from "../../shared/view";
import AlwaysOnSection from "./components/AlwaysOnSection";

type AgentResidentSectionsProps = {
  title: string;
  projects: SettingsProject[];
};

export default function AgentResidentSections({
  title: _title,
  projects,
}: AgentResidentSectionsProps) {
  const { t } = useTranslation("settings");
  const { raw, commitRaw, loading, error } = useG9AgentConfig();
  const parsedConfig = useMemo(() => safeParseYaml(raw), [raw]);

  const onFormChange = (next: G9AgentConfig) => {
    try {
      void commitRaw(configToYamlString(next));
    } catch (caught) {
      console.error("Failed to serialise agent resident config patch", caught);
    }
  };

  if (loading) {
    return (
      <div className="resident-page-content">
        <div className="py-6 text-xs text-muted-foreground">
          {t("g9agentConfig.loading")}
        </div>
      </div>
    );
  }

  if (!parsedConfig) {
    return (
      <div className="resident-page-content">
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-[var(--pd-danger-ink)]">
          {t("settingsPage.invalidYaml.agentResident")}
        </div>
      </div>
    );
  }

  return (
    <div className="resident-page-content">
      <ConfigSaveError error={error} />
      <AlwaysOnSection
        config={parsedConfig}
        projects={projects}
        onChange={onFormChange}
      />
    </div>
  );
}

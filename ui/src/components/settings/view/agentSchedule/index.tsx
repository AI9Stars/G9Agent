import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useG9AgentConfig } from "../../../../hooks/useG9AgentConfig";
import { configToYamlString, safeParseYaml } from "../modelPool/utils/configYaml";
import type { G9AgentConfig } from "../modelPool/types";
import { ConfigSaveError } from "../../shared/view";
import CronSection from "./components/CronSection";

type AgentScheduleSectionsProps = {
  title: string;
};

export default function AgentScheduleSections({
  title: _title,
}: AgentScheduleSectionsProps) {
  const { t } = useTranslation("settings");
  const { raw, commitRaw, loading, error } = useG9AgentConfig();
  const parsedConfig = useMemo(() => safeParseYaml(raw), [raw]);

  const onFormChange = (next: G9AgentConfig) => {
    try {
      void commitRaw(configToYamlString(next));
    } catch (caught) {
      console.error("Failed to serialise agent schedule config patch", caught);
    }
  };

  if (loading) {
    return (
      <div className="scheduled-page-content">
        <div className="py-6 text-xs text-muted-foreground">
          {t("g9agentConfig.loading")}
        </div>
      </div>
    );
  }

  if (!parsedConfig) {
    return (
      <div className="scheduled-page-content">
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-[var(--pd-danger-ink)]">
          {t("settingsPage.invalidYaml.agentSchedule")}
        </div>
      </div>
    );
  }

  return (
    <div className="scheduled-page-content">
      <ConfigSaveError error={error} />
      <CronSection config={parsedConfig} onChange={onFormChange} />
    </div>
  );
}

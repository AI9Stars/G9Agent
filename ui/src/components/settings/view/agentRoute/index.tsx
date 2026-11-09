import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useG9AgentConfig } from "../../../../hooks/useG9AgentConfig";
import { configToYamlString, safeParseYaml } from "../modelPool/utils/configYaml";
import type { G9AgentConfig } from "../modelPool/types";
import { ConfigSaveError } from "../../shared/view";
import RouterSection from "./components/RouterSection";
import ModelReferenceDetail from '../../shared/view/ModelReferenceDetail';

type AgentRouteSectionsProps = {
  title: string;
  reference?: string | null;
};

export default function AgentRouteSections({ title: _title, reference }: AgentRouteSectionsProps) {
  const { t } = useTranslation("settings");
  const { raw, commitRaw, loading, error } = useG9AgentConfig();
  const parsedConfig = useMemo(() => safeParseYaml(raw), [raw]);

  const onFormChange = async (next: G9AgentConfig) => {
    try {
      await commitRaw(configToYamlString(next));
    } catch (caught) {
      console.error("Failed to serialise agent route config patch", caught);
    }
  };

  if (loading) {
    return (
      <div className="route-page-content">
        <div className="py-6 text-xs text-muted-foreground">
          {t("g9agentConfig.loading")}
        </div>
      </div>
    );
  }

  if (!parsedConfig) {
    return (
      <div className="route-page-content">
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-[var(--pd-danger-ink)]">
          {t("settingsPage.invalidYaml.agentRoute")}
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfigSaveError error={error} />
      <ModelReferenceDetail config={parsedConfig} reference={reference} onChange={async next => {
        const result = await commitRaw(configToYamlString(next));
        if (!result.ok) throw new Error(result.error);
      }} />
      <RouterSection config={parsedConfig} onChange={onFormChange} />
    </>
  );
}

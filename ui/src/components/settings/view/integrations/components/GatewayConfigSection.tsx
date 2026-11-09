import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SettingsToggle } from "../../../shared/view";
import { patch } from "../../modelPool/utils/patch";
import type { G9AgentConfig } from "../../modelPool/types";
import { Info, Plug, X } from "../im/icons";

type GatewayConfigSectionProps = {
  config: G9AgentConfig;
  onChange: (next: G9AgentConfig) => void;
};

export default function GatewayConfigSection({
  config,
  onChange,
}: GatewayConfigSectionProps) {
  const { t } = useTranslation("settings");
  const gateway = config.gateway ?? {};
  const home = gateway.home ?? "~/.g9agent/gateway";
  const [editingHome, setEditingHome] = useState(false);
  const [homeDraft, setHomeDraft] = useState(home);

  useEffect(() => {
    if (!editingHome) setHomeDraft(home);
  }, [editingHome, home]);

  const saveHome = () => {
    const next = homeDraft.trim();
    if (!next) return;
    onChange(patch(config, ["gateway", "home"], next));
    setEditingHome(false);
  };

  return (
    <section
      className="integration-section"
      aria-label={t("g9agentConfig.panels.gateway.title")}
    >
      <div
        className={`general-card integration-gateway-card${gateway.enabled ? " enabled" : ""}`}
      >
        <div className="integration-gateway-enable-row">
          <span className="integration-gateway-icon">
            <Plug size={22} />
          </span>
          <div className="integration-gateway-copy">
            <strong>{t("g9agentConfig.panels.gateway.enabled.label")}</strong>
            <p>{t("g9agentConfig.panels.gateway.enabled.description")}</p>
          </div>
          <SettingsToggle
            checked={Boolean(gateway.enabled)}
            ariaLabel={t("g9agentConfig.panels.gateway.enabled.label")}
            onChange={(value) =>
              onChange(patch(config, ["gateway", "enabled"], value))
            }
            suppressNextSaveToast
          />
        </div>
        {gateway.enabled && (
          <div className="integration-gateway-directory-row">
            <div className="integration-gateway-copy">
              <label htmlFor="gateway-directory">
                {t("g9agentConfig.panels.gateway.home.label")}
              </label>
              <p>{t("g9agentConfig.panels.gateway.home.description")}</p>
            </div>
            <input
              id="gateway-directory"
              value={editingHome ? homeDraft : home}
              readOnly={!editingHome}
              aria-invalid={editingHome && !homeDraft.trim()}
              onChange={(event) => setHomeDraft(event.target.value)}
            />
            <div className="integration-gateway-directory-actions">
              {editingHome ? (
                <>
                  <button
                    className="button secondary compact"
                    type="button"
                    onClick={() => {
                      setHomeDraft(home);
                      setEditingHome(false);
                    }}
                  >
                    <X size={15} />
                    {t("settingsPage.actions.cancel")}
                  </button>
                  <button
                    className="button primary compact"
                    type="button"
                    disabled={!homeDraft.trim() || homeDraft.trim() === home}
                    onClick={saveHome}
                  >
                    {t("settingsPage.actions.save")}
                  </button>
                </>
              ) : (
                <button
                  className="button secondary compact"
                  type="button"
                  onClick={() => setEditingHome(true)}
                >
                  {t("settingsPage.actions.edit")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="integration-gateway-note" role="note">
        <Info size={16} />
        <span>{t("g9agentConfig.panels.gateway.description")}</span>
      </div>
    </section>
  );
}

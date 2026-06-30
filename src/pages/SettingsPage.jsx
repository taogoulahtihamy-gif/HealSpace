import { Moon, Sun, LogOut, Globe, ShieldCheck } from "lucide-react";
import { useTheme } from "../hooks/useTheme.js";
import { useAuth } from "../hooks/useAuth.js";
import { useSettings } from "../hooks/useSettings.js";
import PageHeader from "../components/common/PageHeader.jsx";
import Switch from "../components/ui/Switch.jsx";

function SettingsSection({ title, children }) {
  return (
    <section className="panel settings-panel">
      <div className="panel-title">
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function SettingsRow({ label, description, children }) {
  return (
    <div className="settings-row">
      <div>
        <strong>{label}</strong>
        {description && <span>{description}</span>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { settings, updateSetting } = useSettings();

  return (
    <main className="feed">
      <PageHeader title="Paramètres" subtitle="Personnalise ton espace HealSpace." />

      <SettingsSection title="Apparence">
        <SettingsRow label="Thème" description="Bascule entre mode clair et mode sombre.">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Mode clair" : "Mode sombre"}
          </button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Notifications">
        <SettingsRow label="Commentaires" description="Être notifié·e quand quelqu'un commente une publication.">
          <Switch
            checked={settings.notifyComments}
            onChange={(value) => updateSetting("notifyComments", value)}
            label="Notifications de commentaires"
          />
        </SettingsRow>
        <SettingsRow label="Soutiens" description="Être notifié·e quand quelqu'un soutient une publication.">
          <Switch
            checked={settings.notifySupports}
            onChange={(value) => updateSetting("notifySupports", value)}
            label="Notifications de soutiens"
          />
        </SettingsRow>
        <SettingsRow label="Résumé hebdomadaire" description="Recevoir un résumé de ton activité chaque semaine.">
          <Switch
            checked={settings.notifyDigest}
            onChange={(value) => updateSetting("notifyDigest", value)}
            label="Résumé hebdomadaire"
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Confidentialité">
        <SettingsRow label="Profil privé" description="Seuls tes compagnons peuvent voir tes publications publiques.">
          <Switch
            checked={settings.privateProfile}
            onChange={(value) => updateSetting("privateProfile", value)}
            label="Profil privé"
          />
        </SettingsRow>
        <SettingsRow label="Publications anonymes" description="Les publications anonymes resteront toujours anonymes, quel que soit ce réglage.">
          <span className="settings-static-tag">Toujours actif</span>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Langue">
        <SettingsRow label="Langue de l'interface" description="Le français est la seule langue disponible pour l'instant.">
          <span className="settings-static-tag"><Globe size={14} /> Français</span>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Sécurité">
        <SettingsRow label="Authentification à deux facteurs" description="Ajoute une étape de vérification supplémentaire (bientôt disponible).">
          <Switch checked={false} onChange={() => {}} disabled label="Authentification à deux facteurs (bientôt disponible)" />
        </SettingsRow>
        <SettingsRow label="Mot de passe" description="Changer ton mot de passe (bientôt disponible).">
          <button className="btn btn-ghost" disabled>
            <ShieldCheck size={16} /> Modifier
          </button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Compte">
        <SettingsRow label="Session" description="Se déconnecter de HealSpace sur cet appareil.">
          <button className="btn btn-danger" onClick={logout}>
            <LogOut size={18} /> Déconnexion
          </button>
        </SettingsRow>
      </SettingsSection>
    </main>
  );
}

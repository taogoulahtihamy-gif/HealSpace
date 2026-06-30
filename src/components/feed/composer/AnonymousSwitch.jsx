import Switch from "../../ui/Switch.jsx";

export default function AnonymousSwitch({ checked, onChange }) {
  return (
    <div className="anonymous-switch-row">
      <Switch checked={checked} onChange={onChange} label="Publier anonymement" />
      <div>
        <strong>Publier anonymement</strong>
        <span>Ton nom ne sera pas affiché aux autres utilisateurs.</span>
      </div>
    </div>
  );
}

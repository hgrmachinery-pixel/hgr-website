type PassportGroup = { id: string; title: string; fields: [string, string][] };

export function MachinePassport({ groups }: { groups: PassportGroup[] }) {
  return <section id="machine-passport" className="machine-passport" data-inspection-area aria-labelledby="machine-passport-title">
    <header className="machine-passport__header"><div><p className="eyebrow">Recorded machine details</p><h2 id="machine-passport-title">Machine passport</h2></div><span>HGR · PUBLISHED DETAILS</span></header>
    {groups.length ? <div className="machine-passport__groups">{groups.map((group) => <section className="machine-passport__group" key={group.id} aria-labelledby={`passport-${group.id}`}>
      <h3 id={`passport-${group.id}`}>{group.title}</h3><dl>{group.fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </section>)}</div> : <p>No machine details are currently listed.</p>}
    <p className="machine-passport__note">Details shown are the information HGR has listed for this machine. Contact HGR if you need clarification.</p>
  </section>;
}

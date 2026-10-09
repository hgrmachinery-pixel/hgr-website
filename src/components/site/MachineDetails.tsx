type DetailGroup = { id: string; title: string; fields: [string, string][] };

export function MachineDetails({ groups }: { groups: DetailGroup[] }) {
  return <section id="machine-details" className="machine-passport" data-inspection-area aria-labelledby="machine-details-title">
    <header className="machine-passport__header"><div><p className="eyebrow">Recorded machine details</p><h2 id="machine-details-title">Machine Details</h2></div><span>HGR · PUBLISHED DETAILS</span></header>
    {groups.length ? <div className="machine-passport__groups">{groups.map((group) => <section className="machine-passport__group" key={group.id} aria-labelledby={`details-${group.id}`}>
      <h3 id={`details-${group.id}`}>{group.title}</h3><dl>{group.fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </section>)}</div> : <p>No machine details are currently listed.</p>}
    <p className="machine-passport__note">Details shown are the information HGR has listed for this machine. Contact HGR if you need clarification.</p>
  </section>;
}

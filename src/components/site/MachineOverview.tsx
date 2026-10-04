export function MachineOverview({ description }: { description?: string }) {
  return <section id="machine-overview" className="machine-overview" data-inspection-area aria-labelledby="machine-overview-title">
    <p className="eyebrow">About this machine</p><h2 id="machine-overview-title">Machine overview</h2>
    {description ? <p>{description}</p> : <p>No overview has been provided for this machine.</p>}
  </section>;
}

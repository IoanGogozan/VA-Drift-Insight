export function DataSourcesCard() {
  return (
    <section className="border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-ink">Datakilder</h2>
      <div className="mt-3 grid gap-4 text-sm text-muted md:grid-cols-2">
        <div>
          <h3 className="font-semibold text-ink">Åpne datakilder</h3>
          <ul className="mt-2 space-y-1">
            <li>MET Norway Frost API: historiske nedbørsdata</li>
            <li>Kartverket / Geonorge: kart og kommunegrenser</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-ink">Simulerte VA-data</h3>
          <ul className="mt-2 space-y-1">
            <li>Ledningsnett, målesoner og pumpestasjoner</li>
            <li>Lekkasjehendelser, pumpetid, flow, trykk og alarmer</li>
          </ul>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-ink">Ingen reelle sensitive VA-infrastrukturdata er brukt.</p>
    </section>
  );
}

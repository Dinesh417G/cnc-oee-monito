import { BrandMark } from "./Nav";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white px-0 pb-8 pt-14">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <a className="flex items-center gap-2.5 font-bold tracking-tight" href="#"><BrandMark /><span>ElectronIx</span></a>
            <p className="mt-3.5 max-w-[34ch] text-sm text-muted">
              Real-time OEE for discrete manufacturing. Built for the operators on the floor.
            </p>
          </div>
          <Col title="Product" items={["Floor View", "Machine Detail", "Shift Reports", "Alerts"]} />
          <Col title="Connect" items={["OPC UA", "MQTT", "MTConnect", "Modbus TCP"]} />
          <Col title="Company" items={["About", "Customers", "Careers", "Contact"]} />
          <Col title="Resources" items={["Docs", "OEE handbook", "Status", "Security"]} />
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-line pt-5 font-mono text-xs text-muted">
          <span>&#169; 2026 ElectronIx Industrial Systems</span>
          <span>v 4.2.1 &middot; build 20260418</span>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-3.5 text-xs font-semibold uppercase tracking-[.12em] text-muted">{title}</h4>
      <ul className="flex flex-col gap-2 text-sm">
        {items.map((i) => <li key={i}><a href="#" className="hover:text-primary">{i}</a></li>)}
      </ul>
    </div>
  );
}

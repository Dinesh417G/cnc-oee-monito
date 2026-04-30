"use client";

interface Props { value: number; size?: number; stroke?: number; }

export default function OEEGauge({ value, size = 120, stroke = 10 }: Props) {
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const startAngle = (Math.PI * (180 + 45)) / 180;
  const endAngle = (Math.PI * (360 + 45)) / 180;
  const sweep = endAngle - startAngle;
  const v = Math.max(0, Math.min(1, value));
  const valAngle = startAngle + sweep * v;
  const pt = (a: number): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x1, y1] = pt(startAngle);
  const [x2, y2] = pt(endAngle);
  const [vx, vy] = pt(valAngle);
  const largeBg = sweep > Math.PI ? 1 : 0;
  const largeFg = (valAngle - startAngle) > Math.PI ? 1 : 0;
  const color = v >= 0.85 ? "#16a34a" : v >= 0.65 ? "#0f62fe" : v >= 0.4 ? "#d97706" : "#dc2626";
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-label={`OEE ${(v * 100).toFixed(1)}%`}>
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeBg} 1 ${x2} ${y2}`} fill="none" stroke="#e6e8ee" strokeWidth={stroke} strokeLinecap="round" />
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeFg} 1 ${vx} ${vy}`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" style={{ transition: "all .8s cubic-bezier(.25,.8,.25,1)" }} />
      <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-mono), monospace" fontWeight={600} fontSize={size * 0.22} fill="#0b1220" style={{ fontVariantNumeric: "tabular-nums" }}>
        {(v * 100).toFixed(1)}
      </text>
      <text x={cx} y={cy + size * 0.16} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontWeight={500} fontSize={size * 0.09} fill="#5b6473" letterSpacing="0.16em">
        OEE %
      </text>
    </svg>
  );
}

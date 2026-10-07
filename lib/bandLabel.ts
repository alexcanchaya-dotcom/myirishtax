/** Turns engine band keys ("0-44000", "44000-∞", "you 0-12012") into plain labels ("€0 – €44,000", "Over €44,000", "You: €0 – €12,012"). */
export function formatBandLabel(band: string): string {
  const m = /^(?:(you|spouse) )?(\d+)-(\d+|∞)$/.exec(band);
  if (!m) return band.charAt(0).toUpperCase() + band.slice(1);
  const [, who, lo, hi] = m;
  const e = (n: string) => `€${Number(n).toLocaleString('en-IE')}`;
  const range = hi === '∞' ? `Over ${e(lo)}` : `${e(lo)} – ${e(hi)}`;
  return who ? `${who === 'you' ? 'You' : 'Spouse'}: ${range}` : range;
}

export function formatRate(rate: number): string {
  const pct = rate * 100;
  return `${Number.isInteger(pct) ? pct.toFixed(0) : pct.toFixed(1)}%`;
}

export function formatCents(n: number): string {
  return `€${n.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

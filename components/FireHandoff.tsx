import { WEALTH_MODELER_FIRE_URL } from '../lib/config/sisterSites';

export function FireHandoff() {
  return (
    <p className="text-sm text-ink-muted">
      <a
        href={WEALTH_MODELER_FIRE_URL}
        className="underline decoration-line underline-offset-2 hover:text-ink"
        target="_blank"
        rel="noopener noreferrer"
      >
        See when you could reach FIRE
      </a>
    </p>
  );
}

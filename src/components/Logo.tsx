/** Beeldmerk: een kompasroos in inkt, met de noordpunt in de accentkleur */
export function Logo({ className = "h-8 w-8", bewegend = false }: { className?: string; bewegend?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M32 3v6M32 55v6M3 32h6M55 32h6" />
      </g>
      <g className={bewegend ? "kompasnaald" : undefined}>
        <path d="M32 12 L38 32 L32 52 L26 32 Z" fill="currentColor" />
        <path d="M32 12 L38 32 L26 32 Z" fill="var(--accent)" />
      </g>
      <circle cx="32" cy="32" r="2.6" fill="var(--bg)" />
    </svg>
  );
}

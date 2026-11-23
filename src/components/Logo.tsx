export function Logo({ className = "h-9 w-9", bewegend = false }: { className?: string; bewegend?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c6cff" />
          <stop offset="1" stopColor="#4f39f6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#logo-g)" />
      <circle cx="32" cy="32" r="20" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="2.5" />
      <g stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round">
        <path d="M32 9v4M32 51v4M9 32h4M51 32h4" />
      </g>
      <g className={bewegend ? "kompasnaald" : undefined}>
        <path d="M32 15 L38.5 32 L32 49 L25.5 32 Z" fill="#fff" />
        <path d="M32 15 L38.5 32 L25.5 32 Z" fill="#ff9f1c" />
      </g>
      <circle cx="32" cy="32" r="3.2" fill="#4f39f6" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logo-g)" />
      <circle cx="32" cy="32" r="19" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3" />
      <path d="M32 14 L38 32 L32 50 L26 32 Z" fill="#fff" />
      <path d="M32 14 L38 32 L26 32 Z" fill="#f59e0b" />
      <circle cx="32" cy="32" r="3" fill="#4338ca" />
    </svg>
  );
}

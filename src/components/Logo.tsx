// Interim vector redraw of TCC_Logo_Green.png. Replace with the original file when available.
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 500" className={className} aria-hidden="true" focusable="false">
      <circle cx="250" cy="250" r="212" fill="#3F8C22" />
      <g fill="#fff">
        {[0, 90, 180, 270].map((r) => (
          <g key={r} transform={`rotate(${r} 250 250)`}>
            <path d="M125 125h108v30h-78v74h-30z" />
            <path d="M150 150h23l59 59-23 23-59-59z" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className={`text-[1.05rem] font-semibold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        The Cleanup Company
      </span>
    </span>
  );
}

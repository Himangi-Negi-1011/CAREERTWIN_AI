import Link from "next/link";

export function BrandMark({ className = "size-10" }: { className?: string }) {
  return (
    <span
      className={`brand-mark relative grid shrink-0 place-items-center overflow-hidden rounded-[13px] bg-ink text-white shadow-[0_10px_26px_rgba(24,48,52,.18)] ${className}`}
      aria-hidden="true"
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(221,214,254,.8),transparent_35%),linear-gradient(145deg,transparent_38%,rgba(109,61,245,.88))]" />
      <svg viewBox="0 0 40 40" className="relative size-full" fill="none">
        <path d="M11.25 13.25a8.15 8.15 0 0 1 13.4-2.9l1.1 1.05" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
        <path d="M28.75 26.75a8.15 8.15 0 0 1-13.4 2.9l-1.1-1.05" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
        <path d="m23.75 8.8 2.45 2.65-2.8 2.25M16.25 31.2l-2.45-2.65 2.8-2.25" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.3 18.25h11.4M20 18.25v7.35" stroke="#ddd6fe" strokeWidth="2.7" strokeLinecap="round" />
      </svg>
      <span className="absolute inset-x-1 bottom-0 h-px bg-white/25" />
    </span>
  );
}

export function Brand({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="brand-link group inline-flex items-center gap-2.5" aria-label="CareerTwin home">
      <BrandMark className="size-10" />
      {!compact && (
        <span className={`text-[19px] font-[750] tracking-[-.045em] ${inverse ? "text-white" : "text-ink"}`}>
          Career<span className={inverse ? "text-mint" : "text-accent"}>Twin</span>
        </span>
      )}
    </Link>
  );
}

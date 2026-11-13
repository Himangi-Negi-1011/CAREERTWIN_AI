import Link from "next/link";

export function BrandMark({ className = "size-9" }: { className?: string }) {
  return (
    <span
      className={`brand-mark relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[13px] bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 text-white shadow-md shadow-purple-500/25 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="relative size-5 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5.6 11.1q2.4-3.1 4.8 0" />
        <path d="M13.6 11.1q2.4-3.1 4.8 0" />
        <path d="M7.6 14.2q4.4 3.5 8.8 0" />
      </svg>
    </span>
  );
}

export function Brand({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="brand-link group inline-flex items-center gap-2.5" aria-label="CareerTwin home">
      <BrandMark className="size-9" />
      {!compact && (
        <span className={`text-[19px] font-[750] tracking-[-.045em] ${inverse ? "text-white" : "text-slate-900 dark:text-white"}`}>
          Career<span className="text-purple-600 dark:text-purple-400">Twin</span>
        </span>
      )}
    </Link>
  );
}

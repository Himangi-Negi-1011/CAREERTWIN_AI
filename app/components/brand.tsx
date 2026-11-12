import Link from "next/link";

export function BrandMark({ className = "size-9" }: { className?: string }) {
  return (
    <span
      className={`brand-mark relative grid shrink-0 place-items-center overflow-hidden rounded-[12px] bg-slate-900 border border-purple-500/30 text-white shadow-md shadow-purple-500/20 ${className}`}
      aria-hidden="true"
    >
      <img
        src="/careertwin-logo.png"
        alt="CareerTwin Logo"
        className="size-full object-cover rounded-[11px]"
      />
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

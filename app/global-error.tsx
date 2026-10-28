"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Brand } from "./components/brand";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("CareerTwin global error", { name: error.name, digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body className="grid min-h-dvh place-items-center bg-[#fdfbf7] p-5 text-[#183034]">
        <section className="w-full max-w-lg rounded-[28px] border border-[#183034]/10 bg-white p-7 text-center shadow-[0_25px_70px_rgba(24,48,52,.1)] sm:p-10">
          <Brand />
          <span className="mx-auto mt-9 grid size-14 place-items-center rounded-2xl bg-amber-100">
            <AlertTriangle size={23} className="text-amber-800" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-[-.04em]">An unexpected error occurred</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            CareerTwin encountered an unexpected issue. Please retry or return home.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#183034] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#183034]/90"
            >
              <RotateCcw size={15} /> Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-[#183034]/15 px-5 py-3 text-sm font-semibold text-[#183034] transition hover:bg-[#fdfbf7]"
            >
              Return home
            </Link>
          </div>
        </section>
      </body>
    </html>
  );
}

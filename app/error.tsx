"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Brand } from "./components/brand";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("CareerTwin route error", { name: error.name, digest: error.digest });
  }, [error]);

  return <main className="grid min-h-dvh place-items-center bg-cream p-5 text-ink">
    <section className="w-full max-w-lg rounded-[28px] border border-ink/10 bg-white p-7 text-center shadow-[0_25px_70px_rgba(24,48,52,.1)] sm:p-10">
      <Brand />
      <span className="mx-auto mt-9 grid size-14 place-items-center rounded-2xl bg-gold/25"><AlertTriangle size={23}/></span>
      <h1 className="mt-5 text-2xl font-bold tracking-[-.04em]">This page could not finish loading</h1>
      <p className="mt-3 text-sm leading-6 text-slate">Your saved browser data has not been removed. Retry the page, or return home if the problem continues.</p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={reset} className="button-primary"><RotateCcw size={15}/>Try again</button><Link href="/" className="button-secondary px-5 py-3">Return home</Link></div>
    </section>
  </main>;
}

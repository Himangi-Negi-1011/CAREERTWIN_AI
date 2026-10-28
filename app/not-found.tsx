import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Brand } from "./components/brand";

export default function NotFound() {
  return <main className="grid min-h-dvh place-items-center bg-cream p-5 text-ink"><section className="w-full max-w-lg text-center"><Brand/><p className="section-kicker mt-12">404 · Page not found</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.055em]">This path is not part of your career plan.</h1><p className="mt-4 text-sm leading-6 text-slate">The link may be outdated, or the page may have moved.</p><Link href="/" className="button-primary mt-7"><ArrowLeft size={15}/>Back to CareerTwin</Link></section></main>;
}

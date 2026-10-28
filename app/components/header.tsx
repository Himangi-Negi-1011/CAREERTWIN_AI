"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Brand } from "./brand";

const links = [["Home", "#home"], ["How It Works", "#how-it-works"], ["About", "#about"]] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b border-[#202440]/8 bg-white/90 backdrop-blur-xl">
    <div className="shell flex h-[72px] items-center justify-between">
      <Brand />
      <nav className="hidden items-center gap-7 md:flex" aria-label="Public navigation">{links.map(([label,href])=><Link key={href} href={href} className="text-sm font-semibold text-slate transition hover:text-accent">{label}</Link>)}</nav>
      <div className="hidden items-center gap-2 md:flex">
        <Show when="signed-out"><SignInButton mode="redirect"><button className="px-4 py-2 text-sm font-bold text-ink hover:text-accent">Log In</button></SignInButton><Link href="/sign-up?redirect_url=/onboarding" className="button-primary px-5 py-2.5">Get Started</Link></Show>
        <Show when="signed-in"><Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-ink hover:bg-app"><LayoutDashboard size={16}/>Workspace</Link><UserButton appearance={{elements:{avatarBox:"size-9"}}}/></Show>
      </div>
      <button type="button" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="mobile-public-nav" aria-label={open?"Close navigation":"Open navigation"} className="grid size-10 place-items-center rounded-xl border border-ink/10 bg-white md:hidden">{open?<X size={19}/>:<Menu size={19}/>}</button>
    </div>
    {open&&<nav id="mobile-public-nav" className="border-t border-ink/8 bg-white px-5 py-4 md:hidden" aria-label="Mobile public navigation"><div className="flex flex-col gap-1">{links.map(([label,href])=><Link key={href} href={href} onClick={()=>setOpen(false)} className="rounded-xl px-3 py-3 font-semibold hover:bg-app">{label}</Link>)}<Show when="signed-out"><Link href="/sign-in" className="rounded-xl px-3 py-3 font-semibold">Log In</Link><Link href="/sign-up?redirect_url=/onboarding" className="button-primary mt-2">Get Started</Link></Show><Show when="signed-in"><Link href="/dashboard" className="button-primary mt-2">Open Workspace</Link></Show></div></nav>}
  </header>;
}

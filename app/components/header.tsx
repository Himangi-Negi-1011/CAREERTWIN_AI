"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { ArrowUpRight, LayoutDashboard, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const links = [
  ["Product", "#product"],
  ["Capabilities", "#capabilities"],
  ["How it works", "#how-it-works"],
  ["Privacy", "#privacy"],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex h-[60px] max-w-[1320px] items-center justify-between rounded-full border border-white/80 bg-white/88 px-5 shadow-[0_12px_38px_rgba(52,81,137,.12)] backdrop-blur-xl sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2.5" aria-label="CareerTwin home">
          <span className="grid size-8 place-items-center rounded-full bg-[#edf4ff] text-[#2f72ff]">
            <SparkIcon />
          </span>
          <span className="text-[15px] font-bold tracking-[-.04em] text-[#17223c]">
            Career<span className="text-[#2f72ff]">Twin</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Public navigation">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="text-[11px] font-semibold text-[#74819a] transition hover:text-[#2f72ff]">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Show when="signed-out">
            <SignInButton mode="redirect">
              <button className="px-4 py-2 text-[11px] font-bold text-[#56647d] hover:text-[#2f72ff]">
                Log in
              </button>
            </SignInButton>
            <Link
              href="/sign-up?redirect_url=/onboarding"
              aria-label="Get started"
              className="inline-flex items-center gap-2 rounded-full bg-[#2f72ff] px-5 py-3 text-[10px] font-bold text-white shadow-[0_8px_20px_rgba(47,114,255,.24)] transition hover:-translate-y-0.5 hover:bg-[#1e62e9]"
            >
              Create my Twin <ArrowUpRight size={13} />
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-[#2f72ff] px-5 py-3 text-[10px] font-bold text-white">
              <LayoutDashboard size={14} />
              Workspace
            </Link>
            <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
          </Show>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-public-nav"
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="grid size-9 place-items-center rounded-full border border-[#dce5f3] bg-white text-[#17223c] md:hidden"
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-public-nav"
          className="mx-auto mt-2 max-w-[1320px] rounded-[24px] border border-white bg-white p-5 shadow-[0_22px_60px_rgba(48,77,136,.18)] md:hidden"
          aria-label="Mobile public navigation"
        >
          <div className="flex flex-col">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="border-b border-[#e8edf5] py-4 text-sm font-semibold text-[#53617b]"
              >
                {label}
              </Link>
            ))}
            <Show when="signed-out">
              <Link href="/sign-in" className="py-4 text-sm font-semibold text-[#53617b]">
                Log in
              </Link>
              <Link
                href="/sign-up?redirect_url=/onboarding"
                aria-label="Get started"
                className="mt-2 flex items-center justify-between rounded-full bg-[#2f72ff] px-5 py-4 text-xs font-bold text-white"
              >
                Create my Twin <ArrowUpRight size={14} />
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="mt-4 rounded-full bg-[#2f72ff] px-5 py-4 text-center text-xs font-bold text-white">
                Open workspace
              </Link>
            </Show>
          </div>
        </nav>
      )}
    </header>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2.8c.8 5.4 3.8 8.4 9.2 9.2-5.4.8-8.4 3.8-9.2 9.2-.8-5.4-3.8-8.4-9.2-9.2 5.4-.8 8.4-3.8 9.2-9.2Z" />
    </svg>
  );
}

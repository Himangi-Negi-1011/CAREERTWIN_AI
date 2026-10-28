"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type CommandItem = {
  id: string;
  label: string;
  description: string;
  keywords: string;
  icon: React.ComponentType<{ size?: number }>;
};

export function CommandPalette({ open, items, onClose, onSelect }: {
  open: boolean;
  items: CommandItem[];
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();
  const filtered = items.filter((item) => `${item.label} ${item.description} ${item.keywords}`.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (!open) return;
    const task = window.setTimeout(() => inputRef.current?.focus(), 50);
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") { setQuery(""); onClose(); } }
    window.addEventListener("keydown", closeOnEscape);
    return () => { window.clearTimeout(task); window.removeEventListener("keydown", closeOnEscape); };
  }, [open, onClose]);

  function close() { setQuery(""); onClose(); }
  function select(id: string) { setQuery(""); onSelect(id); }

  return <AnimatePresence>{open && <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[10vh] sm:pt-[14vh]" role="dialog" aria-modal="true" aria-label="CareerTwin quick navigation">
    <motion.button type="button" aria-label="Close quick navigation" className="absolute inset-0 bg-ink/45 backdrop-blur-sm" onClick={close} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}/>
    <motion.div initial={reduceMotion?false:{opacity:0,y:-12,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={reduceMotion?undefined:{opacity:0,y:-8,scale:.985}} transition={{duration:.18,ease:[.22,1,.36,1]}} className="relative w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/20 bg-white shadow-[0_30px_100px_rgba(16,42,45,.28)]">
      <div className="flex items-center gap-3 border-b border-ink/8 px-4 sm:px-5"><Search size={18} className="shrink-0 text-accent"/><input ref={inputRef} value={query} onChange={(event)=>setQuery(event.target.value)} onKeyDown={(event)=>{if(event.key==="Enter"&&filtered[0])select(filtered[0].id)}} className="min-h-16 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-slate/65" placeholder="Where do you want to go?" aria-label="Search workspace"/><button type="button" onClick={close} className="grid size-9 place-items-center rounded-xl text-slate hover:bg-cream hover:text-ink" aria-label="Close"><X size={17}/></button></div>
      <div className="max-h-[55vh] overflow-y-auto p-2.5">
        {filtered.length ? filtered.map((item)=><button type="button" key={item.id} onClick={()=>select(item.id)} className="group flex w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left transition hover:bg-cream/70 focus-visible:bg-cream/70"><span className="grid size-10 shrink-0 place-items-center rounded-xl border border-ink/8 bg-white text-accent shadow-sm"><item.icon size={17}/></span><span className="min-w-0 flex-1"><strong className="block text-sm">{item.label}</strong><span className="mt-0.5 block truncate text-xs text-slate">{item.description}</span></span><ArrowRight size={15} className="text-slate opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"/></button>) : <div className="px-5 py-10 text-center"><p className="font-bold">No matching tool</p><p className="mt-2 text-sm text-slate">Try “interview”, “project”, “skills”, or “progress”.</p></div>}
      </div>
      <div className="flex items-center justify-between border-t border-ink/8 bg-cream/40 px-4 py-2.5 text-[10px] font-semibold text-slate sm:px-5"><span>Enter to open the first result</span><span>Esc to close</span></div>
    </motion.div>
  </div>}</AnimatePresence>;
}

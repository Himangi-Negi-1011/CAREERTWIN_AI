"use client";

import { useEffect, useState } from "react";
import { Cookie, Shield, Check, X, Settings2 } from "lucide-react";

export type CookiePreferences = {
  essential: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: 1;
};

const STORAGE_KEY = "careertwin_cookie_consent_v1";

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);

  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setVisible(true);
      } else {
        const parsed: CookiePreferences = JSON.parse(saved);
        setFunctional(Boolean(parsed.functional));
        setAnalytics(Boolean(parsed.analytics));
        setMarketing(Boolean(parsed.marketing));
      }
    } catch {
      setVisible(true);
    }

    // Allow opening cookie settings from anywhere via custom event
    const handleOpenSettings = () => {
      setVisible(true);
      setCustomizing(true);
    };
    window.addEventListener("open-careertwin-cookie-settings", handleOpenSettings);
    return () => {
      window.removeEventListener("open-careertwin-cookie-settings", handleOpenSettings);
    };
  }, []);

  const savePreferences = (prefs: { functional: boolean; analytics: boolean; marketing: boolean }) => {
    const fullPrefs: CookiePreferences = {
      essential: true,
      functional: prefs.functional,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      timestamp: new Date().toISOString(),
      version: 1,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullPrefs));
      window.dispatchEvent(new CustomEvent("careertwin-cookies-updated", { detail: fullPrefs }));
    } catch {
      // ignore local storage errors
    }
    setVisible(false);
    setCustomizing(false);
  };

  const handleAcceptAll = () => {
    setFunctional(true);
    setAnalytics(true);
    setMarketing(true);
    savePreferences({ functional: true, analytics: true, marketing: true });
  };

  const handleRejectOptional = () => {
    setFunctional(false);
    setAnalytics(false);
    setMarketing(false);
    savePreferences({ functional: false, analytics: false, marketing: false });
  };

  const handleSaveCustom = () => {
    savePreferences({ functional, analytics, marketing });
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 max-w-xl animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-900/95 p-5 text-slate-100 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Cookie size={18} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Cookie Preferences
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  Privacy First
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                CareerTwin uses cookies to maintain secure sessions and improve technical curricula.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="text-slate-400 hover:text-white transition p-1"
            aria-label="Dismiss cookie notice"
          >
            <X size={16} />
          </button>
        </div>

        {/* Customization Details */}
        {customizing && (
          <div className="mt-4 space-y-3 border-t border-white/10 pt-3 text-xs">
            {/* Essential */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div>
                <strong className="block text-white font-medium">Strictly Essential</strong>
                <span className="text-slate-400 text-[11px]">Authentication, session security, and learning state.</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                Always Active
              </span>
            </div>

            {/* Functional */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div>
                <strong className="block text-white font-medium">Functional & Preferences</strong>
                <span className="text-slate-400 text-[11px]">Remembers active course, code theme, and lab checkpoints.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={functional}
                  onChange={(e) => setFunctional(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div>
                <strong className="block text-white font-medium">Anonymous Learning Analytics</strong>
                <span className="text-slate-400 text-[11px]">Aggregated assessment metrics to identify tricky topics.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div>
                <strong className="block text-white font-medium">Career Opportunities Alerts</strong>
                <span className="text-slate-400 text-[11px]">Tailored internship and hackathon notifications.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
          <div className="flex items-center gap-2">
            <a href="/terms" className="text-[11px] text-purple-400 hover:underline">
              Terms & Policy
            </a>
            {!customizing && (
              <button
                type="button"
                onClick={() => setCustomizing(true)}
                className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition"
              >
                <Settings2 size={12} />
                <span>Customize</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {customizing ? (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition shadow-sm cursor-pointer"
              >
                <Check size={13} />
                <span>Save Preferences</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  Reject Optional
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition shadow-sm cursor-pointer"
                >
                  Accept All
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function openCookieSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-careertwin-cookie-settings"));
  }
}

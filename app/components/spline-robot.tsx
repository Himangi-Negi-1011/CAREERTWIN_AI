"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, memo, useEffect, useRef } from "react";
import { Sparkles, Bot } from "lucide-react";

// Dynamically import Spline to disable SSR for WebGL / canvas operations
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[460px] flex flex-col items-center justify-center bg-gradient-to-br from-[#0c0d14] via-[#121324] to-[#07080f] rounded-2xl animate-pulse text-white/50 space-y-2 p-6">
      <Bot className="w-10 h-10 text-indigo-400 animate-bounce" />
      <span className="text-xs font-mono tracking-wider text-indigo-300/80">
        Loading 3D Twin Robot...
      </span>
    </div>
  ),
});

interface SplineRobotProps {
  className?: string;
  scene?: string;
}

export const SplineRobot = memo(function SplineRobot({
  className = "w-full h-full min-h-[460px]",
  scene = "/careertwin-robot.splinecode",
}: SplineRobotProps) {
  const [loadFailed, setLoadFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Aggressively remove any Spline branding / watermark injected anywhere in document or shadow DOM
  useEffect(() => {
    const removeWatermark = () => {
      // 1. Selector-based cleanup on entire document
      const selectors = [
        'a[href*="spline.design"]',
        'a[href*="spline"]',
        '#spline-watermark',
        '[class*="spline-watermark"]',
        '[class*="spline_watermark"]',
        '[data-spline-watermark]',
        'a[aria-label*="Spline"]',
      ];
      try {
        document.querySelectorAll(selectors.join(", ")).forEach((el) => {
          el.remove();
        });
      } catch {
        // safety
      }

      // 2. Remove by exact text match ("Built with Spline")
      try {
        document.querySelectorAll("a, div, span").forEach((el) => {
          const txt = el.textContent?.trim();
          if (txt === "Built with Spline" || txt === "spline.design") {
            el.remove();
          }
        });
      } catch {
        // safety
      }

      // 3. Shadow DOM cleanup for spline-viewer or custom Web Components
      try {
        document.querySelectorAll("spline-viewer").forEach((viewer) => {
          if (viewer.shadowRoot) {
            viewer.shadowRoot
              .querySelectorAll('a, #logo, #watermark, [class*="watermark"], [class*="logo"]')
              .forEach((el) => el.remove());
          }
        });
      } catch {
        // safety
      }
    };

    removeWatermark();
    const interval = setInterval(removeWatermark, 250);

    // MutationObserver to catch dynamic badge injections immediately
    let observer: MutationObserver | null = null;
    if (typeof MutationObserver !== "undefined" && document.body) {
      observer = new MutationObserver(() => {
        removeWatermark();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (observer) observer.disconnect();
    }, 12000);

    return () => {
      clearInterval(interval);
      if (observer) observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  // Stop wheel events so page scrolling never translates/rotates the 3D robot downwards
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stopWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };

    container.addEventListener("wheel", stopWheel, { passive: true, capture: true });
    return () => {
      container.removeEventListener("wheel", stopWheel, { capture: true });
    };
  }, []);

  const handleSplineLoad = (splineApp: any) => {
    try {
      const hide3DWatermark = () => {
        // 0. Directly clear and neutralize WebGL pipeline watermark texture
        if (splineApp._renderer?.pipeline) {
          try {
            splineApp._renderer.pipeline.setWatermark?.(null);
            splineApp._renderer.pipeline.setWatermark = () => {};
          } catch {
            // safe
          }
        }

        // 1. Hide SplineWatermark and logo 3D objects inside WebGL scene
        const watermark = splineApp.findObjectByName?.("SplineWatermark");
        if (watermark) {
          watermark.visible = false;
          if (watermark.scale) watermark.scale.set(0, 0, 0);
          if (watermark.position) watermark.position.set(0, -99999, 0);
        }
        const logo = splineApp.findObjectByName?.("logo");
        if (logo) {
          logo.visible = false;
          if (logo.scale) logo.scale.set(0, 0, 0);
          if (logo.position) logo.position.set(0, -99999, 0);
        }

        // 2. Traverse full Three.js scene graph to suppress any watermark meshes
        const scene = splineApp._scene || splineApp.scene;
        if (scene && typeof scene.traverse === "function") {
          scene.traverse((obj: any) => {
            if (/watermark|logo|splinewatermark/i.test(obj.name || "")) {
              obj.visible = false;
              if (obj.scale) obj.scale.set(0, 0, 0);
              if (obj.position) obj.position.set(0, -99999, 0);
            }
          });
        }

        // 3. Disable wheel zoom on orbit controls so scrolling page doesn't move 3D robot
        if (splineApp._controls) {
          splineApp._controls.enableZoom = false;
          splineApp._controls.enablePan = false;
        }
      };

      hide3DWatermark();
      const interval = setInterval(hide3DWatermark, 300);
      setTimeout(() => clearInterval(interval), 6000);
    } catch {
      // safe fallback
    }
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden spline-wrapper ${className}`}>
      {loadFailed ? (
        <div className="w-full h-full min-h-[460px] flex flex-col items-center justify-center bg-gradient-to-br from-[#0d1024] to-[#05060b] rounded-2xl p-6 text-center border border-indigo-500/20">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3 border border-indigo-500/30">
            <Bot className="w-8 h-8 text-indigo-400" />
          </div>
          <h4 className="text-white font-semibold text-sm">CareerTwin AI Assistant</h4>
          <p className="text-white/60 text-xs mt-1 max-w-xs">
            Interactive AI Twin ready to personalize your career roadmap and masterclasses.
          </p>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="w-full h-full min-h-[460px] flex items-center justify-center bg-transparent">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          }
        >
          <Spline
            scene={scene}
            onLoad={handleSplineLoad}
            onError={() => setLoadFailed(true)}
            className="w-full h-full"
          />
        </Suspense>
      )}
      {/* Visual cover block to guarantee watermark cannot show through at bottom right/left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 z-30 h-16 w-56 bg-gradient-to-t from-[var(--bg,#0a0e17)] via-[var(--bg,#0a0e17)]/90 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-30 h-16 w-56 bg-gradient-to-t from-[var(--bg,#0a0e17)] via-[var(--bg,#0a0e17)]/90 to-transparent"
      />
    </div>
  );
});

"use client";

import { useEffect, useRef } from "react";
import { initRobotScene } from "./robot-scene";

export function RobotCharacter({
  pose = "hero",
  canvasId,
  className = "w-full h-full block cursor-grab active:cursor-grabbing",
  role = "img",
  ariaLabel = "Animated 3D robot assistant",
}: {
  pose?: "hero" | "login" | "dash";
  canvasId?: string;
  className?: string;
  role?: string;
  ariaLabel?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const effectiveId = canvasId || (pose === "hero" ? "robotCanvas" : pose === "login" ? "loginRobot" : "dashRobot");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const instance = initRobotScene({ canvasId: effectiveId, pose });

    return () => {
      if (instance?.renderer) {
        instance.renderer.dispose();
      }
    };
  }, [effectiveId, pose]);

  return (
    <canvas
      ref={canvasRef}
      id={effectiveId}
      className={className}
      aria-label={ariaLabel}
      role={role}
    />
  );
}

export function CheerChip({
  label = "Say hi",
  tag = "Click to wave",
  className = "cheer-chip",
}: {
  label?: string;
  tag?: string;
  className?: string;
}) {
  const triggerCheer = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("careertwin:cheer"));
    }
  };

  return (
    <button
      type="button"
      onClick={triggerCheer}
      className={className}
      aria-label={`${label} - ${tag}`}
    >
      <span className="pulse-dot" aria-hidden="true" />
      <span className="cheer-label">{label}</span>
      <span className="cheer-tag">{tag}</span>
    </button>
  );
}

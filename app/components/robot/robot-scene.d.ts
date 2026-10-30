export function initRobotScene(options?: {
  canvasId?: string;
  pose?: "hero" | "login" | "dash" | string;
}): {
  scene: unknown;
  renderer: { dispose: () => void };
  camera: unknown;
  robot: unknown;
  react: (action?: string) => void;
  resize: () => void;
} | null;

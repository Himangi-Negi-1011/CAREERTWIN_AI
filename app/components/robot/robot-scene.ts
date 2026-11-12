import * as THREE from 'three';

export interface RobotSceneConfig {
  canvasId?: string;
  pose?: 'hero' | 'login' | 'dash';
}

export interface RobotSceneInstance {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  robot: THREE.Group;
  react: (action?: string) => void;
  resize: () => void;
  dispose: () => void;
}

const POSES = {
  hero: {
    fit: 1.34,
    cam: [0, 0.12] as [number, number],
    target: [0, 0.06, 0] as [number, number, number],
    rotY: -0.06,
    zoom: 1,
    waveEvery: [4.4, 7.2] as [number, number],
    waveLen: 2.4,
  },
  dash: {
    fit: 1.16,
    cam: [0.26, 0.26] as [number, number],
    target: [-0.02, 0.1, 0] as [number, number, number],
    rotY: -0.12,
    zoom: 1.18,
    waveEvery: [5.0, 8.0] as [number, number],
    waveLen: 2.0,
  },
  login: {
    fit: 1.12,
    cam: [0.34, 0.34] as [number, number],
    target: [-0.03, 0.14, 0] as [number, number, number],
    rotY: -0.16,
    zoom: 1,
    waveEvery: [3.0, 5.0] as [number, number],
    waveLen: 2.0,
  },
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smoothstep = (x: number) => {
  const t = clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const expLerp = (cur: number, target: number, k: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp(-k * dt));

interface Spring {
  v: number;
  vel: number;
}
function makeSpring(v = 0): Spring {
  return { v, vel: 0 };
}
function stepSpring(s: Spring, target: number, dt: number, stiffness = 150, damping = 20) {
  const accel = (target - s.v) * stiffness - s.vel * damping;
  s.vel += accel * dt;
  s.v += s.vel * dt;
  return s.v;
}

function buildStudioEnvironment(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(60, 32, 24),
    new THREE.MeshBasicMaterial({ color: 0x1a1a20, side: THREE.BackSide })
  );
  scene.add(sky);

  const panel = (w: number, h: number, intensity: number, color: number, pos: [number, number, number], look: [number, number, number]) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(pos[0], pos[1], pos[2]);
    m.lookAt(look[0], look[1], look[2]);
    scene.add(m);
  };

  panel(26, 30, 1.35, 0xffffff, [14, 18, 24], [0, 0, 0]);
  panel(16, 54, 1.2, 0xdfe6ff, [-22, 4, 16], [0, 0, 0]);
  panel(70, 16, 0.9, 0xffffff, [0, 26, -18], [0, 0, 0]);
  panel(18, 18, 0.7, 0xffd8c8, [18, -8, -22], [0, 0, 0]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0.2).texture;
  pmrem.dispose();
  return env;
}

function radialTexture(inner: string, mid: string, size = 256) {
  if (typeof document === 'undefined') return new THREE.Texture();
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return new THREE.Texture();
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.01, size / 2, size / 2, size * 0.5);
  g.addColorStop(0, inner);
  g.addColorStop(0.45, mid);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function initRobotScene(configInput: RobotSceneConfig = {}): RobotSceneInstance | null {
  if (typeof window === 'undefined') return null;

  const { canvasId = 'robotCanvas', pose = 'hero' } = configInput;
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return null;

  const config = POSES[pose] || POSES.hero;
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let animId = 0;
  let disposed = false;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const envTexture = buildStudioEnvironment(renderer);
  scene.environment = envTexture;

  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(4.2, 6.0, 6.4);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xcfd8ff, 0.6);
  fill.position.set(-5.4, 1.2, 3.4);
  scene.add(fill);

  const rim = new THREE.PointLight(0xffffff, 3.4, 26);
  rim.position.set(-3.6, 2.6, -4.6);
  scene.add(rim);

  const rimWarm = new THREE.PointLight(0xffb59b, 3.2, 22);
  rimWarm.position.set(4.4, -1.4, -3.6);
  scene.add(rimWarm);

  const faceLight = new THREE.PointLight(0xffffff, 0.9, 6);
  faceLight.position.set(0, 0.2, 1.6);
  scene.add(faceLight);

  const C = {
    shell: 0x0d0d10,
    shellLight: 0x141418,
    joint: 0x0a0a0d,
    coral: 0xff9a86,
    coralDeep: 0xff6f52,
    glowWhite: 0xffffff,
  };

  const shellMat = new THREE.MeshPhysicalMaterial({
    color: C.shell,
    roughness: 0.3,
    metalness: 0.22,
    clearcoat: 0.72,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.5,
  });
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: C.shellLight,
    roughness: 0.28,
    metalness: 0.2,
    clearcoat: 0.75,
    clearcoatRoughness: 0.16,
    envMapIntensity: 0.52,
  });
  const jointMat = new THREE.MeshPhysicalMaterial({
    color: C.joint,
    roughness: 0.42,
    metalness: 0.3,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
    envMapIntensity: 0.7,
  });
  const visorMat = new THREE.MeshPhysicalMaterial({
    color: 0x040406,
    roughness: 0.26,
    metalness: 0.14,
    clearcoat: 0.45,
    clearcoatRoughness: 0.34,
    envMapIntensity: 0.18,
  });
  const coralMat = new THREE.MeshStandardMaterial({
    color: 0xff9880,
    emissive: 0xff5c3a,
    emissiveIntensity: 0.4,
    roughness: 0.4,
  });
  const faceMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const robot = new THREE.Group();
  robot.rotation.y = config.rotY;
  scene.add(robot);

  const headGroup = new THREE.Group();
  headGroup.position.y = 1.09;
  robot.add(headGroup);

  const HEAD_R = 1.0;
  const BEZEL_R = 0.66;
  const BEZEL_TUBE = 0.1;
  const bezelZ = Math.sqrt(Math.max(0, HEAD_R * HEAD_R - BEZEL_R * BEZEL_R));

  const holeTheta = Math.asin(clamp((BEZEL_R + BEZEL_TUBE * 0.25) / HEAD_R, 0, 1));
  const headShell = new THREE.Mesh(
    new THREE.SphereGeometry(HEAD_R, 96, 72, 0, Math.PI * 2, holeTheta, Math.PI - holeTheta + 0.06),
    shellMat
  );
  headShell.rotation.x = Math.PI / 2;
  headShell.scale.set(1, 0.98, 0.94);
  headGroup.add(headShell);

  const headInner = new THREE.Mesh(
    new THREE.SphereGeometry(HEAD_R * 0.985, 64, 48),
    new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.6, metalness: 0.1, side: THREE.BackSide })
  );
  headInner.scale.set(1, 0.98, 0.94);
  headGroup.add(headInner);

  const DISH_R = 3.0;
  const dishTheta = Math.asin(clamp((BEZEL_R - BEZEL_TUBE * 0.4) / DISH_R, 0, 1));
  const dishPoleZ = 0.7;
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(DISH_R, 96, 48, 0, Math.PI * 2, 0, dishTheta),
    visorMat
  );
  visor.rotation.x = Math.PI / 2;
  visor.position.z = dishPoleZ - DISH_R;
  headGroup.add(visor);

  const bezel = new THREE.Mesh(new THREE.TorusGeometry(BEZEL_R, BEZEL_TUBE, 32, 128), shellMat);
  bezel.position.z = bezelZ - 0.005;
  bezel.scale.set(1, 0.98, 1);
  headGroup.add(bezel);

  const bevel = new THREE.Mesh(
    new THREE.TorusGeometry(BEZEL_R - BEZEL_TUBE * 0.7, 0.012, 12, 96),
    new THREE.MeshPhysicalMaterial({
      color: 0x4c4c55,
      roughness: 0.22,
      metalness: 0.55,
      clearcoat: 0.9,
      envMapIntensity: 0.8,
    })
  );
  bevel.position.z = dishPoleZ + 0.055;
  bevel.scale.set(1, 0.98, 1);
  headGroup.add(bevel);

  const faceZ = (x: number, y: number, pad = 0.012) => {
    const r2 = x * x + y * y;
    return dishPoleZ - r2 / (2 * DISH_R) + pad;
  };

  const face = new THREE.Group();
  headGroup.add(face);

  const eyeGeo = new THREE.TorusGeometry(0.138, 0.029, 12, 48, Math.PI);
  const EYE_X = 0.265, EYE_Y = 0.18;
  const eyeL = new THREE.Mesh(eyeGeo, faceMat);
  const eyeR = new THREE.Mesh(eyeGeo, faceMat);
  [eyeL, eyeR].forEach((e, i) => {
    const x = i === 0 ? -EYE_X : EYE_X;
    e.position.set(x, EYE_Y, faceZ(x, EYE_Y));
    face.add(e);
  });

  const bloomTex = radialTexture('rgba(255,255,255,0.55)', 'rgba(230,225,255,0.12)');
  const addBloom = (w: number, h: number, x: number, y: number, opacity: number) => {
    const b = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        map: bloomTex,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    b.userData = { base: opacity };
    b.position.set(x, y, faceZ(x, y) - 0.006);
    face.add(b);
    return b;
  };

  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.238, 0.028, 12, 72, Math.PI), faceMat);
  mouth.rotation.z = Math.PI;
  mouth.position.set(0, -0.135, faceZ(0, -0.135));
  mouth.scale.set(1, 0.84, 1);
  face.add(mouth);

  const blooms = [
    addBloom(0.62, 0.54, -EYE_X, EYE_Y + 0.02, 0.5),
    addBloom(0.62, 0.54, EYE_X, EYE_Y + 0.02, 0.5),
    addBloom(1.0, 0.82, 0, -0.135, 0.42),
  ];

  const faceGlowTex = radialTexture('rgba(255,255,255,0.55)', 'rgba(255,225,215,0.14)');
  const faceGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.15),
    new THREE.MeshBasicMaterial({
      map: faceGlowTex,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  faceGlow.position.set(0, 0.01, dishPoleZ - 0.03);
  face.add(faceGlow);

  const ears: Array<{ pod: THREE.Mesh; halo: THREE.Mesh }> = [];
  [-1, 1].forEach((side) => {
    const ear = new THREE.Group();
    ear.position.set(side * 0.96, 0.03, 0.04);
    headGroup.add(ear);

    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.16, 20), jointMat);
    stalk.rotation.z = Math.PI / 2;
    stalk.position.x = side * -0.05;
    ear.add(stalk);

    const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.152, 0.24, 18, 34), coralMat);
    pod.position.x = side * 0.075;
    pod.scale.set(1, 1.02, 0.58);
    pod.rotation.x = side * -0.12;
    ear.add(pod);

    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.075, 22, 16), jointMat);
    cap.scale.set(0.55, 1.2, 0.75);
    cap.position.x = side * 0.2;
    ear.add(cap);

    const halo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 0.95),
      new THREE.MeshBasicMaterial({
        map: radialTexture('rgba(255,160,135,0.55)', 'rgba(255,120,90,0.14)'),
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    halo.position.x = side * 0.12;
    ear.add(halo);

    ears.push({ pod, halo });
  });

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.27, 0.26, 36), jointMat);
  neck.position.y = 0.22;
  robot.add(neck);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.032, 14, 56), shellMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.12;
  robot.add(collar);

  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = -0.12;
  robot.add(bodyGroup);

  const profile = [
    [0.001, -1.18], [0.3, -1.12], [0.54, -1.0], [0.72, -0.82], [0.84, -0.6],
    [0.89, -0.34], [0.9, -0.06], [0.87, 0.2], [0.78, 0.4], [0.5, 0.53],
    [0.001, 0.58],
  ].map(([r, y]) => new THREE.Vector2(r, y));

  const torso = new THREE.Mesh(new THREE.LatheGeometry(profile, 96), bodyMat);
  bodyGroup.add(torso);

  const shoulders: THREE.Mesh[] = [];
  [-1, 1].forEach((side) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 24), bodyMat);
    s.position.set(side * 0.78, 0.3, 0.02);
    s.scale.set(1, 0.92, 1);
    bodyGroup.add(s);
    shoulders.push(s);
  });

  const chest = new THREE.Group();
  chest.position.set(0, 0.0, 0.86);
  bodyGroup.add(chest);

  const chestRing = new THREE.Mesh(new THREE.TorusGeometry(0.168, 0.05, 28, 96), coralMat);
  chest.add(chestRing);

  const chestCore = new THREE.Mesh(
    new THREE.CircleGeometry(0.128, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  chestCore.position.z = -0.062;
  chest.add(chestCore);

  const chestHalo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.95),
    new THREE.MeshBasicMaterial({
      map: radialTexture('rgba(255,150,125,0.5)', 'rgba(255,110,80,0.12)'),
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  chestHalo.position.z = 0.03;
  chest.add(chestHalo);

  function makeArm(side: number) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.88, 0.22, 0.1);
    arm.rotation.z = side * 0.22;

    const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.172, 24, 18), jointMat);
    arm.add(shoulderJoint);

    const upper = new THREE.Group();
    upper.position.y = -0.01;
    arm.add(upper);

    const upperMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.168, 0.26, 12, 24), bodyMat);
    upperMesh.position.y = -0.24;
    upper.add(upperMesh);

    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.118, 22, 16), jointMat);
    elbow.position.y = -0.44;
    upper.add(elbow);

    const fore = new THREE.Group();
    fore.position.y = -0.44;
    upper.add(fore);

    const foreMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.148, 0.23, 12, 24), bodyMat);
    foreMesh.position.y = -0.19;
    fore.add(foreMesh);

    const hand = new THREE.Group();
    hand.position.y = -0.4;
    fore.add(hand);

    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.19, 30, 24), shellMat);
    palm.scale.set(0.98, 0.92, 0.82);
    hand.add(palm);

    const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.135, 26, 20), shellMat);
    knuckle.scale.set(1.16, 0.78, 0.9);
    knuckle.position.set(0, -0.135, 0.015);
    hand.add(knuckle);

    const fingers: THREE.Group[] = [];
    const digitGeo = new THREE.CapsuleGeometry(0.055, 0.15, 12, 22);

    [-0.082, 0, 0.082].forEach((x, i) => {
      const digitRoot = new THREE.Group();
      digitRoot.position.set(x, -0.175, 0.02);
      digitRoot.rotation.z = x * 0.42;
      digitRoot.rotation.x = 0.42;
      hand.add(digitRoot);

      const digit = new THREE.Mesh(digitGeo, shellMat);
      digit.position.y = -0.09;
      digit.scale.set(1, i === 1 ? 1.06 : 0.94, 1);
      digitRoot.add(digit);

      fingers.push(digitRoot);
    });

    const thumb = new THREE.Group();
    thumb.position.set(-side * 0.14, -0.04, 0.05);
    thumb.rotation.z = side * 0.95;
    thumb.rotation.x = 0.5;
    hand.add(thumb);

    const thumbMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.09, 12, 20), shellMat);
    thumbMesh.position.y = -0.075;
    thumb.add(thumbMesh);

    return { arm, upper, fore, hand, fingers };
  }

  const armL = makeArm(-1);
  const armR = makeArm(1);
  robot.add(armL.arm, armR.arm);

  const floorGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 3.6),
    new THREE.MeshBasicMaterial({
      map: radialTexture('rgba(255,140,110,0.16)', 'rgba(120,90,180,0.06)'),
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.y = -1.62;
  scene.add(floorGlow);

  const pointer = { x: 0, y: 0 };
  const pointerGoal = { x: 0, y: 0 };
  let hovering = false;

  const onPointerMove = (e: PointerEvent) => {
    const host = canvas.parentElement || canvas;
    const r = host.getBoundingClientRect();
    const margin = 220;
    const near =
      e.clientX > r.left - margin &&
      e.clientX < r.right + margin &&
      e.clientY > r.top - margin &&
      e.clientY < r.bottom + margin;
    hovering = near;
    if (!near) {
      pointerGoal.x = 0;
      pointerGoal.y = 0;
      return;
    }
    pointerGoal.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    pointerGoal.y = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
  };

  const onPointerLeave = () => {
    hovering = false;
    pointerGoal.x = 0;
    pointerGoal.y = 0;
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('blur', onPointerLeave);

  function resize() {
    if (disposed) return;
    const host = canvas ? (canvas.parentElement || canvas) : null;
    const w = Math.max(1, host?.clientWidth || canvas?.clientWidth || 1);
    const h = Math.max(1, host?.clientHeight || canvas?.clientHeight || 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;

    const fovR = (camera.fov * Math.PI) / 180;
    const fitH = 1.92 / Math.tan(fovR / 2);
    const fitW = 1.12 / (Math.tan(fovR / 2) * Math.max(0.42, camera.aspect));
    const dist = clamp(Math.max(fitH, fitW) * config.fit, 4.4, 14) / (config.zoom || 1);
    camera.position.set(config.cam[0], config.cam[1], dist);
    camera.lookAt(config.target[0], config.target[1], 0);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
  window.addEventListener('careertwin:resize3d', resize);

  let resizeObserver: ResizeObserver | null = null;
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement || canvas);
  }

  function applyTheme() {
    if (disposed) return;
    const dark = root.getAttribute('data-theme') !== 'light';
    shellMat.color.set(dark ? C.shell : 0x111114);
    bodyMat.color.set(dark ? C.shellLight : 0x17171b);
    shellMat.envMapIntensity = dark ? 0.5 : 0.64;
    bodyMat.envMapIntensity = dark ? 0.52 : 0.66;
    key.intensity = dark ? 0.9 : 1.25;
    fill.intensity = dark ? 0.6 : 0.8;
    (faceGlow.material as THREE.MeshBasicMaterial).opacity = dark ? 0.14 : 0.1;
    blooms.forEach((b) => {
      (b.material as THREE.MeshBasicMaterial).opacity = dark ? b.userData.base : b.userData.base * 0.75;
    });
    (floorGlow.material as THREE.MeshBasicMaterial).opacity = dark ? 0.9 : 0.5;
  }
  applyTheme();
  window.addEventListener('careertwin:theme', applyTheme);

  const clock = new THREE.Clock();
  let t = 0;
  let introScale = 0;

  const sHeadYaw = makeSpring(0), sHeadPitch = makeSpring(0), sHeadRoll = makeSpring(0);
  const sBodyYaw = makeSpring(0);
  const sArmR = makeSpring(0.22), sForeR = makeSpring(0.18);
  const sArmL = makeSpring(-0.22);
  const sHop = makeSpring(0), sSquash = makeSpring(1);

  let waving = false;
  let waveStart = 0;
  let nextWaveIn = pose === 'login' ? 1.6 : 3.0;
  const WAVE_LEN = config.waveLen;

  let blinkT = 0, nextBlink = rand(2.2, 4.4), blinkQueue = 0;
  let reactUntil = -1;
  let glanceX = 0, glanceY = 0;
  let hueT = 0;

  function react() {
    sHop.vel += 4.2;
    sSquash.vel -= 1.6;
    blinkQueue = 1;
    reactUntil = t + 1.1;
  }

  const shell = document.getElementById('heroVisual') || canvas.parentElement || document.body;
  const onCheerEvent = () => react();
  shell.addEventListener('careertwin:cheer', onCheerEvent);
  canvas.addEventListener('click', onCheerEvent);

  function frame() {
    if (disposed) return;
    const dtRaw = clock.getDelta();
    const dt = Math.min(dtRaw, 1 / 24);
    if (!reduce) t += dt;

    introScale = expLerp(introScale, 1, 5.5, dt);
    const introEase = smoothstep(introScale);

    pointer.x = expLerp(pointer.x, pointerGoal.x, 6, dt);
    pointer.y = expLerp(pointer.y, pointerGoal.y, 6, dt);

    const lookX = pointer.x * 0.34 + glanceX;
    const lookY = pointer.y * 0.2 + glanceY;
    stepSpring(sHeadYaw, lookX, dt, 120, 15);
    stepSpring(sHeadPitch, lookY, dt, 120, 16);
    stepSpring(sHeadRoll, -pointer.x * 0.05, dt, 90, 14);
    headGroup.rotation.set(sHeadPitch.v * 0.8, sHeadYaw.v, sHeadRoll.v);
    headGroup.position.y = 1.09 + (reduce ? 0 : Math.sin(t * 1.1) * 0.012);

    stepSpring(sBodyYaw, pointer.x * 0.12, dt, 100, 16);
    bodyGroup.rotation.y = sBodyYaw.v * 0.5;
    robot.rotation.y = config.rotY + sBodyYaw.v;

    const floatY = reduce ? 0 : Math.sin(t * 1.02) * 0.055 + Math.sin(t * 0.47 + 1.1) * 0.02;
    stepSpring(sHop, 0, dt, 85, 9);
    const hopY = Math.max(0, sHop.v) * 0.15;
    stepSpring(sSquash, 1, dt, 120, 10);
    const sq = clamp(sSquash.v, 0.86, 1.14);
    const stretch = 1 / Math.sqrt(sq);

    robot.position.y = floatY + hopY + 0.12;
    robot.scale.set(introEase * stretch, introEase * sq, introEase * stretch);

    if (!reduce) {
      if (Math.random() < dt * 0.32) {
        glanceX = rand(-0.22, 0.22);
        glanceY = rand(-0.1, 0.12);
        setTimeout(() => { glanceX = 0; glanceY = 0; }, rand(700, 1500));
      }
    }

    if (!reduce) {
      if (!waving) {
        nextWaveIn -= dt;
        if (nextWaveIn <= 0) {
          waving = true;
          waveStart = t;
        }
      }
      let waveAmount = 0;
      if (waving) {
        const p = (t - waveStart) / WAVE_LEN;
        if (p >= 1) {
          waving = false;
          nextWaveIn = rand(config.waveEvery[0], config.waveEvery[1]);
        } else {
          waveAmount = smoothstep(p / 0.24) * (1 - smoothstep((p - 0.78) / 0.22));
        }
      }

      const swing = Math.sin((t - waveStart) * 7.2) * 0.22 * waveAmount;
      const rest = 0.22;
      stepSpring(sArmR, rest + (2.45 + swing - rest) * waveAmount, dt, 170, 16);
      stepSpring(sForeR, 0.18 + waveAmount * (-0.58 + swing * 1.5), dt, 170, 16);
      armR.arm.rotation.z = sArmR.v;
      armR.fore.rotation.z = sForeR.v;
      armR.hand.rotation.z = 0.16 * waveAmount;
      armR.hand.rotation.x = Math.sin(t * 9) * 0.1 * waveAmount;

      stepSpring(sArmL, -0.22 - Math.sin(t * 1.05) * 0.035, dt, 110, 15);
      armL.arm.rotation.z = sArmL.v;
      armL.fore.rotation.z = -0.18 + Math.sin(t * 1.05 + 1.2) * 0.03;

      armL.arm.rotation.x = -hopY * 0.45;
      armR.arm.rotation.x = -hopY * 0.45;
    }

    if (!reduce) {
      nextBlink -= dt;
      if (nextBlink <= 0 && blinkT <= 0 && blinkQueue === 0) {
        blinkT = 1;
        blinkQueue = Math.random() < 0.28 ? 1 : 0;
      }
    }
    if (blinkT > 0) {
      blinkT -= dt * 3.4;
      if (blinkT <= 0) {
        blinkT = 0;
        if (blinkQueue > 0) { blinkQueue -= 1; blinkT = 1; }
        else nextBlink = rand(2.4, 5.2);
      }
    }
    const blinkK = blinkT > 0 ? Math.max(0.1, Math.abs(blinkT * 2 - 1)) : 1;
    eyeL.scale.y = expLerp(eyeL.scale.y, blinkK, 26, dt);
    eyeR.scale.y = eyeL.scale.y;

    const mood = waving || t < reactUntil ? 1 : 0;
    const smile = 0.86 + mood * 0.14;
    mouth.scale.y = expLerp(mouth.scale.y, smile, 8, dt);
    mouth.scale.x = expLerp(mouth.scale.x, 1 + mood * 0.05, 8, dt);

    const squint = hovering && !waving ? 0.92 : 1;
    eyeL.scale.x = expLerp(eyeL.scale.x, squint, 8, dt);
    eyeR.scale.x = eyeL.scale.x;

    hueT = (hueT + dt * 0.9) % 1;
    const beat = (t % 1.9) / 1.9;
    const pulse = Math.exp(-beat * 11) + 0.5 * Math.exp(-Math.max(0, beat - 0.17) * 11);
    const flash = smoothstep((Math.sin(hueT * Math.PI * 2) - 0.9) / 0.1) * 0.5;

    coralMat.emissive.setRGB(1, 0.42 + flash * 0.5, 0.28 + flash * 0.6);
    coralMat.emissiveIntensity = 0.42 + pulse * 0.16 + flash * 0.5;
    faceMat.color.setRGB(1, 1, 1);
    (chestHalo.material as THREE.MeshBasicMaterial).opacity = 0.32 + pulse * 0.22;
    ears.forEach((e) => { (e.halo.material as THREE.MeshBasicMaterial).opacity = 0.34 + pulse * 0.28; });

    floorGlow.position.y = -1.62 + Math.sin(t * 1.02) * 0.01;
    (floorGlow.material as THREE.MeshBasicMaterial).opacity =
      (root.getAttribute('data-theme') === 'light' ? 0.4 : 0.8) - hopY * 0.4;

    renderer.render(scene, camera);
    animId = requestAnimationFrame(frame);
  }

  animId = requestAnimationFrame(frame);

  function dispose() {
    disposed = true;
    cancelAnimationFrame(animId);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('blur', onPointerLeave);
    window.removeEventListener('resize', resize);
    window.removeEventListener('orientationchange', resize);
    window.removeEventListener('careertwin:resize3d', resize);
    window.removeEventListener('careertwin:theme', applyTheme);
    shell.removeEventListener('careertwin:cheer', onCheerEvent);
    canvas?.removeEventListener('click', onCheerEvent);
    if (resizeObserver) resizeObserver.disconnect();
    envTexture.dispose();
    renderer.dispose();
  }

  return { scene, renderer, camera, robot, react, resize, dispose };
}

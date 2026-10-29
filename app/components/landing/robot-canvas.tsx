"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export function RobotCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const shell = canvas.parentElement;
    if (!shell) return;

    let isDisposed = false;
    let animationFrameId: number;

    function supportsWebGL() {
      try {
        const probe = document.createElement("canvas");
        return !!(window.WebGLRenderingContext && (probe.getContext("webgl2") || probe.getContext("webgl")));
      } catch {
        return false;
      }
    }

    if (!supportsWebGL()) {
      shell.classList.add("no-webgl");
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.9, 9.7);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    // Lights
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(4, 7, 6);
    scene.add(key);

    const rimA = new THREE.PointLight(0xa855f7, 26, 22);
    rimA.position.set(-4.2, 1.4, -3);
    scene.add(rimA);

    const rimB = new THREE.PointLight(0x22d3ee, 18, 22);
    rimB.position.set(4.2, -1.6, -3.4);
    scene.add(rimB);

    const fill = new THREE.PointLight(0xffffff, 10, 18);
    fill.position.set(0, -3, 5);
    scene.add(fill);

    // Materials
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0xf3efff,
      roughness: 0.28,
      metalness: 0.06,
      clearcoat: 0.85,
      clearcoatRoughness: 0.22,
      sheen: 0.4,
      sheenColor: new THREE.Color(0xc084fc),
    });

    const darkMat = new THREE.MeshPhysicalMaterial({
      color: 0x0b0912,
      roughness: 0.14,
      metalness: 0.65,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 1.5,
      roughness: 0.3,
      metalness: 0.2,
    });

    const cyanMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.4,
      roughness: 0.3,
      metalness: 0.2,
    });

    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xe9d5ff,
      emissive: 0xc084fc,
      emissiveIntensity: 2.6,
      roughness: 0.4,
    });

    // Radial shadow
    function radialTexture(inner: string, outer: string) {
      const size = 256;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(c);
      const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.04, size / 2, size / 2, size * 0.5);
      g.addColorStop(0, inner);
      g.addColorStop(0.55, outer);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 4.2),
      new THREE.MeshBasicMaterial({
        map: radialTexture("rgba(76,29,149,0.55)", "rgba(76,29,149,0.16)"),
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.85;
    scene.add(shadow);

    // Robot group
    const robot = new THREE.Group();
    robot.scale.setScalar(0.001);
    scene.add(robot);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.92;
    robot.add(headGroup);

    // Head shell
    const head = new THREE.Mesh(new RoundedBoxGeometry(2.5, 1.95, 1.85, 7, 0.55), shellMat);
    headGroup.add(head);

    // Visor
    const visor = new THREE.Mesh(new RoundedBoxGeometry(2.02, 0.92, 0.42, 6, 0.3), darkMat);
    visor.position.set(0, 0.02, 0.86);
    headGroup.add(visor);

    // Eyes
    const eyes = new THREE.Group();
    eyes.position.set(0, 0.02, 1.06);
    headGroup.add(eyes);

    const eyeGeo = new THREE.CapsuleGeometry(0.115, 0.1, 6, 14);
    const eyeL = new THREE.Mesh(eyeGeo, glowMat);
    const eyeR = new THREE.Mesh(eyeGeo, glowMat);
    eyeL.position.x = -0.36;
    eyeR.position.x = 0.36;
    eyeL.rotation.z = Math.PI / 2;
    eyeR.rotation.z = Math.PI / 2;
    eyes.add(eyeL, eyeR);

    // Mouth
    const mouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.26, 4, 10), accentMat);
    mouth.rotation.z = Math.PI / 2;
    mouth.position.set(0, -0.32, 1.03);
    headGroup.add(mouth);

    // Ears
    const earGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.22, 26);
    const earL = new THREE.Mesh(earGeo, darkMat);
    earL.rotation.z = Math.PI / 2;
    earL.position.set(-1.28, 0.02, 0);
    const earR = earL.clone();
    earR.position.x = 1.28;
    headGroup.add(earL, earR);

    const earRingGeo = new THREE.TorusGeometry(0.27, 0.028, 8, 30);
    const earRingL = new THREE.Mesh(earRingGeo, accentMat);
    earRingL.rotation.y = Math.PI / 2;
    earRingL.position.set(-1.4, 0.02, 0);
    const earRingR = new THREE.Mesh(earRingGeo, cyanMat);
    earRingR.rotation.y = Math.PI / 2;
    earRingR.position.set(1.4, 0.02, 0);
    headGroup.add(earRingL, earRingR);

    // Antenna
    const antenna = new THREE.Group();
    antenna.position.set(0.45, 0.95, 0.1);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.038, 0.55, 10), darkMat);
    stem.position.y = 0.27;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 22, 18), glowMat);
    bulb.position.y = 0.58;
    antenna.add(stem, bulb);
    headGroup.add(antenna);

    // Torso
    const body = new THREE.Group();
    body.position.y = -0.6;
    robot.add(body);

    const torso = new THREE.Mesh(new RoundedBoxGeometry(1.75, 1.35, 1.4, 6, 0.42), shellMat);
    body.add(torso);

    const chest = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.055, 12, 40), accentMat);
    chest.position.set(0, 0.05, 0.72);
    body.add(chest);

    const chestDot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 16), cyanMat);
    chestDot.position.set(0, 0.05, 0.72);
    body.add(chestDot);

    // Arms
    function makeArm(side: number) {
      const arm = new THREE.Group();
      arm.position.set(side * 1.02, 0.32, 0);
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.23, 22, 18), darkMat);
      const upper = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.95, 0.38, 5, 0.17), shellMat);
      upper.position.y = -0.52;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), darkMat);
      hand.position.y = -1.05;
      arm.add(shoulder, upper, hand);
      arm.rotation.z = side * 0.13;
      return arm;
    }
    const armL = makeArm(-1);
    const armR = makeArm(1);
    body.add(armL, armR);

    // Hover rings
    const ringGroup = new THREE.Group();
    ringGroup.position.y = -1.48;
    robot.add(ringGroup);

    const hoverRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.045, 10, 80),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 1.1, roughness: 0.35, metalness: 0.4 })
    );
    hoverRing.rotation.x = Math.PI / 2;
    ringGroup.add(hoverRing);

    const hoverRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.28, 0.016, 8, 90),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 0.9, transparent: true, opacity: 0.65 })
    );
    hoverRing2.rotation.x = Math.PI / 2;
    hoverRing2.position.y = -0.22;
    ringGroup.add(hoverRing2);

    // Orbit sparks
    const sparkGroup = new THREE.Group();
    scene.add(sparkGroup);
    const sparkMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xc084fc, emissiveIntensity: 2, roughness: 0.4 });
    const sparkGeo = new THREE.SphereGeometry(0.045, 10, 8);
    const sparks: Array<{ mesh: THREE.Mesh; r: number; a: number; y: number; speed: number }> = [];
    for (let i = 0; i < 16; i++) {
      const s = new THREE.Mesh(sparkGeo, i % 4 === 0 ? cyanMat : sparkMat);
      const r = 2.15 + Math.random() * 0.75;
      const a = (i / 16) * Math.PI * 2;
      const speed = 0.16 + Math.random() * 0.22;
      const y = (Math.random() - 0.5) * 3.2;
      s.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      sparkGroup.add(s);
      sparks.push({ mesh: s, r, a, y, speed });
    }

    // Dust particles
    const dustCount = 220;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 14;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xc7a8ff,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI * 0.32;
    controls.maxPolarAngle = Math.PI * 0.68;
    controls.minAzimuthAngle = -Math.PI * 0.42;
    controls.maxAzimuthAngle = Math.PI * 0.42;
    controls.rotateSpeed = 0.55;
    controls.target.set(0, -0.06, 0);

    // Interaction pointer
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let dragging = false;

    const handlePointerMove = (e: PointerEvent) => {
      const r = shell.getBoundingClientRect();
      target.x = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      target.y = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    };
    const handlePointerDown = () => { dragging = true; };
    const handlePointerUp = () => { dragging = false; };

    window.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    // Resize
    function resize() {
      if (isDisposed) return;
      const w = shell?.clientWidth || 1;
      const h = shell?.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w < 520 ? 12.4 : 9.7;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    // Theme sync
    const root = document.documentElement;
    function applyTheme() {
      const dark = root.getAttribute("data-theme") !== "light";
      shellMat.color.set(dark ? 0xf3efff : 0xe9e3f8);
      shellMat.sheenColor.set(dark ? 0xc084fc : 0xb08cff);
      shellMat.roughness = dark ? 0.28 : 0.34;
      key.intensity = dark ? 2.1 : 2.9;
      fill.intensity = dark ? 10 : 16;
      dustMat.opacity = dark ? 0.65 : 0.35;
      dustMat.color.set(dark ? 0xc7a8ff : 0x8b6bd6);
      sparkMat.emissiveIntensity = dark ? 2 : 1.6;
      rimA.intensity = dark ? 26 : 22;
      rimB.intensity = dark ? 18 : 14;
      shadow.material.opacity = dark ? 1 : 0.55;
    }
    applyTheme();
    window.addEventListener("careertwin:theme", applyTheme);

    // Animate
    const clock = new THREE.Clock();
    let blink = 0;
    let nextBlink = 2.4;
    let intro = 0;

    function animate() {
      if (isDisposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      // Intro pop
      if (intro < 1) {
        intro = Math.min(1, intro + dt * 0.9);
        const e = 1 - Math.pow(1 - intro, 3);
        robot.scale.setScalar(0.55 + e * 0.45);
        robot.rotation.y = (1 - e) * -1.1;
      }

      // Idle bob & sway
      const bob = Math.sin(t * 1.15) * 0.09;
      robot.position.y = (reduce ? 0 : bob) + 0.12;
      robot.rotation.z = reduce ? 0 : Math.sin(t * 0.72) * 0.035;

      // Head tracks pointer
      pointer.x += (target.x - pointer.x) * 0.06;
      pointer.y += (target.y - pointer.y) * 0.06;
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, pointer.x * 0.42, 0.08);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, pointer.y * 0.26, 0.08);
      headGroup.position.y = 0.92 + Math.sin(t * 1.6) * 0.022;

      // Body lean
      body.rotation.y = pointer.x * 0.12;
      body.rotation.x = pointer.y * 0.05;

      // Arms
      armL.rotation.x = Math.sin(t * 1.25) * 0.14;
      armR.rotation.x = Math.sin(t * 1.25 + Math.PI) * 0.14;
      armL.rotation.z = -0.13 + Math.sin(t * 0.9) * 0.05;
      armR.rotation.z = 0.13 - Math.sin(t * 0.9) * 0.05;

      // Antenna
      antenna.rotation.z = Math.sin(t * 2.1) * 0.16;
      antenna.rotation.x = Math.cos(t * 1.7) * 0.1;

      // Eyes blink
      nextBlink -= dt;
      if (nextBlink <= 0) {
        blink = 1;
        nextBlink = 2.4 + Math.random() * 3.6;
      }
      if (blink > 0) {
        blink = Math.max(0, blink - dt * 4.2);
        const k = Math.max(0.12, Math.abs(blink * 2 - 1));
        eyeL.scale.y = k;
        eyeR.scale.y = k;
        eyes.position.y = 0.02 - (1 - k) * 0.06;
      } else {
        eyeL.scale.y = 1;
        eyeR.scale.y = 1;
        eyes.position.y = 0.02;
      }

      const pulse = 2.2 + Math.sin(t * 3.1) * 0.7;
      glowMat.emissiveIntensity = pulse;
      chest.scale.setScalar(1 + Math.sin(t * 2.2) * 0.045);
      chestDot.scale.setScalar(1 + Math.sin(t * 2.2 + 1) * 0.16);

      // Rings
      ringGroup.rotation.y = t * 0.5;
      hoverRing.material.emissiveIntensity = 0.9 + Math.sin(t * 2.4) * 0.35;
      hoverRing2.rotation.z = -t * 0.35;
      ringGroup.position.y = -1.48 + Math.sin(t * 1.15 + 0.6) * 0.05;

      // Sparks
      for (const s of sparks) {
        s.a += dt * s.speed;
        s.mesh.position.x = Math.cos(s.a) * s.r;
        s.mesh.position.z = Math.sin(s.a) * s.r;
        s.mesh.position.y = s.y + Math.sin(t * 1.4 + s.a) * 0.35;
        s.mesh.scale.setScalar(0.8 + Math.sin(t * 3 + s.a) * 0.3);
      }
      sparkGroup.rotation.y = t * 0.06;

      shadow.scale.setScalar(1 + Math.sin(t * 1.15) * 0.03);

      dust.rotation.y = t * 0.035;
      dust.position.y = Math.sin(t * 0.5) * 0.25;

      rimA.position.x = Math.cos(t * 0.6) * 4.4;
      rimA.position.z = Math.sin(t * 0.6) * 2.6 - 1;
      rimB.position.x = Math.cos(t * 0.6 + Math.PI) * 4.4;
      rimB.position.z = Math.sin(t * 0.6 + Math.PI) * 2.6 - 1;

      if (!dragging) controls.autoRotate = false;
      controls.update();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    }
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("resize", resize);
      window.removeEventListener("careertwin:theme", applyTheme);
      renderer.dispose();
      pmrem.dispose();
    };
  }, []);

  return (
    <div className="scene-shell relative flex items-center justify-center w-full h-full min-h-[420px]">
      <canvas ref={canvasRef} id="robotCanvas" className="w-full h-full block cursor-grab active:cursor-grabbing" aria-label="Animated 3D robot assistant" role="img" />
    </div>
  );
}

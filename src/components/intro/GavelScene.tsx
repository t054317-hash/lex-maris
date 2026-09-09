'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
} from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { THEME_HEX } from '@/lib/theme';

export type GavelPhase = 'idle' | 'strike' | 'settled';

/** Seconds from release to impact. Fast = weighty; slow = floaty. */
const FALL_DURATION = 0.26;
/** Seconds of recoil + resettle after impact. */
const RECOIL_DURATION = 0.7;

/**
 * Swing geometry.
 *
 * The pivot sits at the handle butt (world x = +0.95, the "wrist"), and the
 * head hangs off it at local x = -0.95. Rotating the pivot about Z therefore
 * swings the head on a real arc instead of spinning it in place.
 *
 * Rotating the local vector (-0.95, 0) by theta gives y = -0.95 * sin(theta),
 * so a *negative* theta raises the head. At theta = 0 the head centre sits at
 * the world origin and its 0.24 radius puts the striking face at y = -0.24,
 * which is exactly the top of the sound block. Hence impact is theta ~= 0.
 */
const PIVOT: [number, number, number] = [0.95, 0, 0];
const HEAD_OFFSET_X = -0.95;
const RAISED_ANGLE = -0.72;
const IMPACT_ANGLE = 0.02;

const easeInQuad = (t: number) => t * t;
const easeOutBack = (t: number) => {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

/* -------------------------------------------------------------------------- */
/* Procedural textures                                                        */
/*                                                                            */
/* Generated on a 2D canvas at runtime rather than shipped as image files.     */
/* Three reasons: no network request on a first paint that is already          */
/* downloading three.js; nothing to go stale in /public; and the grain can be  */
/* tuned by editing numbers instead of round-tripping through an image editor. */
/* -------------------------------------------------------------------------- */

/** Cheap value noise. Deterministic, so the grain is identical every load. */
function hashNoise(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Walnut grain. Concentric rings distorted along the length of the handle,
 * which is what reads as turned hardwood rather than a brown cylinder.
 */
function makeWoodTexture(): { map: THREE.CanvasTexture; rough: THREE.CanvasTexture } {
  const w = 512;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = w;
  roughCanvas.height = h;
  const rctx = roughCanvas.getContext('2d')!;

  const image = ctx.createImageData(w, h);
  const roughImage = rctx.createImageData(w, h);

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      // Rings run across the handle; jitter keeps them from looking printed.
      const warp =
        hashNoise(x * 0.02, y * 0.05, 1) * 6 + hashNoise(x * 0.11, y * 0.02, 2) * 2;
      const rings = Math.sin((x + warp) * 0.22) * 0.5 + 0.5;
      const fibre = hashNoise(x * 0.9, y * 0.35, 3) * 0.18;

      const t = Math.pow(rings, 1.7) * 0.75 + fibre;

      // Walnut: #3A2418 in the darks to #7A4E2E on the light rings.
      const r = Math.round(58 + t * 64);
      const g = Math.round(36 + t * 42);
      const b = Math.round(24 + t * 22);

      const i = (y * w + x) * 4;
      image.data[i] = r;
      image.data[i + 1] = g;
      image.data[i + 2] = b;
      image.data[i + 3] = 255;

      // Late wood (dark rings) is denser and glossier under lacquer, so
      // roughness runs inverse to the ring value.
      const roughness = Math.round(215 - t * 90);
      roughImage.data[i] = roughness;
      roughImage.data[i + 1] = roughness;
      roughImage.data[i + 2] = roughness;
      roughImage.data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  rctx.putImageData(roughImage, 0, 0);

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  const rough = new THREE.CanvasTexture(roughCanvas);
  rough.wrapS = rough.wrapT = THREE.RepeatWrapping;

  return { map, rough };
}

/**
 * Brushed-metal roughness. Fine streaks along one axis: the thing that makes
 * machined brass read as machined rather than as a mirror ball.
 */
function makeBrushedRoughness(): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(w, h);

  for (let y = 0; y < h; y += 1) {
    // One value per row, so the streaks are continuous along the lathe axis.
    const streak = hashNoise(y * 0.7, 0, 7);
    for (let x = 0; x < w; x += 1) {
      const grit = hashNoise(x * 0.35, y * 0.9, 11) * 0.35;
      const v = Math.round(46 + streak * 34 + grit * 28);
      const i = (y * w + x) * 4;
      image.data[i] = v;
      image.data[i + 1] = v;
      image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/* -------------------------------------------------------------------------- */

function Gavel({ phase, onImpact }: { phase: GavelPhase; onImpact: () => void }) {
  const pivot = useRef<THREE.Group>(null);
  const blockRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const clock = useRef({ elapsed: 0, impactFired: false });

  useEffect(() => {
    clock.current = { elapsed: 0, impactFired: false };
  }, [phase]);

  const textures = useMemo(() => {
    const wood = makeWoodTexture();
    wood.map.repeat.set(1, 1);
    wood.rough.repeat.set(1, 1);
    const brushed = makeBrushedRoughness();
    brushed.repeat.set(3, 1);
    return { wood, brushed };
  }, []);

  /**
   * Materials.
   *
   * MeshPhysicalMaterial rather than Standard, for two properties that carry
   * most of the realism: `clearcoat` gives the handle a lacquer layer with its
   * own highlight sitting above the grain, and `anisotropy` stretches the
   * metal's specular along the brush direction the way real turned brass does.
   */
  const materials = useMemo(() => {
    const brass = new THREE.MeshPhysicalMaterial({
      color: THEME_HEX.gold500,
      metalness: 1,
      roughness: 0.32,
      roughnessMap: textures.brushed,
      anisotropy: 0.65,
      anisotropyRotation: Math.PI / 2,
      envMapIntensity: 1.5,
      clearcoat: 0.25,
      clearcoatRoughness: 0.3,
    });

    const brassDark = new THREE.MeshPhysicalMaterial({
      color: 0x8a6f1f,
      metalness: 1,
      roughness: 0.45,
      roughnessMap: textures.brushed,
      anisotropy: 0.5,
      envMapIntensity: 1.1,
    });

    const wood = new THREE.MeshPhysicalMaterial({
      map: textures.wood.map,
      roughnessMap: textures.wood.rough,
      roughness: 1,
      metalness: 0,
      // Lacquered hardwood: a hard, thin gloss coat over a matte substrate.
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
      sheen: 0.25,
      sheenColor: new THREE.Color(0xffdcb0),
      envMapIntensity: 0.7,
    });

    const stone = new THREE.MeshPhysicalMaterial({
      color: 0x0d1530,
      metalness: 0.2,
      roughness: 0.55,
      clearcoat: 0.4,
      clearcoatRoughness: 0.25,
      envMapIntensity: 0.9,
    });

    return { brass, brassDark, wood, stone };
  }, [textures]);

  // Dispose everything we allocated: R3F does not free materials or
  // canvas-backed textures for you, and the intro unmounts on every visit.
  useEffect(
    () => () => {
      Object.values(materials).forEach((m) => m.dispose());
      textures.wood.map.dispose();
      textures.wood.rough.dispose();
      textures.brushed.dispose();
    },
    [materials, textures],
  );

  useFrame((state, delta) => {
    const g = pivot.current;
    if (!g) return;
    clock.current.elapsed += delta;
    const t = clock.current.elapsed;

    if (phase === 'idle') {
      g.rotation.z = RAISED_ANGLE + Math.sin(t * 1.5) * 0.035;
      g.rotation.y = Math.sin(t * 0.42) * 0.28;
      g.position.y = PIVOT[1] + Math.sin(t * 1.15) * 0.06;
      if (glowRef.current) glowRef.current.intensity = 0.5;
      return;
    }

    g.rotation.y *= 0.9;

    if (t < FALL_DURATION) {
      const p = easeInQuad(t / FALL_DURATION);
      g.rotation.z = THREE.MathUtils.lerp(RAISED_ANGLE, IMPACT_ANGLE, p);
      g.position.y = THREE.MathUtils.lerp(g.position.y, PIVOT[1], p);
      return;
    }

    if (!clock.current.impactFired) {
      clock.current.impactFired = true;
      onImpact();
    }

    const p = Math.min((t - FALL_DURATION) / RECOIL_DURATION, 1);
    const bounce = Math.sin(p * Math.PI * 3) * (1 - p) * 0.16;
    g.rotation.z = IMPACT_ANGLE - bounce - easeOutBack(p) * 0.1;

    if (glowRef.current) {
      glowRef.current.intensity = 0.5 + Math.max(0, 1 - p * 3) * 11;
    }
    if (blockRef.current) {
      blockRef.current.scale.y = 1 - Math.max(0, 1 - p * 5) * 0.1;
    }

    state.camera.position.x = 0.55 + Math.sin(p * 26) * (1 - p) * 0.045;
  });

  return (
    <group>
      <group ref={pivot} position={PIVOT} rotation={[0, 0, RAISED_ANGLE]}>
        {/* Handle: a lathe profile rather than a plain cylinder, so it has the
            swell and taper of a turned grip. */}
        <mesh
          material={materials.wood}
          position={[HEAD_OFFSET_X / 2, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <latheGeometry
            args={[
              [
                new THREE.Vector2(0.0, -0.475),
                new THREE.Vector2(0.055, -0.475),
                new THREE.Vector2(0.062, -0.4),
                new THREE.Vector2(0.058, -0.2),
                new THREE.Vector2(0.064, 0.0),
                new THREE.Vector2(0.07, 0.22),
                new THREE.Vector2(0.076, 0.4),
                new THREE.Vector2(0.078, 0.475),
                new THREE.Vector2(0.0, 0.475),
              ],
              48,
            ]}
          />
        </mesh>

        {/* Brass collar where handle meets head — catches a hard highlight. */}
        <mesh
          material={materials.brass}
          position={[HEAD_OFFSET_X + 0.14, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.088, 0.075, 0.09, 40]} />
        </mesh>

        {/* Pommel cap at the butt */}
        <mesh material={materials.brass} position={[0.02, 0, 0]}>
          <sphereGeometry args={[0.062, 28, 28]} />
        </mesh>

        {/* Head, chamfered: the cylinder body plus a torus at each rim, which
            is what stops the striking face reading as a flat disc. */}
        <group position={[HEAD_OFFSET_X, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={materials.brass} castShadow>
            <cylinderGeometry args={[0.235, 0.235, 0.8, 64]} />
          </mesh>
          {[-0.4, 0.4].map((y) => (
            <mesh key={y} material={materials.brass} position={[0, y, 0]} castShadow>
              <torusGeometry args={[0.222, 0.014, 20, 64]} />
            </mesh>
          ))}
          {[-0.4, 0.4].map((y) => (
            <mesh key={`cap${y}`} material={materials.brass} position={[0, y, 0]}>
              <cylinderGeometry args={[0.222, 0.222, 0.006, 64]} />
            </mesh>
          ))}
          {/* Inlaid bands */}
          {[-0.26, 0.26].map((y) => (
            <mesh key={`band${y}`} material={materials.brassDark} position={[0, y, 0]}>
              <torusGeometry args={[0.238, 0.011, 16, 64]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Sound block: bevelled, on a brass plate. */}
      <group ref={blockRef} position={[0, -0.34, 0]}>
        <RoundedBox
          args={[1.45, 0.19, 0.95]}
          radius={0.035}
          smoothness={4}
          material={materials.stone}
          receiveShadow
          castShadow
        />
        <mesh material={materials.brass} position={[0, 0.104, 0]} receiveShadow>
          <boxGeometry args={[1.5, 0.014, 1.0]} />
        </mesh>
      </group>

      {/* Grounding. A floating object never looks real; the contact shadow is
          doing as much work here as the materials. */}
      <ContactShadows
        position={[0, -0.44, 0]}
        opacity={0.65}
        scale={5}
        blur={2.4}
        far={1.6}
        resolution={512}
        color="#03060f"
      />

      <pointLight
        ref={glowRef}
        position={[0, 0.05, 0.55]}
        color={THEME_HEX.gold400}
        intensity={0.5}
        distance={6}
      />
    </group>
  );
}

/**
 * WebGL stage.
 *
 * The realism here comes from the lighting environment, not from more geometry.
 * `<Environment>` with hand-placed `<Lightformer>` panels builds a studio
 * softbox rig *inside* the scene and renders it to a cube map, so the brass has
 * real, shaped reflections to pick up. Crucially it needs no external HDR file:
 * drei's presets fetch from a CDN, which would be a blocking network request on
 * first paint and a hard failure behind a strict CSP.
 *
 * Budget: resolution 256 cube map, dpr capped at 1.6, one soft shadow map.
 * That holds 60 FPS on integrated graphics, which the brief requires.
 */
export function GavelScene({
  phase,
  onImpact,
}: {
  phase: GavelPhase;
  onImpact: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      shadows="soft"
      camera={{ position: [0.55, 0.75, 3.6], fov: 42 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      {/* Studio rig, baked to a cube map. */}
      <Environment resolution={256}>
        {/* Key: a large soft panel high and to the right. */}
        <Lightformer
          form="rect"
          intensity={5}
          color="#fff4d6"
          position={[3, 4, 2]}
          scale={[6, 6, 1]}
          target={[0, 0, 0]}
        />
        {/* Long strip highlight — this is what draws the specular line down
            the length of the head. */}
        <Lightformer
          form="rect"
          intensity={9}
          color="#ffffff"
          position={[-1, 2.2, 2.6]}
          scale={[0.4, 5, 1]}
          target={[0, 0, 0]}
        />
        {/* Cool rim from behind, to separate the brass from a navy ground. */}
        <Lightformer
          form="rect"
          intensity={3.5}
          color="#7d97e0"
          position={[-3.5, 1.2, -3]}
          scale={[5, 5, 1]}
          target={[0, 0, 0]}
        />
        {/* Warm bounce from below, as if off a desk. */}
        <Lightformer
          form="rect"
          intensity={1.4}
          color="#c98f3a"
          position={[0, -2.4, 1]}
          scale={[6, 3, 1]}
          target={[0, 0, 0]}
        />
      </Environment>

      <ambientLight intensity={0.12} />
      <directionalLight
        position={[3.2, 5, 3.6]}
        intensity={1.9}
        color={0xfff1cc}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color={0x6f8ad0} />

      <Gavel phase={phase} onImpact={onImpact} />
    </Canvas>
  );
}

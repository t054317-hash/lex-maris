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
 * Swing geometry — FRONT STRIKE.
 *
 * What was wrong before: the head's cylinder axis ran along Z, so the CURVED
 * BARREL of the head met the block, not a face. A real gavel lands one of the
 * flat circular faces squarely. The swing also sat in the XY (screen) plane,
 * so the viewer watched the gavel sweep sideways past the block.
 *
 * Both are now fixed by changing the swing axis and the head's orientation:
 *
 *   - The handle runs along +Z, toward the viewer. The pivot ("wrist") sits at
 *     z = +0.95 and the head hangs off it at local z = -0.95, so the swing
 *     arc lies in the YZ plane and the head descends from the FRONT.
 *   - The head cylinder keeps its default Y axis, so it stands VERTICAL. Its
 *     lower flat face is the striking face and it lands flat on the block.
 *
 * The maths: rotating the local offset (0, 0, -0.95) about X by theta gives
 *   y' =  0.95 * sin(theta)
 *   z' = -0.95 * cos(theta)
 * so a POSITIVE theta raises the head (the opposite sign to the old Z-axis
 * swing — worth noting, because reusing the old constants silently drives the
 * head down through the block).
 *
 * Contact height: with the head 0.8 tall and standing on its axis, the
 * striking face sits 0.4 below the head centre. The block's top surface is at
 * y = -0.235, so the head centre must reach y = 0.165 at impact. That is why
 * the pivot's y is 0.165 rather than 0.
 */
const PIVOT: [number, number, number] = [0, 0.165, 0.95];
const HEAD_OFFSET_Z = -0.95;
const HEAD_RADIUS = 0.235;
const HEAD_HEIGHT = 0.8;
/** Positive theta lifts the head, on this axis. */
const RAISED_ANGLE = 0.72;
/** A hair past contact, so the strike reads as compression rather than a kiss. */
const IMPACT_ANGLE = -0.02;

/** Camera base position; the impact shake is applied relative to this. */
const CAMERA_POSITION: [number, number, number] = [2.35, 1.25, 2.55];
const CAMERA_TARGET: [number, number, number] = [0, -0.05, 0.1];

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

    // The swing is now rotation about X (YZ plane), and a positive angle
    // raises the head. Recoil therefore ADDS to the impact angle to lift the
    // head back up, where the old Z-axis swing subtracted.
    if (phase === 'idle') {
      g.rotation.x = RAISED_ANGLE + Math.sin(t * 1.5) * 0.035;
      // A gentle yaw for display only; it is damped out before the strike so
      // the face lands square rather than skewed.
      g.rotation.y = Math.sin(t * 0.42) * 0.18;
      g.position.y = PIVOT[1] + Math.sin(t * 1.15) * 0.06;
      if (glowRef.current) glowRef.current.intensity = 0.5;
      return;
    }

    // Square up: any residual yaw would land the face at an angle.
    g.rotation.y *= 0.86;

    if (t < FALL_DURATION) {
      const p = easeInQuad(t / FALL_DURATION);
      g.rotation.x = THREE.MathUtils.lerp(RAISED_ANGLE, IMPACT_ANGLE, p);
      g.position.y = THREE.MathUtils.lerp(g.position.y, PIVOT[1], p);
      return;
    }

    if (!clock.current.impactFired) {
      clock.current.impactFired = true;
      onImpact();
    }

    const p = Math.min((t - FALL_DURATION) / RECOIL_DURATION, 1);
    const bounce = Math.sin(p * Math.PI * 3) * (1 - p) * 0.16;
    g.rotation.x = IMPACT_ANGLE + bounce + easeOutBack(p) * 0.1;

    if (glowRef.current) {
      glowRef.current.intensity = 0.5 + Math.max(0, 1 - p * 3) * 11;
    }
    if (blockRef.current) {
      blockRef.current.scale.y = 1 - Math.max(0, 1 - p * 5) * 0.1;
    }

    // Shake along the camera's own X, relative to its base position.
    state.camera.position.x =
      CAMERA_POSITION[0] + Math.sin(p * 26) * (1 - p) * 0.045;
  });

  return (
    <group>
      <group ref={pivot} position={PIVOT} rotation={[RAISED_ANGLE, 0, 0]}>
        {/* Handle: a lathe profile rather than a plain cylinder, so it has the
            swell and taper of a turned grip. Lathe geometry is built around Y,
            so rotating +90 deg about X lays it along Z, toward the viewer. */}
        <mesh
          material={materials.wood}
          position={[0, 0, HEAD_OFFSET_Z / 2]}
          rotation={[Math.PI / 2, 0, 0]}
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
          position={[0, 0, HEAD_OFFSET_Z + 0.14]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.088, 0.075, 0.09, 40]} />
        </mesh>

        {/* Pommel cap at the butt, just behind the pivot. */}
        <mesh material={materials.brass} position={[0, 0, 0.02]}>
          <sphereGeometry args={[0.062, 28, 28]} />
        </mesh>

        {/* Head. NO rotation: the cylinder keeps its default Y axis so it
            stands upright and its lower flat face is the striking face.
            Chamfered with a torus at each rim, which is what stops the face
            reading as a bare disc. */}
        <group position={[0, 0, HEAD_OFFSET_Z]}>
          <mesh material={materials.brass} castShadow>
            <cylinderGeometry args={[HEAD_RADIUS, HEAD_RADIUS, HEAD_HEIGHT, 64]} />
          </mesh>
          {/* Rim toruses ring the Y axis, so they need the +90 deg X turn a
              default (Z-ringing) torus does not have. */}
          {[-HEAD_HEIGHT / 2, HEAD_HEIGHT / 2].map((y) => (
            <mesh
              key={y}
              material={materials.brass}
              position={[0, y, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <torusGeometry args={[0.222, 0.014, 20, 64]} />
            </mesh>
          ))}
          {[-HEAD_HEIGHT / 2, HEAD_HEIGHT / 2].map((y) => (
            <mesh key={`cap${y}`} material={materials.brass} position={[0, y, 0]}>
              <cylinderGeometry args={[0.222, 0.222, 0.006, 64]} />
            </mesh>
          ))}
          {/* Inlaid bands */}
          {[-0.26, 0.26].map((y) => (
            <mesh
              key={`band${y}`}
              material={materials.brassDark}
              position={[0, y, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
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

      {/* Impact flash, sitting just in front of the contact point (which is
          now at the origin, under the descending face). */}
      <pointLight
        ref={glowRef}
        position={[0, 0.02, 0.45]}
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
      // R3F gives its wrapper `pointer-events: auto` inline, which overrides
      // the parent's pointer-events-none and swallowed every click and tap
      // meant for the full-screen strike button underneath. The scene is
      // purely visual; the button is the interaction.
      style={{ pointerEvents: 'none' }}
      dpr={[1, 1.6]}
      shadows="soft"
      camera={{ position: CAMERA_POSITION, fov: 42 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        // Aim at the block rather than the origin: the handle now extends
        // toward the viewer, so the default look-at would foreshorten it.
        camera.lookAt(...CAMERA_TARGET);
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

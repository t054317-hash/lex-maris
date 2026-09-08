'use client';

import { Canvas, useFrame } from '@react-three/fiber';
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
const RAISED_ANGLE = -0.72; // rad — head lifted above the block
const IMPACT_ANGLE = 0.02; // rad — striking face in contact

/** Quadratic ease-in — reads as gravity accelerating the head down. */
const easeInQuad = (t: number) => t * t;
/** Overshooting ease-out for the bounce back up. */
const easeOutBack = (t: number) => {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

function Gavel({
  phase,
  onImpact,
}: {
  phase: GavelPhase;
  onImpact: () => void;
}) {
  const pivot = useRef<THREE.Group>(null);
  const blockRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  const clock = useRef({ elapsed: 0, impactFired: false });

  // Reset the local timeline whenever the parent re-arms the strike.
  useEffect(() => {
    clock.current = { elapsed: 0, impactFired: false };
  }, [phase]);

  // Materials are memoised: recreating them per frame is the classic R3F leak.
  const goldMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: THEME_HEX.gold500,
        metalness: 0.96,
        roughness: 0.24,
        envMapIntensity: 1.1,
      }),
    [],
  );
  const darkGoldMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x8a6f1f,
        metalness: 0.9,
        roughness: 0.42,
      }),
    [],
  );
  const blockMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: THEME_HEX.navy800,
        metalness: 0.55,
        roughness: 0.5,
      }),
    [],
  );

  useEffect(
    () => () => {
      goldMaterial.dispose();
      darkGoldMaterial.dispose();
      blockMaterial.dispose();
    },
    [goldMaterial, darkGoldMaterial, blockMaterial],
  );

  useFrame((state, delta) => {
    const g = pivot.current;
    if (!g) return;
    clock.current.elapsed += delta;
    const t = clock.current.elapsed;

    if (phase === 'idle') {
      // Suspended, breathing, slowly rotating — an object on display.
      g.rotation.z = RAISED_ANGLE + Math.sin(t * 1.5) * 0.035;
      g.rotation.y = Math.sin(t * 0.42) * 0.28;
      g.position.y = Math.sin(t * 1.15) * 0.06;
      if (glowRef.current) glowRef.current.intensity = 0.6;
      return;
    }

    // --- Strike timeline -----------------------------------------------
    g.rotation.y *= 0.9; // square up to the block as it falls

    if (t < FALL_DURATION) {
      const p = easeInQuad(t / FALL_DURATION);
      g.rotation.z = THREE.MathUtils.lerp(RAISED_ANGLE, IMPACT_ANGLE, p);
      g.position.y = THREE.MathUtils.lerp(g.position.y, 0, p);
      return;
    }

    if (!clock.current.impactFired) {
      clock.current.impactFired = true;
      onImpact();
    }

    const p = Math.min((t - FALL_DURATION) / RECOIL_DURATION, 1);
    // Damped oscillation around the contact angle.
    const bounce = Math.sin(p * Math.PI * 3) * (1 - p) * 0.16;
    g.rotation.z = IMPACT_ANGLE + bounce + easeOutBack(p) * 0.1;

    // Impact flash: bright spike decaying over ~350 ms.
    if (glowRef.current) {
      glowRef.current.intensity = 0.6 + Math.max(0, 1 - p * 3) * 9;
    }
    // Block absorbs the hit and springs back.
    if (blockRef.current) {
      blockRef.current.scale.y = 1 - Math.max(0, 1 - p * 5) * 0.12;
    }

    state.camera.position.x = Math.sin(p * 22) * (1 - p) * 0.05;
  });

  return (
    <group>
      {/* Pivot sits at the handle butt so the head swings on an arc. */}
      <group ref={pivot} position={PIVOT} rotation={[0, 0, RAISED_ANGLE]}>
        {/* Handle — spans the pivot to the head, hence the midpoint offset. */}
        <mesh
          material={darkGoldMaterial}
          position={[HEAD_OFFSET_X / 2, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.062, 0.075, 0.95, 32]} />
        </mesh>

        {/* Pommel, at the pivot itself */}
        <mesh material={goldMaterial} position={[0, 0, 0]}>
          <sphereGeometry args={[0.098, 24, 24]} />
        </mesh>

        {/* Head — cylinder axis rotated onto Z so it lies across the handle. */}
        <mesh
          material={goldMaterial}
          position={[HEAD_OFFSET_X, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.24, 0.24, 0.86, 48]} />
        </mesh>

        {/* Decorative bands. A torus already rings the Z axis — no rotation. */}
        {[-0.3, 0.3].map((z) => (
          <mesh
            key={z}
            material={darkGoldMaterial}
            position={[HEAD_OFFSET_X, 0, z]}
          >
            <torusGeometry args={[0.245, 0.022, 16, 48]} />
          </mesh>
        ))}
      </group>

      {/* Sound block */}
      <mesh ref={blockRef} material={blockMaterial} position={[0, -0.34, 0]} receiveShadow>
        <boxGeometry args={[1.5, 0.2, 1.0]} />
      </mesh>
      <mesh material={goldMaterial} position={[0, -0.235, 0]}>
        <boxGeometry args={[1.52, 0.012, 1.02]} />
      </mesh>

      {/* Impact light — doubles as the scene's warm key fill. */}
      <pointLight ref={glowRef} position={[0, 0.1, 0.6]} color={THEME_HEX.gold400} intensity={0.6} distance={7} />
    </group>
  );
}

/**
 * WebGL stage for the intro. Kept deliberately light: primitive geometry, three
 * lights, no post-processing and `dpr` capped at 1.6 so the strike holds 60 FPS
 * on integrated graphics.
 *
 * The camera is framed to hold both extremes of the swing: the raised head at
 * roughly y = +0.63 and the underside of the sound block at y = -0.44.
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
      camera={{ position: [0.55, 0.75, 3.6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
    >
      <ambientLight intensity={0.28} color={THEME_HEX.ink100} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} color={0xfff3d0} />
      <directionalLight position={[-4, 2, -3]} intensity={0.55} color={0x6f8ad0} />
      <Gavel phase={phase} onImpact={onImpact} />
    </Canvas>
  );
}

"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** Corazón paramétrico extruido con material tipo cristal. */
function useHeartGeometry() {
  return useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 140; i++) {
      const t = (i / 140) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y =
        13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pts.push(new THREE.Vector2(x * 0.06, y * 0.06));
    }
    const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.3,
      bevelSize: 0.24,
      bevelSegments: 10,
      curveSegments: 40
    });
    geo.center();
    return geo;
  }, []);
}

interface HeartProps {
  position: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
  opacity?: number;
}

function Heart({ position, scale, speed, phase, opacity = 1 }: HeartProps) {
  const geo = useHeartGeometry();
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * speed;
    const s = scale * (1 + Math.sin(state.clock.elapsedTime * 1.6 + phase) * 0.04);
    ref.current.scale.setScalar(s);
  });

  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={1.1}>
      <mesh ref={ref} geometry={geo} position={position}>
        <meshPhysicalMaterial
          color="#dd6485"
          emissive="#8c324b"
          emissiveIntensity={0.35}
          roughness={0.16}
          metalness={0.55}
          clearcoat={1}
          clearcoatRoughness={0.25}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
    </Float>
  );
}

const LOGIN_HEARTS: HeartProps[] = [
  { position: [0, 0, 0], scale: 1.55, speed: 0.35, phase: 0 },
  { position: [-4.6, 1.9, -3.5], scale: 0.55, speed: 0.6, phase: 1.3, opacity: 0.85 },
  { position: [4.7, -1.5, -4], scale: 0.62, speed: 0.5, phase: 2.1, opacity: 0.85 },
  { position: [-3.4, -2.4, -2.5], scale: 0.38, speed: 0.8, phase: 3.4, opacity: 0.7 },
  { position: [3.2, 2.6, -4.5], scale: 0.42, speed: 0.7, phase: 4.2, opacity: 0.7 }
];

const PANEL_HEARTS: HeartProps[] = [
  { position: [-6, 2.6, -6], scale: 0.5, speed: 0.35, phase: 0.4, opacity: 0.5 },
  { position: [6.2, -2.2, -7], scale: 0.58, speed: 0.3, phase: 1.7, opacity: 0.5 },
  { position: [-4.6, -3, -7.5], scale: 0.36, speed: 0.45, phase: 2.9, opacity: 0.4 },
  { position: [4.6, 3, -8], scale: 0.4, speed: 0.4, phase: 4.4, opacity: 0.4 }
];

export default function Scene3D({ variant }: { variant: "login" | "panel" }) {
  const hearts = variant === "login" ? LOGIN_HEARTS : PANEL_HEARTS;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, variant === "login" ? 9 : 12], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 6, 6]} intensity={0.9} color="#fbe9ee" />
        <pointLight position={[-6, -4, 4]} intensity={1.1} decay={0} color="#ea8aa4" />
        <pointLight position={[6, 4, 4]} intensity={0.9} decay={0} color="#f2b3c4" />
        {hearts.map((h, i) => (
          <Heart key={i} {...h} />
        ))}
        <Sparkles
          count={variant === "login" ? 70 : 40}
          scale={[16, 9, 8]}
          size={1.6}
          speed={0.25}
          opacity={0.4}
          color="#f7d3dd"
        />
      </Canvas>
    </div>
  );
}

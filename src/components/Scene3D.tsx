"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** Geometría de corazón 3D (curva paramétrica extruida). */
function useHeartGeometry() {
  return useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);
      pts.push(new THREE.Vector2(x * 0.06, y * 0.06));
    }
    const shape = new THREE.Shape(pts);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.55,
      bevelEnabled: true,
      bevelThickness: 0.28,
      bevelSize: 0.22,
      bevelSegments: 8,
      curveSegments: 32
    });
    geo.center();
    return geo;
  }, []);
}

interface HeartProps {
  position: [number, number, number];
  scale: number;
  color: string;
  emissive: string;
  speed: number;
  pulse: number;
}

function Heart({ position, scale, color, emissive, speed, pulse }: HeartProps) {
  const geo = useHeartGeometry();
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * speed;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6 + pulse) * 0.12;
    const s = scale * (1 + Math.sin(state.clock.elapsedTime * 1.8 + pulse) * 0.05);
    ref.current.scale.setScalar(s);
  });

  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.6}>
      <mesh ref={ref} geometry={geo} position={position}>
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.5}
          roughness={0.22}
          metalness={0.4}
        />
      </mesh>
    </Float>
  );
}

const LOGIN_HEARTS: HeartProps[] = [
  { position: [0, 0, 0], scale: 1.7, color: "#ff4d88", emissive: "#ff2d6f", speed: 0.5, pulse: 0 },
  { position: [-4.4, 1.8, -3], scale: 0.7, color: "#c084fc", emissive: "#a855f7", speed: 0.8, pulse: 1.3 },
  { position: [4.6, -1.4, -3.5], scale: 0.8, color: "#ff8fb1", emissive: "#ff6b9d", speed: 0.7, pulse: 2.1 },
  { position: [-3.6, -2.2, -2], scale: 0.5, color: "#fda4af", emissive: "#fb7185", speed: 1, pulse: 3.4 },
  { position: [3.4, 2.4, -4], scale: 0.55, color: "#e879f9", emissive: "#d946ef", speed: 0.9, pulse: 4.2 },
  { position: [0.6, 3, -5], scale: 0.45, color: "#ff6b9d", emissive: "#ff4d88", speed: 1.1, pulse: 5 },
  { position: [-1.4, -3.2, -4.5], scale: 0.4, color: "#c084fc", emissive: "#9333ea", speed: 1.2, pulse: 6.1 }
];

const PANEL_HEARTS: HeartProps[] = [
  { position: [-5.5, 2.4, -5], scale: 0.6, color: "#ff6b9d", emissive: "#ff2d6f", speed: 0.5, pulse: 0.4 },
  { position: [5.6, -2, -6], scale: 0.7, color: "#c084fc", emissive: "#a855f7", speed: 0.45, pulse: 1.7 },
  { position: [-4.2, -2.8, -6.5], scale: 0.45, color: "#ff8fb1", emissive: "#ff6b9d", speed: 0.6, pulse: 2.9 },
  { position: [4.2, 2.8, -7], scale: 0.5, color: "#e879f9", emissive: "#d946ef", speed: 0.55, pulse: 4.4 },
  { position: [0, 3.6, -8], scale: 0.4, color: "#fda4af", emissive: "#fb7185", speed: 0.65, pulse: 5.6 }
];

export default function Scene3D({ variant }: { variant: "login" | "panel" }) {
  const hearts = variant === "login" ? LOGIN_HEARTS : PANEL_HEARTS;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: variant === "login" ? 1 : 0.75 }}
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, variant === "login" ? 9 : 11], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 6]} intensity={1.1} color="#ffd7e6" />
        <pointLight position={[-6, -4, 4]} intensity={1.4} decay={0} color="#c084fc" />
        <pointLight position={[6, 4, 4]} intensity={1.2} decay={0} color="#ff6b9d" />
        {hearts.map((h, i) => (
          <Heart key={i} {...h} />
        ))}
        <Sparkles
          count={variant === "login" ? 110 : 70}
          scale={[16, 9, 8]}
          size={2.6}
          speed={0.32}
          opacity={0.65}
          color="#ffc2d4"
        />
      </Canvas>
    </div>
  );
}

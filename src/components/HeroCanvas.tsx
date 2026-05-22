import { useMemo, useRef } from 'react';
import { Canvas, useFrame, type ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Ambient hero scene — a cinematic particle drift in FMT brand tones.
 *
 * Design intent:
 *   - Three layered shells of small spheres (close/mid/far)
 *   - Soft pencil/apple/ruler hues against a paper-cream void
 *   - Slow individual drift + ultra-slow camera dolly for cinematic life
 *   - Mouse parallax — subtle, never gimmicky
 *   - Sized down to ~1.5k particles total (cheap on mobile GPUs)
 *
 * Performance notes:
 *   - Uses THREE.Points + BufferGeometry (one draw call per layer)
 *   - DPR clamped to [1, 2]
 *   - Respects prefers-reduced-motion (camera/particle motion disabled)
 */

const COLORS = {
  pencil: new THREE.Color('#eebc5e'),
  apple:  new THREE.Color('#c0392b'),
  ruler:  new THREE.Color('#2980b9'),
  paper:  new THREE.Color('#fcfaf5'),
};

function ParticleLayer({
  count,
  radius,
  size,
  color,
  speed,
  opacity,
}: {
  count: number;
  radius: number;
  size: number;
  color: THREE.Color;
  speed: number;
  opacity: number;
}) {
  const ref = useRef<THREE.Points>(null!);

  // Generate randomized positions on a thick spherical shell
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      // Thicker shells in z so depth fog catches them dramatically
      const r = radius * (0.7 + Math.random() * 0.6);
      arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55;
      arr[i * 3 + 2] = r * Math.cos(phi) * 0.85;
    }
    return arr;
  }, [count, radius]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * speed * 0.18;
    ref.current.rotation.x += delta * speed * 0.06;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        sizeAttenuation
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function FloatingShape(props: ThreeElements['mesh'] & { color: THREE.Color; spin: number }) {
  const { color, spin, ...rest } = props;
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * spin * 0.5;
    ref.current.rotation.y += delta * spin * 0.35;
  });

  return (
    <mesh ref={ref} {...rest}>
      <icosahedronGeometry args={[0.55, 0]} />
      <meshBasicMaterial
        color={color}
        wireframe
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function CameraRig() {
  const initial = useRef({ x: 0, y: 0 });

  useFrame(({ camera, pointer, clock }) => {
    // Mouse parallax — gentle, never more than 1 unit of camera drift
    const targetX = pointer.x * 0.6;
    const targetY = pointer.y * 0.3;
    initial.current.x += (targetX - initial.current.x) * 0.04;
    initial.current.y += (targetY - initial.current.y) * 0.04;

    // Cinematic dolly — sin wave at 0.05Hz for that "expensive video" feel
    const t = clock.getElapsedTime();
    camera.position.x = initial.current.x;
    camera.position.y = initial.current.y;
    camera.position.z = 6 + Math.sin(t * 0.12) * 0.25;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Scene() {
  return (
    <>
      {/* Atmospheric fog — makes distant particles fade into the paper-cream void */}
      <fog attach="fog" args={['#fcfaf5', 4.5, 9]} />

      {/* Three layered particle shells in brand tones */}
      <ParticleLayer count={800} radius={3.2} size={0.060} color={COLORS.pencil} speed={1.0} opacity={1.0} />
      <ParticleLayer count={500} radius={4.0} size={0.050} color={COLORS.apple}  speed={0.6} opacity={0.9} />
      <ParticleLayer count={350} radius={4.8} size={0.045} color={COLORS.ruler}  speed={0.4} opacity={0.7} />

      {/* A handful of wireframe icosahedra — the "premium agency" detail */}
      <FloatingShape position={[-2.4, 0.8, -1]} color={COLORS.pencil} spin={0.18} />
      <FloatingShape position={[2.1, -0.6, -0.5]} color={COLORS.apple} spin={0.22} />
      <FloatingShape position={[1.6, 1.2, -2]} color={COLORS.ruler} spin={0.14} />
      <FloatingShape position={[-2.0, -0.9, -2.2]} color={COLORS.pencil} spin={0.16} />

      <CameraRig />
    </>
  );
}

export default function HeroCanvas() {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      camera={{ position: [0, 0, 6], fov: 55 }}
      frameloop={prefersReducedMotion ? 'never' : 'always'}
      aria-hidden="true"
    >
      <Scene />
    </Canvas>
  );
}

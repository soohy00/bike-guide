import { memo, useEffect, useMemo, useRef, useState, type MutableRefObject, type PointerEvent as ReactPointerEvent } from 'react';
import { Canvas, useFrame, type RootState } from '@react-three/fiber';
import * as THREE from 'three';
import type { PartHealth } from '../../lib/maintenance';
import { statusLabel } from '../../lib/maintenance';
import { BIKE_HOTSPOTS } from '../../data/bikeHotspots';
import { go } from '../../lib/router';

/*
 * 3D 로드 자전거. 바깥 모델 파일 없이 관, 바퀴 같은 기본 모양으로 만들어요.
 * 색은 DESIGN.md 의 글자·선 색 (ink, hairline) 만 써요. 보라색(primary)은 쓰지 않아요.
 */
const C = {
  frame: '#d0d6e0', // ink-muted
  part: '#8a8f98', // ink-subtle
  dark: '#62666d', // ink-tertiary
  tire: '#3e3e44', // hairline-tertiary
};

type V3 = [number, number, number];

const REAR: V3 = [-0.5, 0, 0];
const FRONT: V3 = [0.5, 0, 0];
const BB: V3 = [-0.08, -0.06, 0];
const SEAT: V3 = [-0.2, 0.46, 0];
const HEAD_TOP: V3 = [0.36, 0.5, 0];
const HEAD_BOT: V3 = [0.4, 0.36, 0];
const STEM_END: V3 = [0.46, 0.53, 0];

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const at = (p: V3, z: number): V3 => [p[0], p[1], z];

/** 두 점 사이의 관 */
function Tube({ from, to, r, color = C.frame }: { from: V3; to: V3; r: number; color?: string }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()),
      length: dir.length(),
    };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[r, r, length, 12]} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.2} />
    </mesh>
  );
}

/** 여러 점을 지나는 굽은 관 (핸들 아래쪽, 체인, 케이블) */
function Curve({ points, r, color, closed = false }: { points: V3[]; r: number; color: string; closed?: boolean }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
      closed,
    );
    return new THREE.TubeGeometry(curve, 96, r, 8, closed);
  }, [points, r, closed]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
    </mesh>
  );
}

function Wheel({ center }: { center: V3 }) {
  const spokes = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const side = i % 2 ? 0.03 : -0.03;
      pts.push(0, 0, side, Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <group position={center}>
      <mesh>
        <torusGeometry args={[0.33, 0.016, 12, 64]} />
        <meshStandardMaterial color={C.tire} roughness={0.9} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.305, 0.011, 8, 64]} />
        <meshStandardMaterial color={C.dark} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.1, 12]} />
        <meshStandardMaterial color={C.part} roughness={0.4} />
      </mesh>
      <lineSegments geometry={spokes}>
        <lineBasicMaterial color={C.dark} />
      </lineSegments>
    </group>
  );
}

const DRIVE_Z = 0.07;
const CHAIN: V3[] = [
  add(BB, [0, 0.1, DRIVE_Z]),
  add(REAR, [0, 0.055, DRIVE_Z]),
  add(REAR, [-0.055, 0, DRIVE_Z]),
  add(REAR, [0.01, -0.06, DRIVE_Z]),
  add(REAR, [0.03, -0.13, DRIVE_Z]),
  add(BB, [0, -0.1, DRIVE_Z]),
  add(BB, [0.1, 0, DRIVE_Z]),
];

function drop(z: number): V3[] {
  return [
    [0.46, 0.53, z],
    [0.53, 0.525, z],
    [0.555, 0.46, z],
    [0.52, 0.41, z],
    [0.45, 0.4, z],
  ];
}

const CABLE: V3[] = [
  [0.53, 0.52, 0.19],
  [0.47, 0.6, 0.1],
  [0.39, 0.46, 0.03],
  [0.16, 0.15, 0.03],
  [-0.02, -0.02, 0.03],
];

// 모양은 바뀌지 않아요. 다시 그리지 않도록 memo 해요 (TubeGeometry 를 새로 만들지 않아요).
const BikeModel = memo(function BikeModel() {
  return (
    <group>
      <Wheel center={REAR} />
      <Wheel center={FRONT} />

      {/* 프레임 */}
      <Tube from={SEAT} to={HEAD_TOP} r={0.016} />
      <Tube from={BB} to={HEAD_BOT} r={0.021} />
      <Tube from={BB} to={SEAT} r={0.017} />
      <Tube from={HEAD_BOT} to={HEAD_TOP} r={0.022} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Tube from={at(BB, s * 0.03)} to={at(REAR, s * 0.055)} r={0.01} />
          <Tube from={at(SEAT, s * 0.02)} to={at(REAR, s * 0.055)} r={0.009} />
          <Tube from={[0.41, 0.34, s * 0.04]} to={at(FRONT, s * 0.055)} r={0.012} />
        </group>
      ))}

      {/* 안장, 핸들 */}
      <Tube from={SEAT} to={[-0.236, 0.616, 0]} r={0.013} color={C.part} />
      <mesh position={[-0.225, 0.64, 0]} rotation={[0, 0, -0.04]}>
        <boxGeometry args={[0.26, 0.028, 0.09]} />
        <meshStandardMaterial color={C.dark} roughness={0.8} />
      </mesh>
      <Tube from={HEAD_TOP} to={STEM_END} r={0.014} color={C.part} />
      <Tube from={at(STEM_END, -0.21)} to={at(STEM_END, 0.21)} r={0.012} color={C.part} />
      <Curve points={drop(0.21)} r={0.013} color={C.dark} />
      <Curve points={drop(-0.21)} r={0.013} color={C.dark} />
      <Curve points={CABLE} r={0.004} color={C.part} />

      {/* 브레이크 */}
      <mesh position={[0.47, 0.35, 0]}>
        <boxGeometry args={[0.03, 0.04, 0.07]} />
        <meshStandardMaterial color={C.part} roughness={0.4} />
      </mesh>
      <mesh position={[-0.47, 0.36, 0]}>
        <boxGeometry args={[0.03, 0.04, 0.07]} />
        <meshStandardMaterial color={C.part} roughness={0.4} />
      </mesh>

      {/* 구동계: 체인링, 카세트, 체인, 변속기, 크랭크 */}
      <mesh position={at(BB, DRIVE_Z)}>
        <torusGeometry args={[0.1, 0.008, 8, 48]} />
        <meshStandardMaterial color={C.part} roughness={0.35} metalness={0.5} />
      </mesh>
      {[0.06, 0.052, 0.045, 0.038, 0.031].map((r, i) => (
        <mesh key={r} position={at(REAR, DRIVE_Z - 0.012 + i * 0.006)} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[r, r, 0.003, 32]} />
          <meshStandardMaterial color={C.part} roughness={0.35} metalness={0.5} />
        </mesh>
      ))}
      <Curve points={CHAIN} r={0.005} color={C.frame} closed />
      <mesh position={add(REAR, [0.03, -0.11, DRIVE_Z])}>
        <boxGeometry args={[0.03, 0.07, 0.015]} />
        <meshStandardMaterial color={C.dark} roughness={0.5} />
      </mesh>
      <Tube from={at(BB, 0.09)} to={add(BB, [0.12, -0.12, 0.09])} r={0.011} color={C.part} />
      <Tube from={at(BB, -0.09)} to={add(BB, [-0.12, 0.12, -0.09])} r={0.011} color={C.part} />
    </group>
  );
});

interface Props {
  health: PartHealth[];
}

/** 부품 점의 3D 자리를 화면 자리로 바꿔서 버튼을 옮겨요 */
function HotspotTracker({
  ids,
  spin,
  buttons,
  auto,
}: {
  ids: string[];
  spin: MutableRefObject<number>;
  buttons: MutableRefObject<(HTMLButtonElement | null)[]>;
  auto: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }, dt) => {
    if (auto) spin.current += Math.min(dt, 0.1) * 0.25;
    const g = group.current;
    if (!g) return;
    g.rotation.y = spin.current;
    g.updateMatrixWorld();
    ids.forEach((id, i) => {
      const el = buttons.current[i];
      if (!el) return;
      v.set(...BIKE_HOTSPOTS[id]).applyMatrix4(g.matrixWorld).project(camera);
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    });
  });
  return (
    <group ref={group} position={[0, -0.15, 0]}>
      <BikeModel />
    </group>
  );
}

export default function Bike3D({ health }: Props) {
  const spots = health.filter((h) => BIKE_HOTSPOTS[h.part.id]);
  const ids = spots.map((h) => h.part.id);
  const wrap = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const spin = useRef(0.45);
  const three = useRef<RootState | null>(null);
  const drag = useRef<{ id: number; x: number } | null>(null);
  const [touched, setTouched] = useState(false);
  const [visible, setVisible] = useState(true);
  const [still] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // 화면 밖에 있으면 그리지 않아요 (배터리)
  useEffect(() => {
    const el = wrap.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 움직임 줄이기 = 혼자 돌지 않아요. 손으로 돌린 뒤에도 혼자 돌지 않아요.
  const auto = !still && !touched && visible;

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = { id: e.pointerId, x: e.clientX };
    e.currentTarget.setPointerCapture(e.pointerId);
    setTouched(true);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    spin.current += (e.clientX - d.x) * 0.01;
    d.x = e.clientX;
    three.current?.invalidate();
  };
  const onUp = () => {
    drag.current = null;
  };

  return (
    <div
      ref={wrap}
      className="bike3d"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <Canvas
        className="bike3d-canvas"
        frameloop={auto ? 'always' : 'demand'}
        dpr={[1, 2]}
        camera={{ position: [0, 0.3, 2.7], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={(s) => {
          three.current = s;
          s.camera.lookAt(0, 0, 0);
        }}
        aria-hidden
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 3, 2]} intensity={1.3} />
        {/* 뒤쪽 약한 빛: DESIGN.md 의 "위쪽 가장자리 흰 빛" 느낌 */}
        <directionalLight position={[-2, 1.5, -2]} intensity={0.5} />
        <HotspotTracker ids={ids} spin={spin} buttons={buttons} auto={auto} />
      </Canvas>

      {spots.map((h, i) => (
        <button
          key={h.part.id}
          ref={(el) => (buttons.current[i] = el)}
          className="hotspot"
          onClick={() => go(`/parts/${h.part.id}`)}
          aria-label={`${h.part.name} · ${statusLabel(h)}`}
        >
          <span className={`hotspot-dot ${h.status}`} aria-hidden />
          <span className="hotspot-label" aria-hidden>
            {h.part.name}
          </span>
        </button>
      ))}
    </div>
  );
}

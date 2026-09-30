import { memo, useEffect, useMemo, useRef, useState, type MutableRefObject, type PointerEvent as ReactPointerEvent } from 'react';
import { Canvas, useFrame, type RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { BrakeType } from '../../types';
import type { PartHealth } from '../../lib/maintenance';
import { statusLabel } from '../../lib/maintenance';
import { hotspotsFor } from '../../data/bikeHotspots';
import { go } from '../../lib/router';

/*
 * 3D 로드 자전거 (엔듀런스 모양). 바깥 모델 파일 없이 코드로 만들어요.
 * 색은 DESIGN.md 의 글자·선 색 (ink, hairline) 만 써요. 보라색(primary)은 쓰지 않아요.
 * 반짝임은 색이 아니라 재질(clearcoat, metalness)과 빛(RoomEnvironment)으로 만들어요.
 */
const COL = {
  ink: '#f7f8f8',
  inkMuted: '#d0d6e0',
  inkSubtle: '#8a8f98',
  inkTertiary: '#62666d',
  hairline: '#23252a',
  hairlineStrong: '#34343a',
  hairlineTertiary: '#3e3e44',
};

// 재질은 한 번만 만들어서 같이 써요
const M = {
  paint: new THREE.MeshPhysicalMaterial({ color: COL.inkMuted, roughness: 0.28, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.06 }),
  carbon: new THREE.MeshPhysicalMaterial({ color: COL.hairline, roughness: 0.4, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12 }),
  alloy: new THREE.MeshStandardMaterial({ color: COL.inkSubtle, roughness: 0.3, metalness: 0.9 }),
  darkAlloy: new THREE.MeshStandardMaterial({ color: COL.inkTertiary, roughness: 0.35, metalness: 0.85 }),
  rotor: new THREE.MeshStandardMaterial({ color: COL.inkMuted, roughness: 0.22, metalness: 1, side: THREE.DoubleSide }),
  rim: new THREE.MeshStandardMaterial({ color: COL.hairlineStrong, roughness: 0.35, metalness: 0.6 }),
  rubber: new THREE.MeshStandardMaterial({ color: COL.hairlineStrong, roughness: 0.75 }),
  tape: new THREE.MeshStandardMaterial({ color: COL.hairline, roughness: 0.65 }),
  saddle: new THREE.MeshStandardMaterial({ color: COL.hairline, roughness: 0.45, metalness: 0.1 }),
  spoke: new THREE.LineBasicMaterial({ color: COL.inkTertiary }),
};

type V3 = [number, number, number];

const REAR: V3 = [-0.5, 0, 0];
const FRONT: V3 = [0.5, 0, 0];
const BB: V3 = [-0.07, -0.07, 0];
const SEAT: V3 = [-0.19, 0.42, 0];
const HEAD_TOP: V3 = [0.335, 0.5, 0];
const HEAD_BOT: V3 = [0.39, 0.33, 0];
const STEM_END: V3 = [0.43, 0.545, 0];
const DRIVE_Z = 0.073;

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const at = (p: V3, z: number): V3 => [p[0], p[1], z];
const ALONG_Z: V3 = [Math.PI / 2, 0, 0];

/** 두 점 사이의 관. r 은 from 쪽, r2 는 to 쪽 굵기예요 (굵기가 변하는 관) */
function Tube({ from, to, r, r2 = r, m = M.paint }: { from: V3; to: V3; r: number; r2?: number; m?: THREE.Material }) {
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
    <mesh position={position} quaternion={quaternion} material={m}>
      <cylinderGeometry args={[r2, r, length, 20]} />
    </mesh>
  );
}

/** 여러 점을 지나는 굽은 관 (윗관, 포크, 핸들, 체인, 케이블) */
function Curve({ points, r, m, closed = false }: { points: V3[]; r: number; m: THREE.Material; closed?: boolean }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
      closed,
    );
    return new THREE.TubeGeometry(curve, 120, r, 12, closed);
  }, [points, r, closed]);
  return <mesh geometry={geometry} material={m} />;
}

/** z 축으로 누운 얇은 원판 (체인링, 카세트, 허브) */
function Disc({ at: p, r, h, m }: { at: V3; r: number; h: number; m: THREE.Material }) {
  return (
    <mesh position={p} rotation={ALONG_Z} material={m}>
      <cylinderGeometry args={[r, r, h, 48]} />
    </mesh>
  );
}

// 깊은 림: 단면(사다리꼴)을 돌려서 만들어요
const RIM_GEO = (() => {
  const pts = [
    [0.318, -0.011],
    [0.318, 0.011],
    [0.3, 0.009],
    [0.282, 0.0],
    [0.3, -0.009],
    [0.318, -0.011],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, 96);
  g.rotateX(Math.PI / 2);
  return g;
})();

/** 가운데가 빈 얇은 고리 (체인링). 단면(네모)을 돌려서 만들어요 */
function ringGeo(inner: number, outer: number, h: number) {
  const pts = [
    [inner, -h / 2],
    [outer, -h / 2],
    [outer, h / 2],
    [inner, h / 2],
    [inner, -h / 2],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, 72);
  g.rotateX(Math.PI / 2);
  return g;
}
const BIG_RING = ringGeo(0.088, 0.105, 0.003);
const SMALL_RING = ringGeo(0.066, 0.08, 0.003);

// 스포크 24개. 허브 양쪽에서 엇갈려서 림으로 가요.
const SPOKE_GEO = (() => {
  const pts: number[] = [];
  const n = 24;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const side = i % 2 ? 0.03 : -0.03;
    const b = a + (i % 4 < 2 ? 0.45 : -0.45);
    pts.push(Math.cos(b) * 0.028, Math.sin(b) * 0.028, side, Math.cos(a) * 0.284, Math.sin(a) * 0.284, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
})();

function Wheel({ center, disc }: { center: V3; disc: boolean }) {
  return (
    <group position={center}>
      <mesh material={M.rubber}>
        <torusGeometry args={[0.335, 0.017, 16, 96]} />
      </mesh>
      <mesh geometry={RIM_GEO} material={M.rim} />
      <lineSegments geometry={SPOKE_GEO} material={M.spoke} />
      <Disc at={[0, 0, 0]} r={0.016} h={0.1} m={M.darkAlloy} />
      <Disc at={[0, 0, 0.03]} r={0.03} h={0.004} m={M.darkAlloy} />
      <Disc at={[0, 0, -0.03]} r={0.03} h={0.004} m={M.darkAlloy} />
      {disc && (
        <>
          <mesh position={[0, 0, -0.062]} material={M.rotor}>
            <ringGeometry args={[0.058, 0.08, 64]} />
          </mesh>
          <Disc at={[0, 0, -0.058]} r={0.03} h={0.006} m={M.darkAlloy} />
        </>
      )}
    </group>
  );
}

// 안장: 위에서 본 모양을 두께 있게 뽑아요 (앞은 좁고 뒤는 넓어요)
const SADDLE_GEO = (() => {
  const s = new THREE.Shape();
  s.moveTo(0.14, 0);
  s.bezierCurveTo(0.14, 0.02, 0.06, 0.02, 0.0, 0.035);
  s.bezierCurveTo(-0.07, 0.07, -0.12, 0.075, -0.125, 0.04);
  s.lineTo(-0.125, -0.04);
  s.bezierCurveTo(-0.12, -0.075, -0.07, -0.07, 0.0, -0.035);
  s.bezierCurveTo(0.06, -0.02, 0.14, -0.02, 0.14, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.008, bevelSegments: 4, curveSegments: 16 });
  g.rotateX(Math.PI / 2);
  return g;
})();

// 바닥 그림자: 가운데가 진하고 가장자리가 흐린 원
const SHADOW_TEX = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,0.75)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(c);
})();

function drop(z: number): V3[] {
  return [
    [0.43, 0.545, z],
    [0.49, 0.552, z],
    [0.53, 0.52, z],
    [0.548, 0.46, z],
    [0.52, 0.41, z],
    [0.465, 0.405, z],
  ];
}

const TOP_TUBE: V3[] = [
  [0.345, 0.475, 0],
  [0.08, 0.452, 0],
  [-0.185, 0.405, 0],
];

function forkLeg(z: number): V3[] {
  return [
    [0.395, 0.31, z * 0.8],
    [0.425, 0.2, z * 0.9],
    [0.462, 0.09, z],
    [0.5, 0, z],
  ];
}

const CHAIN: V3[] = [
  add(BB, [0, 0.105, DRIVE_Z]),
  add(REAR, [0, 0.056, DRIVE_Z]),
  add(REAR, [-0.056, 0, DRIVE_Z]),
  add(REAR, [0.012, -0.075, DRIVE_Z]),
  add(REAR, [0.035, -0.145, DRIVE_Z]),
  add(BB, [0, -0.105, DRIVE_Z]),
  add(BB, [0.105, 0, DRIVE_Z]),
];

// 브레이크 호스 / 변속 케이블: 레버에서 나와 아랫관 밑을 따라가요
const CABLE: V3[] = [
  [0.53, 0.54, 0.19],
  [0.47, 0.62, 0.1],
  [0.4, 0.44, 0.03],
  [0.36, 0.33, 0.03],
  [0.15, 0.125, 0.03],
  [-0.04, -0.06, 0.03],
];

// 모양은 바뀌지 않아요. 다시 그리지 않도록 memo 해요 (TubeGeometry 를 새로 만들지 않아요).
const BikeModel = memo(function BikeModel({ brake }: { brake: BrakeType }) {
  const disc = brake === 'disc';
  const seatDir: V3 = [-0.242, 0.97, 0];
  return (
    <group>
      <Wheel center={REAR} disc={disc} />
      <Wheel center={FRONT} disc={disc} />

      {/* 프레임: 굵기가 변하는 관, 뒤로 낮아지는 윗관 */}
      <Curve points={TOP_TUBE} r={0.017} m={M.paint} />
      <Tube from={BB} to={[0.385, 0.35, 0]} r={0.029} r2={0.023} />
      <Tube from={BB} to={SEAT} r={0.02} r2={0.016} />
      <Tube from={HEAD_BOT} to={HEAD_TOP} r={0.027} r2={0.021} />
      <Disc at={BB} r={0.023} h={0.078} m={M.paint} />
      <mesh position={SEAT} material={M.paint}>
        <sphereGeometry args={[0.018, 16, 12]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Tube from={at(BB, s * 0.03)} to={at(REAR, s * 0.062)} r={0.012} r2={0.008} />
          <Tube from={[-0.175, 0.35, s * 0.018]} to={at(REAR, s * 0.062)} r={0.009} r2={0.007} />
          <mesh position={at(REAR, s * 0.062)} material={M.paint}>
            <boxGeometry args={[0.03, 0.03, 0.008]} />
          </mesh>
          {/* 카본 포크 */}
          <Curve points={forkLeg(s * 0.058)} r={0.013} m={M.carbon} />
        </group>
      ))}
      <mesh position={[0.395, 0.315, 0]} material={M.carbon}>
        <boxGeometry args={[0.045, 0.03, 0.1]} />
      </mesh>

      {/* 스템, 핸들 (드롭바 + 레버) */}
      <Tube from={HEAD_TOP} to={add(HEAD_TOP, [-0.006, 0.03, 0])} r={0.018} m={M.carbon} />
      <Tube from={add(HEAD_TOP, [-0.006, 0.02, 0])} to={STEM_END} r={0.016} r2={0.017} m={M.carbon} />
      <Tube from={at(STEM_END, -0.21)} to={at(STEM_END, 0.21)} r={0.012} m={M.tape} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Curve points={drop(s * 0.21)} r={0.013} m={M.tape} />
          <mesh position={[0.505, 0.565, s * 0.205]} rotation={[0, 0, -1.25]} material={M.rubber}>
            <capsuleGeometry args={[0.014, 0.045, 6, 12]} />
          </mesh>
          <Curve
            points={[
              [0.522, 0.555, s * 0.205],
              [0.545, 0.5, s * 0.205],
              [0.535, 0.45, s * 0.205],
            ]}
            r={0.006}
            m={M.darkAlloy}
          />
        </group>
      ))}
      <Curve points={CABLE} r={0.004} m={M.rubber} />

      {/* 시트포스트, 안장 */}
      <Tube from={SEAT} to={add(SEAT, [seatDir[0] * 0.2, seatDir[1] * 0.2, 0])} r={0.0135} m={M.carbon} />
      <mesh geometry={SADDLE_GEO} material={M.saddle} position={[-0.235, 0.638, 0]} />

      {/* 브레이크 */}
      {disc ? (
        <>
          <mesh position={add(FRONT, [-0.05, 0.05, -0.075])} material={M.alloy}>
            <boxGeometry args={[0.05, 0.035, 0.022]} />
          </mesh>
          <mesh position={add(REAR, [0.055, 0.045, -0.075])} material={M.alloy}>
            <boxGeometry args={[0.05, 0.035, 0.022]} />
          </mesh>
        </>
      ) : (
        <>
          {/* 림 브레이크: 림 바로 바깥, 포크 위와 시트스테이 사이에 붙어요 */}
          <mesh position={[0.41, 0.338, 0]} rotation={[0, 0, 0.26]} material={M.alloy}>
            <boxGeometry args={[0.03, 0.04, 0.1]} />
          </mesh>
          <mesh position={[-0.27, 0.255, 0]} rotation={[0, 0, -0.73]} material={M.alloy}>
            <boxGeometry args={[0.03, 0.04, 0.1]} />
          </mesh>
        </>
      )}

      {/* 구동계: 체인링 2장, 크랭크, 페달, 카세트, 체인, 변속기 */}
      <mesh geometry={BIG_RING} material={M.alloy} position={at(BB, DRIVE_Z + 0.006)} />
      <mesh geometry={SMALL_RING} material={M.alloy} position={at(BB, DRIVE_Z - 0.002)} />
      <Disc at={at(BB, DRIVE_Z + 0.012)} r={0.03} h={0.012} m={M.darkAlloy} />
      {/* 스파이더 팔 4개: 크랭크와 체인링을 이어요 */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        return (
          <Tube
            key={i}
            from={at(BB, DRIVE_Z + 0.008)}
            to={add(BB, [Math.cos(a) * 0.092, Math.sin(a) * 0.092, DRIVE_Z + 0.006])}
            r={0.008}
            r2={0.005}
            m={M.darkAlloy}
          />
        );
      })}
      <Disc at={BB} r={0.01} h={0.19} m={M.darkAlloy} />
      <Tube from={at(BB, 0.095)} to={add(BB, [0.16, -0.045, 0.1])} r={0.014} r2={0.01} m={M.alloy} />
      <Tube from={at(BB, -0.095)} to={add(BB, [-0.16, 0.045, -0.1])} r={0.014} r2={0.01} m={M.alloy} />
      <mesh position={add(BB, [0.16, -0.045, 0.14])} material={M.rubber}>
        <boxGeometry args={[0.07, 0.014, 0.06]} />
      </mesh>
      <mesh position={add(BB, [-0.16, 0.045, -0.14])} material={M.rubber}>
        <boxGeometry args={[0.07, 0.014, 0.06]} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => (
        <Disc key={i} at={at(REAR, 0.04 + i * 0.0035)} r={0.056 - i * 0.0026} h={0.0018} m={M.alloy} />
      ))}
      <Curve points={CHAIN} r={0.0045} m={M.alloy} closed />
      <Tube from={add(REAR, [-0.005, -0.02, DRIVE_Z + 0.008])} to={add(REAR, [0.012, -0.075, DRIVE_Z + 0.008])} r={0.012} m={M.darkAlloy} />
      <Tube from={add(REAR, [0.012, -0.075, DRIVE_Z + 0.01])} to={add(REAR, [0.035, -0.145, DRIVE_Z + 0.01])} r={0.02} r2={0.018} m={M.darkAlloy} />
      <mesh position={add(BB, [seatDir[0] * 0.14, seatDir[1] * 0.14, 0.04])} material={M.darkAlloy}>
        <boxGeometry args={[0.05, 0.02, 0.03]} />
      </mesh>

      {/* 바닥 그림자 */}
      <mesh position={[0, -0.352, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.9, 0.5, 1]} renderOrder={-1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={SHADOW_TEX} transparent depthWrite={false} />
      </mesh>
    </group>
  );
});

interface Props {
  health: PartHealth[];
  brake: BrakeType;
}

/** 부품 점의 3D 자리를 화면 자리로 바꿔서 버튼을 옮겨요 */
function HotspotTracker({
  ids,
  spots,
  brake,
  spin,
  buttons,
  auto,
}: {
  ids: string[];
  spots: Record<string, V3>;
  brake: BrakeType;
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
      v.set(...spots[id]).applyMatrix4(g.matrixWorld).project(camera);
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    });
  });
  return (
    <group ref={group} position={[0, -0.15, 0]}>
      <BikeModel brake={brake} />
    </group>
  );
}

export default function Bike3D({ health, brake }: Props) {
  const places = hotspotsFor(brake);
  const spots = health.filter((h) => places[h.part.id]);
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
          // 반짝이는 재질이 비칠 방 모양 빛 (three.js 안에 있어요, 바깥 파일 없음)
          const pmrem = new THREE.PMREMGenerator(s.gl);
          s.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
          s.scene.environmentIntensity = 0.8;
          pmrem.dispose();
        }}
        aria-hidden
      >
        <directionalLight position={[2, 3, 2]} intensity={1.4} />
        {/* 뒤쪽 빛: 검은 타이어와 관 가장자리에 흰 선이 생겨요 (DESIGN.md 의 "위쪽 가장자리 흰 빛") */}
        <directionalLight position={[-2, 1.5, -2.5]} intensity={1.1} />
        <HotspotTracker ids={ids} spots={places} brake={brake} spin={spin} buttons={buttons} auto={auto} />
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

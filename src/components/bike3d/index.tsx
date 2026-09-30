import { Component, lazy, Suspense, type ReactNode } from 'react';
import type { BrakeType } from '../../types';
import type { PartHealth } from '../../lib/maintenance';

// 3D 코드는 커요. 부품 화면을 열 때만 받아요.
const Bike3D = lazy(() => import('./Bike3D'));

let webgl: boolean | undefined;

function hasWebGL(): boolean {
  if (webgl !== undefined) return webgl;
  try {
    const c = document.createElement('canvas');
    webgl = !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    webgl = false;
  }
  return webgl;
}

/** 3D 가 안 되면 (파일을 못 받음, WebGL 오류) 칸을 숨겨요. 부품 목록은 그대로예요. */
class Hide extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function BikeViewer({ health, brake }: { health: PartHealth[]; brake: BrakeType }) {
  if (!hasWebGL()) return null;
  return (
    <Hide>
      <section className="bike3d-card">
        <Suspense fallback={<div className="bike3d" />}>
          <Bike3D health={health} brake={brake} />
        </Suspense>
        <p className="muted small bike3d-hint">점을 누르면 부품을 자세히 봐요. 옆으로 끌면 돌아가요.</p>
      </section>
    </Hide>
  );
}

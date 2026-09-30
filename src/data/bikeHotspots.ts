import type { BrakeType } from '../types';

type V3 = [number, number, number];

/**
 * 3D 자전거에서 부품 점이 붙는 자리예요 (단위: m, 자전거 가운데가 0).
 * x = 앞(+) / 뒤(-), y = 위, z = 체인 쪽(+).
 * "샵 점검"(checkup)은 한 자리가 없어요. 그래서 점이 없어요.
 */
export const BIKE_HOTSPOTS: Record<string, V3> = {
  tires: [0.774, -0.192, 0],
  'brake-pads': [0.41, 0.345, 0.05],
  'bar-tape': [0.548, 0.46, 0.21],
  cables: [0.15, 0.13, 0.035],
  chain: [-0.285, 0.046, 0.073],
  'chain-lube': [-0.27, -0.16, 0.073],
  cassette: [-0.5, 0, 0.085],
};

/** 디스크 브레이크는 패드가 앞바퀴 가운데 옆(캘리퍼)에 있어요 */
const DISC: Record<string, V3> = {
  'brake-pads': [0.45, 0.05, -0.075],
};

export function hotspotsFor(brake: BrakeType): Record<string, V3> {
  return brake === 'disc' ? { ...BIKE_HOTSPOTS, ...DISC } : BIKE_HOTSPOTS;
}

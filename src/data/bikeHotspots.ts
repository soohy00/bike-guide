/**
 * 3D 자전거에서 부품 점이 붙는 자리예요 (단위: m, 자전거 가운데가 0).
 * x = 앞(+) / 뒤(-), y = 위, z = 체인 쪽(+).
 * "샵 점검"(checkup)은 한 자리가 없어요. 그래서 점이 없어요.
 */
export const BIKE_HOTSPOTS: Record<string, [number, number, number]> = {
  tires: [0.786, -0.165, 0],
  'brake-pads': [0.47, 0.35, 0.04],
  'bar-tape': [0.55, 0.46, 0.21],
  cables: [0.16, 0.15, 0.03],
  chain: [-0.29, 0.045, 0.07],
  'chain-lube': [-0.24, -0.14, 0.07],
  cassette: [-0.5, 0, 0.09],
};

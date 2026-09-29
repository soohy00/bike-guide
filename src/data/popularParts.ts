import type { BikeModel } from '../types';

export interface Product {
  id: string;
  partId: string;
  name: string;
  price: string;
  /** 초보가 알면 좋은 한 줄 */
  tip: string;
  /** 맞는 단수 (없으면 모두 맞아요) */
  speeds?: number[];
  /** 맞는 브레이크 (없으면 모두 맞아요) */
  brakeType?: BikeModel['brakeType'];
}

/**
 * 예시 데이터예요. 진짜 사용자 기록이 아니에요.
 * 나중에 서버를 붙이면 실제 교체 기록으로 바꿔요.
 */
export const PRODUCTS: Product[] = [
  // 체인
  { id: 'kmc-x8', partId: 'chain', name: 'KMC X8', price: '약 2만 원', tip: '8단용이에요. 퀵링크가 같이 들어 있어요.', speeds: [7, 8] },
  { id: 'shimano-hg40', partId: 'chain', name: 'Shimano CN-HG40', price: '약 2만 원', tip: '6~8단용 기본 체인이에요.', speeds: [7, 8] },
  { id: 'kmc-x9', partId: 'chain', name: 'KMC X9', price: '약 3만 원', tip: '9단용이에요.', speeds: [9] },
  { id: 'kmc-x11', partId: 'chain', name: 'KMC X11', price: '약 4만 원', tip: '11단용이에요. 퀵링크가 있어서 빼기 쉬워요.', speeds: [11] },
  { id: 'shimano-hg601', partId: 'chain', name: 'Shimano 105 CN-HG601', price: '약 4만 원', tip: '11단 105 체인이에요.', speeds: [11] },
  { id: 'shimano-m7100', partId: 'chain', name: 'Shimano CN-M7100', price: '약 5만 원', tip: '12단용이에요. 퀵링크를 꼭 12단용으로 사요.', speeds: [12] },
  // 브레이크 패드
  { id: 'shimano-r55c4', partId: 'brake-pads', name: 'Shimano R55C4 패드', price: '약 2만 원', tip: '림 브레이크용 기본 패드예요.', brakeType: 'rim' },
  { id: 'swissstop-bxp', partId: 'brake-pads', name: 'SwissStop BXP', price: '약 3만 원', tip: '비 올 때도 잘 서요.', brakeType: 'rim' },
  { id: 'shimano-l05a', partId: 'brake-pads', name: 'Shimano L05A 레진 패드', price: '약 2만 원', tip: '디스크 브레이크용이에요. 소리가 적어요.', brakeType: 'disc' },
  { id: 'shimano-l04c', partId: 'brake-pads', name: 'Shimano L04C 메탈 패드', price: '약 3만 원', tip: '디스크용이에요. 오래 가요.', brakeType: 'disc' },
  // 타이어
  { id: 'conti-gp5000', partId: 'tires', name: 'Continental GP5000', price: '1개 약 6만 원', tip: '잘 굴러가고 펑크에 강해요. 인기가 많아요.' },
  { id: 'michelin-power', partId: 'tires', name: 'Michelin Power Road', price: '1개 약 6만 원', tip: '잘 붙고 부드러워요.' },
  { id: 'schwalbe-one', partId: 'tires', name: 'Schwalbe One', price: '1개 약 5만 원', tip: '가볍고 무난해요.' },
  { id: 'conti-ultra', partId: 'tires', name: 'Continental Ultra Sport III', price: '1개 약 2만 원', tip: '싸고 튼튼해요. 입문용이에요.' },
  // 카세트
  { id: 'shimano-hg50-8', partId: 'cassette', name: 'Shimano CS-HG50 (8단)', price: '약 3만 원', tip: '8단용 기본 카세트예요.', speeds: [8] },
  { id: 'shimano-hg200-7', partId: 'cassette', name: 'Shimano CS-HG200 (7단)', price: '약 2만 원', tip: '7단용이에요.', speeds: [7] },
  { id: 'shimano-hg400-9', partId: 'cassette', name: 'Shimano CS-HG400 (9단)', price: '약 4만 원', tip: '9단용이에요.', speeds: [9] },
  { id: 'shimano-r7000', partId: 'cassette', name: 'Shimano 105 CS-R7000', price: '약 6만 원', tip: '11단 105 카세트예요.', speeds: [11] },
  { id: 'shimano-r7100', partId: 'cassette', name: 'Shimano 105 CS-R7100', price: '약 9만 원', tip: '12단 105 카세트예요.', speeds: [12] },
  // 바 테이프
  { id: 'supacaz', partId: 'bar-tape', name: 'Supacaz Super Sticky Kush', price: '약 4만 원', tip: '두껍고 손이 편해요.' },
  { id: 'lizard', partId: 'bar-tape', name: 'Lizard Skins DSP 2.5', price: '약 4만 원', tip: '잘 안 미끄러워요.' },
  { id: 'fizik', partId: 'bar-tape', name: 'fizik Vento Microtex', price: '약 3만 원', tip: '가볍고 얇아요.' },
  // 체인 오일
  { id: 'finish-dry', partId: 'chain-lube', name: 'Finish Line Dry', price: '약 1.5만 원', tip: '맑은 날용이에요. 먼지가 덜 붙어요.' },
  { id: 'finish-wet', partId: 'chain-lube', name: 'Finish Line Wet', price: '약 1.5만 원', tip: '비 오는 날용이에요. 오래 가요.' },
  { id: 'muc-off-dry', partId: 'chain-lube', name: 'Muc-Off Dry Lube', price: '약 2만 원', tip: '많이 쓰는 드라이 오일이에요.' },
];

export function isCompatible(product: Product, model: BikeModel): boolean {
  if (product.speeds && !product.speeds.includes(model.speeds)) return false;
  if (product.brakeType && product.brakeType !== model.brakeType) return false;
  return true;
}

/** 같은 문자열이면 늘 같은 숫자 (0~1) */
function seeded(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export interface PopularPick {
  product: Product;
  /** 이 모델 주인 중 이 제품을 고른 비율 (%). 예시 값이에요. */
  share: number;
}

/** 같은 모델 주인들이 많이 쓴 제품 (예시). 비율이 높은 순서예요. */
export function popularFor(model: BikeModel, partId: string): PopularPick[] {
  const list = PRODUCTS.filter((p) => p.partId === partId && isCompatible(p, model));
  const weights = list.map((p) => 0.3 + seeded(`${model.id}:${p.id}`));
  const total = weights.reduce((a, b) => a + b, 0);
  return list
    .map((product, i) => ({ product, share: Math.round((weights[i] / total) * 100) }))
    .sort((a, b) => b.share - a.share);
}

import { Cable, CircleDot, Cog, Droplet, Link, OctagonMinus, Ribbon, Wrench, type LucideIcon } from 'lucide-react';

export interface PartDef {
  id: string;
  name: string;
  icon: LucideIcon;
  /** 이 부품이 무엇인지 쉬운 말로 */
  what: string;
  /** 이만큼 타면 교체 (또는 관리) */
  intervalKm: number;
  /** 이만큼 시간이 지나도 교체 (선택) */
  intervalMonths?: number;
  /** "교체" 대신 쓸 말 (예: 오일은 "칠하기") */
  actionWord: string;
  /** 교체할 때가 된 신호 */
  signs: string[];
  /** 1 = 혼자 쉽게, 2 = 연습하면 혼자, 3 = 샵에 맡기기 */
  diy: 1 | 2 | 3;
  /** 대략 비용 (부품 + 공임, 원) */
  cost: string;
}

/**
 * 로드 자전거 소모품.
 * 교체 거리는 평균값이에요. 비, 흙길, 몸무게, 타는 방법에 따라 달라요.
 */
export const PARTS: PartDef[] = [
  {
    id: 'chain-lube',
    name: '체인 오일',
    icon: Droplet,
    what: '체인이 부드럽게 돌도록 바르는 기름이에요. 오일이 없으면 체인이 빨리 닳아요.',
    intervalKm: 300,
    actionWord: '칠하기',
    signs: ['체인에서 "찰찰" 또는 "끽끽" 소리가 나요.', '비 오는 날 탔어요.', '체인이 말라 보여요.'],
    diy: 1,
    cost: '오일 1병 1~2만 원 (여러 번 써요)',
  },
  {
    id: 'chain',
    name: '체인',
    icon: Link,
    what: '페달의 힘을 뒷바퀴로 보내는 줄이에요. 타면 조금씩 늘어나요. 늘어난 체인은 톱니도 닳게 해요.',
    intervalKm: 3000,
    actionWord: '교체',
    signs: ['체인 체커로 재면 0.5% 이상 늘어났어요.', '기어가 저절로 튀어요.', '체인이 녹슬었어요.'],
    diy: 2,
    cost: '2~6만 원 + 공임 1만 원',
  },
  {
    id: 'brake-pads',
    name: '브레이크 패드',
    icon: OctagonMinus,
    what: '바퀴를 잡아서 자전거를 세우는 고무(또는 금속) 조각이에요. 쓰면 닳아요.',
    intervalKm: 3000,
    actionWord: '교체',
    signs: ['패드의 홈(줄무늬)이 거의 안 보여요.', '브레이크를 더 세게 잡아야 서요.', '"끼익" 또는 쇠 긁는 소리가 나요.'],
    diy: 2,
    cost: '1~4만 원 + 공임 1만 원',
  },
  {
    id: 'tires',
    name: '타이어',
    icon: CircleDot,
    what: '바퀴 바깥의 고무예요. 뒷바퀴가 앞바퀴보다 빨리 닳아요.',
    intervalKm: 5000,
    actionWord: '교체',
    signs: ['가운데가 평평하게 닳았어요.', '작은 구멍이나 찢어진 곳이 많아요.', '펑크가 자주 나요.', '안쪽 천(실)이 보여요.'],
    diy: 2,
    cost: '1개 4~7만 원 + 공임 1만 원',
  },
  {
    id: 'cassette',
    name: '카세트 (뒤 톱니)',
    icon: Cog,
    what: '뒷바퀴에 붙은 여러 개의 톱니예요. 보통 체인을 2~3번 바꿀 때 1번 바꿔요.',
    intervalKm: 9000,
    actionWord: '교체',
    signs: ['새 체인을 달았는데 기어가 미끄러져요.', '톱니 끝이 상어 이빨처럼 뾰족해요.'],
    diy: 3,
    cost: '3~10만 원 + 공임 1~2만 원',
  },
  {
    id: 'bar-tape',
    name: '바 테이프',
    icon: Ribbon,
    what: '핸들에 감은 테이프예요. 손을 편하게 하고 미끄러지지 않게 해요.',
    intervalKm: 6000,
    intervalMonths: 12,
    actionWord: '교체',
    signs: ['찢어지거나 풀렸어요.', '더럽고 미끄러워요.'],
    diy: 2,
    cost: '1~3만 원',
  },
  {
    id: 'cables',
    name: '케이블 (변속·브레이크)',
    icon: Cable,
    what: '레버와 변속기·브레이크를 잇는 가는 쇠줄이에요. 늘어나거나 녹슬어요.',
    intervalKm: 8000,
    intervalMonths: 18,
    actionWord: '교체',
    signs: ['변속이 느리거나 뻑뻑해요.', '브레이크 레버가 뻑뻑해요.', '케이블이 녹슬거나 풀렸어요.'],
    diy: 3,
    cost: '2~5만 원 (공임 포함)',
  },
  {
    id: 'checkup',
    name: '샵 정기 점검',
    icon: Wrench,
    what: '자전거 샵에서 전체를 한 번 봐 줘요. 볼트 조임, 변속, 브레이크, 바퀴 휨을 점검해요.',
    intervalKm: 3000,
    intervalMonths: 12,
    actionWord: '받기',
    signs: ['산 지 1년이 지났어요.', '어디선가 "딸깍" 소리가 나요.', '넘어진 적이 있어요.'],
    diy: 3,
    cost: '3~6만 원',
  },
];

export function findPart(id: string): PartDef | undefined {
  return PARTS.find((p) => p.id === id);
}

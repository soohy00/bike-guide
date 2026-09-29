import { Link2Off, OctagonMinus, Scissors, Shuffle, Unlink, Volume2, Waves, Wind, type LucideIcon } from 'lucide-react';

export interface Trouble {
  id: string;
  icon: LucideIcon;
  /** 내 눈에 보이는 문제 */
  symptom: string;
  /** 왜 이런 일이 생기나요 */
  why: string;
  /** 필요한 것. {tireSize}, {speeds} 는 내 자전거 값으로 바뀌어요. */
  needs: string[];
  /** 순서대로 하는 일 */
  steps: string[];
  /** 1 = 길에서 혼자, 2 = 연습하면 혼자, 3 = 샵으로 */
  diy: 1 | 2 | 3;
  /** 이럴 때는 샵에 가요 */
  goToShop: string;
  /** 위험 경고 (선택) */
  warning?: string;
  /** 관련 부품 (부품 화면으로 이동) */
  partId?: string;
}

export const TROUBLES: Trouble[] = [
  {
    id: 'flat',
    icon: Wind,
    symptom: '바퀴 바람이 빠졌어요 (펑크)',
    why: '작은 유리, 철사, 돌이 타이어를 뚫고 안쪽 튜브에 구멍을 냈어요. 바람이 너무 적어도 튜브가 찢어져요.',
    needs: ['예비 튜브 ({tireSize}, 프레스타 밸브)', '타이어 레버 2개', '휴대용 펌프 또는 CO2', '(선택) 패치 킷'],
    steps: [
      '안전한 곳으로 자전거를 옮겨요.',
      '브레이크를 열고, 바퀴를 빼요. 뒷바퀴는 가장 작은 톱니로 먼저 바꿔요.',
      '타이어 레버로 타이어 한쪽을 림 밖으로 빼요.',
      '튜브를 빼요.',
      '타이어 안쪽을 손가락으로 천천히 만져요. 박힌 것을 찾아서 빼요. (이것을 안 하면 또 펑크가 나요!)',
      '새 튜브에 바람을 조금 넣어서 동그랗게 만들어요.',
      '밸브부터 넣고, 튜브를 타이어 안에 넣어요.',
      '손으로 타이어를 림에 다시 끼워요. 튜브가 끼지 않았는지 봐요.',
      '바람을 넣어요. 바퀴를 끼우고, 브레이크를 다시 닫아요.',
    ],
    diy: 2,
    goToShop: '타이어가 크게 찢어졌어요. 또는 같은 날 펑크가 또 났어요.',
    warning: '바퀴를 끼운 뒤에 브레이크를 꼭 다시 닫아요. 브레이크가 열려 있으면 서지 않아요.',
    partId: 'tires',
  },
  {
    id: 'chain-drop',
    icon: Link2Off,
    symptom: '체인이 빠졌어요',
    why: '기어를 너무 빨리 바꾸거나, 울퉁불퉁한 길에서 체인이 톱니 밖으로 떨어졌어요.',
    needs: ['(선택) 장갑 또는 휴지'],
    steps: [
      '자전거를 멈추고 내려요.',
      '체인이 앞 톱니 안쪽에 빠졌으면, 체인을 손으로 작은 톱니 위에 올려요.',
      '뒷바퀴를 들고, 페달을 앞으로 천천히 돌려요. 체인이 스스로 올라가요.',
      '페달을 몇 번 더 돌려서 잘 도는지 봐요.',
    ],
    diy: 1,
    goToShop: '체인이 자주 빠져요. 변속기 조정이 필요해요.',
    partId: 'chain',
  },
  {
    id: 'chain-noise',
    icon: Volume2,
    symptom: '체인에서 "찰찰" "끽끽" 소리가 나요',
    why: '체인에 오일이 없어요. 또는 체인에 먼지가 많아요.',
    needs: ['체인 오일', '마른 헝겊'],
    steps: [
      '헝겊으로 체인을 잡고, 페달을 뒤로 돌려서 먼지를 닦아요.',
      '체인 마디마다 오일을 1방울씩 떨어뜨려요. 페달을 뒤로 돌리면서 해요.',
      '페달을 20번 정도 돌려요. 오일이 안으로 들어가요.',
      '10분 뒤에 헝겊으로 겉의 오일을 닦아요. 겉에 오일이 많으면 먼지가 붙어요.',
    ],
    diy: 1,
    goToShop: '오일을 칠해도 소리가 나요. 다른 부품 문제일 수 있어요.',
    warning: '브레이크(림 또는 디스크)에 오일이 묻지 않게 조심해요. 오일이 묻으면 브레이크가 안 들어요.',
    partId: 'chain-lube',
  },
  {
    id: 'shift',
    icon: Shuffle,
    symptom: '기어가 잘 안 바뀌어요 / 저절로 튀어요',
    why: '변속 케이블이 조금 늘어났어요. 또는 체인이나 톱니가 닳았어요.',
    needs: ['(없어도 돼요) 손으로 돌리는 조절 나사', '닳았으면: {speeds}단 체인'],
    steps: [
      '뒤 변속기에서 케이블이 들어가는 곳의 작은 둥근 나사(배럴 조절기)를 찾아요.',
      '작은 톱니로 잘 안 가면: 나사를 시계 방향으로 반 바퀴 돌려요.',
      '큰 톱니로 잘 안 가면: 나사를 시계 반대 방향으로 반 바퀴 돌려요.',
      '페달을 돌리면서 기어를 바꿔 봐요. 조금씩 고쳐요.',
    ],
    diy: 2,
    goToShop: '반 바퀴씩 3번 돌려도 안 고쳐져요. 또는 넘어진 뒤에 생겼어요 (변속기 행어가 휘었을 수 있어요).',
    partId: 'cables',
  },
  {
    id: 'brake-weak',
    icon: OctagonMinus,
    symptom: '브레이크가 약해요 / 끼익 소리가 나요',
    why: '브레이크 패드가 닳았어요. 또는 패드나 림에 기름·물이 묻었어요.',
    needs: ['브레이크 패드 (림용 또는 디스크용)', '알코올 솜', '육각 렌치 (보통 4mm 또는 5mm)'],
    steps: [
      '패드를 봐요. 홈(줄무늬)이 안 보이면 새 패드로 바꿔요.',
      '림 브레이크: 알코올로 림과 패드를 닦아요.',
      '디스크 브레이크: 디스크를 손으로 만지지 마세요. 알코올로만 닦아요.',
      '안전한 곳에서 천천히 타면서 브레이크를 여러 번 잡아 봐요.',
    ],
    diy: 2,
    goToShop: '레버를 끝까지 당겨도 잘 안 서요. 유압 디스크 브레이크 레버가 물렁해요.',
    warning: '브레이크가 약하면 타지 마세요. 가장 위험한 고장이에요.',
    partId: 'brake-pads',
  },
  {
    id: 'wheel-wobble',
    icon: Waves,
    symptom: '바퀴가 흔들려요 / 브레이크에 닿아요',
    why: '바퀴가 제대로 안 끼워졌어요. 또는 바퀴(림)가 휘었어요.',
    needs: ['(없어도 돼요) 손'],
    steps: [
      '퀵릴리즈 레버(또는 스루 액슬)를 열어요.',
      '바퀴를 똑바로 다시 넣어요. 자전거를 세우고 위에서 눌러요.',
      '레버를 닫아요. 닫을 때 손바닥에 자국이 남을 만큼 단단해야 해요.',
      '바퀴를 돌려 봐요. 아직 흔들리면 림이 휜 거예요.',
    ],
    diy: 1,
    goToShop: '다시 끼워도 흔들려요. 샵에서 "휠 정비(휠 텐션 조정)"를 받아요.',
    warning: '바퀴 레버가 헐거우면 바퀴가 빠질 수 있어요. 탈 때마다 확인해요.',
  },
  {
    id: 'chain-broken',
    icon: Unlink,
    symptom: '체인이 끊어졌어요',
    why: '체인이 많이 닳았어요. 또는 힘을 세게 주면서 기어를 바꿨어요.',
    needs: ['{speeds}단용 퀵링크', '체인 공구 (체인 커터)', '또는: 택시·가족에게 연락'],
    steps: [
      '안전한 곳으로 가요.',
      '체인 공구로 망가진 마디를 빼요.',
      '퀵링크로 두 끝을 연결해요.',
      '공구가 없으면 무리하지 말고 집이나 샵으로 가요.',
    ],
    diy: 3,
    goToShop: '거의 항상 샵에 가요. 체인 길이와 톱니 상태를 봐야 해요.',
    partId: 'chain',
  },
  {
    id: 'tire-cut',
    icon: Scissors,
    symptom: '타이어가 찢어졌어요',
    why: '날카로운 것에 베였어요. 튜브가 밖으로 튀어나올 수 있어요.',
    needs: ['타이어 부트 (또는 지폐·에너지바 포장지)', '새 타이어 ({tireSize})'],
    steps: [
      '찢어진 곳 안쪽에 타이어 부트를 대요.',
      '튜브를 넣고 바람을 조금 적게 넣어요.',
      '천천히 집이나 샵까지만 가요.',
      '새 타이어로 바꿔요.',
    ],
    diy: 2,
    goToShop: '찢어진 곳이 1cm보다 커요.',
    partId: 'tires',
  },
];

export function fillNeeds(text: string, tireSize: string, speeds: number): string {
  return text.replace('{tireSize}', tireSize).replace('{speeds}', String(speeds));
}

export function findTrouble(id: string): Trouble | undefined {
  return TROUBLES.find((t) => t.id === id);
}

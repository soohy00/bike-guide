import { Backpack, BookA, Cog, Droplet, Gauge, ListChecks, TrafficCone, type LucideIcon } from 'lucide-react';

export interface GuideSection {
  title?: string;
  text?: string;
  /** 체크 박스로 보여 줘요 */
  checklist?: string[];
  /** 번호를 붙여서 보여 줘요 */
  steps?: string[];
  tip?: string;
}

export interface Guide {
  id: string;
  icon: LucideIcon;
  title: string;
  summary: string;
  minutes: number;
  sections: GuideSection[];
}

export const GUIDES: Guide[] = [
  {
    id: 'pre-ride',
    icon: ListChecks,
    title: '타기 전 1분 점검',
    summary: '탈 때마다 해요. 공기, 브레이크, 체인, 바퀴를 봐요.',
    minutes: 1,
    sections: [
      {
        text: '이름은 "ABC 점검"이에요. 1분이면 끝나요. 사고를 많이 막아요.',
        checklist: [
          'A (Air, 공기): 타이어를 엄지로 꾹 눌러요. 쑥 들어가면 바람을 넣어요.',
          'B (Brakes, 브레이크): 두 레버를 꽉 잡고 자전거를 앞으로 밀어요. 바퀴가 안 돌아야 해요.',
          'C (Chain, 체인): 체인이 말랐거나 녹슬었는지 봐요.',
          '바퀴 레버(퀵릴리즈)가 꽉 닫혔는지 봐요.',
          '라이트와 헬멧을 챙겨요.',
        ],
      },
    ],
  },
  {
    id: 'pump',
    icon: Gauge,
    title: '바람 넣는 법',
    summary: '로드 자전거는 바람이 빨리 빠져요. 일주일에 1번 넣어요.',
    minutes: 3,
    sections: [
      {
        title: '로드 자전거의 밸브',
        text: '로드 자전거는 보통 "프레스타" 밸브예요. 가늘고, 끝에 작은 나사가 있어요.',
      },
      {
        title: '순서',
        steps: [
          '밸브 뚜껑을 빼요.',
          '밸브 끝의 작은 나사를 시계 반대 방향으로 돌려서 풀어요.',
          '나사 끝을 1번 톡 눌러요. "칙" 소리가 나면 좋아요.',
          '펌프 머리를 밸브에 끝까지 끼우고 레버를 올려요.',
          '압력계를 보면서 바람을 넣어요.',
          '펌프를 빼고, 작은 나사를 다시 조이고, 뚜껑을 끼워요.',
        ],
      },
      {
        title: '얼마나 넣어요?',
        text: '타이어 옆면에 숫자가 써 있어요 (예: 80-110 PSI). 그 안에서 넣어요. 25c 타이어, 몸무게 70kg이면 약 80~90 PSI부터 시작해요.',
        tip: '너무 많이 넣으면 딱딱하고 미끄러워요. 너무 적으면 펑크가 잘 나요.',
      },
    ],
  },
  {
    id: 'lube',
    icon: Droplet,
    title: '체인에 오일 칠하기',
    summary: '300km마다, 또는 비 온 날 뒤에 해요. 5분이면 끝나요.',
    minutes: 5,
    sections: [
      {
        steps: [
          '마른 헝겊으로 체인을 잡고, 페달을 뒤로 돌려요. 먼지가 닦여요.',
          '체인 마디마다 오일을 1방울씩 떨어뜨려요.',
          '페달을 20번 돌려요.',
          '10분 기다려요.',
          '헝겊으로 겉에 남은 오일을 닦아요.',
        ],
        tip: '오일은 체인 "안"에 필요해요. 겉은 깨끗해야 먼지가 안 붙어요.',
      },
    ],
  },
  {
    id: 'gears',
    icon: Cog,
    title: '기어 쓰는 법',
    summary: '오르막은 가볍게, 평지는 무겁게. 체인을 꼬지 마세요.',
    minutes: 3,
    sections: [
      {
        title: '레버',
        text: '오른손 레버는 뒤 기어를 바꿔요 (작게 바꿔요). 왼손 레버는 앞 기어를 바꿔요 (크게 바꿔요).',
      },
      {
        title: '규칙',
        checklist: [
          '기어는 페달을 돌리면서 바꿔요.',
          '오르막 전에 미리 가벼운 기어로 바꿔요.',
          '기어를 바꿀 때 페달 힘을 조금 빼요.',
          '"큰 톱니 + 큰 톱니" 또는 "작은 톱니 + 작은 톱니"는 쓰지 마세요. 체인이 꼬여서 빨리 닳아요.',
        ],
        tip: '1분에 페달 80~90바퀴가 좋아요. 다리가 무거우면 가벼운 기어로 바꿔요.',
      },
    ],
  },
  {
    id: 'kit',
    icon: Backpack,
    title: '꼭 필요한 준비물',
    summary: '처음 살 것들이에요. 비싼 것은 나중에 사요.',
    minutes: 2,
    sections: [
      {
        title: '꼭 필요해요',
        checklist: [
          '헬멧',
          '앞 라이트 (흰색) + 뒤 라이트 (빨간색)',
          '예비 튜브 1개 (내 타이어 크기)',
          '타이어 레버 2개',
          '휴대용 펌프 또는 CO2',
          '휴대용 공구 (육각 렌치 세트)',
          '물통',
        ],
      },
      {
        title: '집에 있으면 좋아요',
        checklist: ['바닥용 펌프 (압력계 있는 것)', '체인 오일', '헝겊', '체인 체커 (체인이 늘었는지 재요)'],
      },
    ],
  },
  {
    id: 'safety',
    icon: TrafficCone,
    title: '안전하게 타는 법',
    summary: '도로에서 지켜야 할 것들이에요.',
    minutes: 3,
    sections: [
      {
        checklist: [
          '자전거는 "차"예요. 도로의 오른쪽 끝으로 타요.',
          '자전거 도로가 있으면 자전거 도로로 가요.',
          '인도(보행자 길)에서는 내려서 끌어요.',
          '헬멧을 써요. (법으로 꼭 써야 해요.)',
          '밤에는 라이트를 켜요.',
          '이어폰은 쓰지 마세요.',
          '술을 마시면 타지 마세요.',
        ],
      },
      {
        title: '손 신호',
        text: '왼쪽으로 갈 때: 왼팔을 옆으로 뻗어요. 오른쪽으로 갈 때: 오른팔을 옆으로 뻗어요. 멈출 때: 팔을 아래로 45도 내려요.',
      },
    ],
  },
  {
    id: 'words',
    icon: BookA,
    title: '자전거 부품 이름',
    summary: '샵에서 쓰는 말이에요. 알면 말하기 쉬워요.',
    minutes: 4,
    sections: [
      {
        checklist: [
          '프레임: 자전거의 몸통이에요.',
          '포크: 앞바퀴를 잡는 부분이에요.',
          '크랭크: 페달이 붙은 팔이에요.',
          '체인링: 앞 톱니예요.',
          '카세트 (스프라켓): 뒤 톱니예요.',
          '디레일러 (변속기): 체인을 옆으로 옮겨서 기어를 바꿔요.',
          '림: 바퀴의 둥근 테예요.',
          '스포크: 바퀴의 가는 살이에요.',
          '퀵릴리즈 / 스루 액슬: 바퀴를 고정하는 축이에요.',
          '안장 / 싯포스트: 앉는 곳 / 안장을 받치는 기둥이에요.',
          '스템: 핸들과 몸통을 잇는 부분이에요.',
          '그룹셋: 변속기, 브레이크, 크랭크 같은 부품 세트예요 (예: Shimano 105).',
        ],
      },
    ],
  },
];

export function findGuide(id: string): Guide | undefined {
  return GUIDES.find((g) => g.id === id);
}

# bike-guide

초보를 위한 로드 자전거 정비·입문 가이드 웹 앱이에요 (React + Vite + TypeScript).

- 실행: `npm run dev` / 테스트: `npm test` / 빌드: `npm run build`
- 데이터는 localStorage에만 저장해요. 서버는 없어요.
- 21st MCP는 `.mcp.json`에 있어요. API 키는 환경 변수 `TWENTY_FIRST_API_KEY`에서 읽어요. 키를 파일에 쓰지 마세요.

## 디자인

@DESIGN.md

- `DESIGN.md`는 GitHub VoltAgent/awesome-design-md의 `design-md/linear.app/DESIGN.md`예요
  (커밋 f696123, MIT). 파일 내용은 바꾸지 마세요.
- 색, 글꼴, 간격은 DESIGN.md를 따라요. 토큰은 `src/styles.css`의 `:root`에 있어요.
- 앱은 다크 모드만 있어요 (DESIGN.md: 라이트 모드를 만들지 마세요).

### DESIGN.md에 없는 것 (이 프로젝트에서 정했어요)
- 한글 글꼴: Pretendard (npm `pretendard`). DESIGN.md가 추천한 대체 글꼴 Inter를 바탕으로 만든 글꼴이에요.
- 부품 상태 색: 좋음 `#27a644` (DESIGN.md의 success), 곧 `#d9a53b`, 지금 `#eb5757`.
  막대, 작은 점, 경고 선에만 써요. 카드나 버튼 배경에는 쓰지 마세요.
- 아이콘: `lucide-react`를 써요. 이모지는 쓰지 마세요. 색은 글자 색(ink 계열)만 써요.
  선 굵기는 화면에서 1.5px로 모든 크기에서 같아요 (Primer octicons, `vector-effect: non-scaling-stroke`).
  지금 탭의 아이콘만 2px이에요 (M3 navigation bar: 채운 아이콘이 없으면 선을 굵게 해요).
  부품·고장·수업 아이콘은 `src/data/*.ts`의 `icon`에 있어요. 네모 칸은 `IconTile`(`src/components/ui.tsx`)이에요.
- 아래 탭 막대 (M3 navigation bar): 탭 1개는 늘 켜져 있어요 (설정 화면 = 홈). 지금 탭을 다시 누르면 맨 위로 올라가요.
- 부품 막대 (Geist Progress): 막대 옆에 "약 N km 남았어요" 글을 둬요. 막대 이름에 부품 이름을 넣어요.
- 3D 자전거 (`src/components/bike3d/`, 부품 화면 맨 위): three.js + @react-three/fiber. 바깥 모델 파일 없이 기본 모양으로 만들어요.
  색은 ink·hairline 계열만 써요. 반짝임은 재질(clearcoat, metalness)과 three.js의 RoomEnvironment 빛으로 만들어요.
  브레이크 모양은 등록한 자전거의 `brakeType`(disc/rim)을 따라요. 부품 사진·브랜드 글자는 넣지 않아요.
  부품 점 자리는 `src/data/bikeHotspots.ts`에 있어요 (`hotspotsFor(brake)`). 부품을 더하면 점 자리도 더해요 (테스트가 확인해요).
  3D 코드는 lazy load해요. WebGL이 없거나 오류가 나면 칸을 숨겨요. 움직임 줄이기면 혼자 돌지 않아요.
- 로고: `public/logo.webp` (사용자가 준 그림). 앱 아이콘 PNG(`icon-192`, `icon-512`, `apple-touch-icon`, `favicon`)는 이 그림으로 만들었어요.
  로고의 초록·갈색은 로고 안에서만 써요. UI 색으로 쓰지 마세요.
- 모션: kinetics.colorion.co에서 가져왔어요. 곡선은 `--ease-glide` 1개만 써요 (튕기는 곡선은 쓰지 않아요).
  목록 화면이 열릴 때 = Stagger Entrance (`.stack.stagger`에만), 막대가 찰 때 = Elastic Progress (`clip-path`, `--fill`),
  카드를 누를 때 = Squish Button (0.98). `width`, `height`는 애니메이션하지 마세요.
  `prefers-reduced-motion`이면 모션을 꺼요.
- impeccable 규칙 (사용자가 따르기로 정했어요):
  - 제목 위에 작은 회색 글자(eyebrow)를 두지 마세요. 필요하면 제목 아래에 둬요.
  - 큰 숫자 + 작은 이름표 모양(hero metric)을 쓰지 마세요.
  - 카드나 경고 상자에 1px보다 두꺼운 왼쪽/오른쪽 색 선을 쓰지 마세요.
  - 흐린 글자(placeholder, 탭 이름 등)도 대비 4.5:1 이상이어야 해요. `--ink-tertiary`는 글자에 쓰지 마세요.

## 프론트엔드 참고

이 섹션은 이 3가지 때에만 써요:
- 새 페이지를 만들 때
- 사용자가 디자인이 별로라고 말할 때
- 사용자가 아래 사이트 이름을 말할 때

작은 수정에는 쓰지 말고 바로 고쳐요.

### 순서
1. 스타일: styles.refero.design 또는 GitHub VoltAgent/awesome-design-md에서
   제품에 맞는 DESIGN 파일(.md)을 골라요. 그 파일을 프로젝트 루트에 넣어요.
   프로젝트 CLAUDE.md에서 @로 불러와요.
   그다음부터 색, 글꼴, 간격은 그 파일을 따라요.
2. 컴포넌트: 21st.dev를 먼저 봐요. 21st.dev MCP가 있으면 바로 불러요.
   무료 한도가 있어요. 그래서 부르기 전에 무엇을 찾는지 사용자에게 먼저 말해요.
   그다음 component.gallery에서 다른 디자인 시스템이 어떻게 만들었는지 봐요.
3. 모션: kinetics.colorion.co에서 프롬프트나 React 코드를 가져와요.
4. 다 했는데 어색하면 impeccable.style의 polish와 distill로 다듬어요.
   스킬은 `.claude/skills/impeccable`에 있어요 (`/impeccable polish`, `/impeccable distill`).
   UI를 바꾼 뒤에는 `.claude/skills/impeccable/scripts/impeccable detect --json <바꾼 파일>`을 1번 돌려요.

### 지켜야 할 것
- 프로젝트에 이미 있는 디자인 시스템과 컴포넌트가 먼저예요.
  바깥 자료로는 아직 정하지 않은 부분만 채워요.
- 필요한 MCP, 스킬, CLI가 없으면 설치할지 물어봐요. 흉내 내지 마세요.
- 페이지 내용을 읽을 수 없으면 멈춰요. 사용자에게 붙여넣어 달라고 해요.
  기억으로 채우지 마세요.
- 바깥 자료를 쓸 때마다 어디에서 무엇을 가져왔는지,
  어느 파일에서 무엇을 바꿨는지 알려 줘요.

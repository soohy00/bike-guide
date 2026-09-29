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
- 이모지 아이콘은 흑백(`grayscale`)으로 보여 줘요. 강조 색을 1개로 지키기 위해서예요.

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

### 지켜야 할 것
- 프로젝트에 이미 있는 디자인 시스템과 컴포넌트가 먼저예요.
  바깥 자료로는 아직 정하지 않은 부분만 채워요.
- 필요한 MCP, 스킬, CLI가 없으면 설치할지 물어봐요. 흉내 내지 마세요.
- 페이지 내용을 읽을 수 없으면 멈춰요. 사용자에게 붙여넣어 달라고 해요.
  기억으로 채우지 마세요.
- 바깥 자료를 쓸 때마다 어디에서 무엇을 가져왔는지,
  어느 파일에서 무엇을 바꿨는지 알려 줘요.

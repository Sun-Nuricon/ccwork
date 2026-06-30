---
name: design-system
description: 이 프로젝트의 디자인 시스템(Dell 1996 카탈로그 스타일) 규칙을 적용해 UI를 만들거나 고친다. 색상·폰트·간격·radius·컴포넌트 스타일을 정하거나 바꿀 때, 새 컴포넌트를 만들 때, className/CSS/Tailwind 클래스를 수정할 때, 화면을 리스킨할 때 사용한다. "스타일", "디자인", "색상/폰트/간격", "컴포넌트 만들어", "버튼/카드 스타일", "리스킨", "design system", "theme/token" 같은 요청 전반에 해당한다. docs/design-system/ 의 세분화된 문서 중 작업에 필요한 것만 골라 읽도록 라우팅한다.
---

# Design System (Dell 1996 카탈로그 스타일)

이 프로젝트의 모든 스타일 작업은 `docs/design-system/`에 정의된 규칙을 따른다. 이 스킬은
**작업에 필요한 문서만 골라 읽게 하는 라우터**다 — 전체를 다 읽지 말고 아래 표대로 최소
파일만 로드한다.

## 0. 가장 먼저 — 값은 항상 tokens.css

토큰의 **값(hex·폰트·간격·radius)은 [`docs/design-system/tokens.css`](../../../docs/design-system/tokens.css)가 단일 원천(SSOT)**이다.
색·폰트·간격 값이 필요하면 **먼저 `tokens.css`를 읽는다.** 다른 md의 표는 설명용 미러일
뿐이며 값이 충돌하면 tokens.css가 이긴다.

## 1. 핵심 Do/Don't 코어 (트리거 즉시 적용)

세부 문서를 읽기 전에도 이 가드레일은 무조건 지킨다.

### ✅ Do

- **검정 페이지 프레임**(`frame-ink`)을 페이지 컨테이너에 유지(모바일 축소만 허용).
- **radius는 0**(`rounded-none`)이 기본. 둥근 건 원형 award 씰(`rounded-full`)만.
- **본문은 Times Roman**(`--font-serif`), 디스플레이는 Arial Black 900(`--font-display`),
  UI/버튼은 Helvetica Bold(`--font-sans`).
- 깊이는 **하드 1px 보더 또는 하드엣지 베벨**로만 표현.
- 색은 `tokens.css`에 정의된 폐쇄형 팔레트 안에서만.

### ❌ Don't

- **Dell red(`primary`)를 CTA 패널·전화번호·award 씰 외에 쓰지 않는다.**
- **모서리를 둥글리지 않는다**(award 씰 제외).
- **소프트 드롭섀도·그라데이션을 쓰지 않는다**(`shadow-md/lg`, `bg-gradient`, blur 섀도).
- **본문을 모던 sans/웹폰트로 바꾸지 않는다.**
- 팔레트 밖 색(임의 hex)을 도입하지 않는다.

## 2. 라우팅표 — 작업별로 읽을 파일

| 작업                              | 읽을 파일 (tokens.css는 항상 우선)                                 |
| --------------------------------- | ------------------------------------------------------------------ |
| 색상 선택/변경                    | `tokens.css` + `colors.md`                                         |
| 폰트·타입 크기·굵기               | `tokens.css` + `typography.md`                                     |
| 간격·그리드·반응형·radius·깊이    | `tokens.css` + `layout.md`                                         |
| 프레임·배너·eyebrow·리본카드·푸터 | `tokens.css` + `components/structure.md`                           |
| CTA·전화번호·인풋·버튼            | `tokens.css` + `components/controls.md`                            |
| 스티커·아이콘 내비                | `tokens.css` + `components/decoration.md`                          |
| 새 컴포넌트 제작(처음부터)        | `tokens.css` + 해당 `components/*` + `colors.md` + `typography.md` |
| 전체 리스킨·디자인 점검           | `README.md`(인덱스) → 필요한 하위 문서 순서대로                    |

경로 기준: 모두 `docs/design-system/` 아래. 예) `components/controls.md` =
`docs/design-system/components/controls.md`.

## 3. 작업 절차

1. 요청을 보고 위 라우팅표에서 해당 행을 고른다.
2. `tokens.css`를 먼저 읽어 토큰명·값을 확보한다.
3. 해당 문서를 읽어 컴포넌트 규격(배경/텍스트/보더/타이포/패딩/radius)과 Do/Don't를 본다.
4. **하드코딩 값 대신 토큰을 사용**해 구현한다(예: `bg-frame-ink`, `text-primary`,
   `font-serif`, `rounded-none`). Tailwind v4에서 `tokens.css`의 `@theme` 변수는
   `bg-*`/`text-*`/`border-*` 유틸로 자동 노출된다.
5. 편집 후 `check-design-system` 훅이 위반(둥근 radius·소프트 섀도·그라데이션·팔레트 밖
   hex)을 리포트하면 토큰 기반으로 고친다.

## 4. 현재 코드와의 관계 (주의)

현재 `src/index.css`의 `@theme`(Pretendard/Boogaloo/라이트 그레이)와 컴포넌트 코드는
**아직 Dell 1996 기준으로 교체되지 않았다.** 따라서:

- 기존 코드에는 `rounded-3xl`·`shadow-[…]` 등 위반이 많다. 훅은 이를 **경고만** 하고
  차단하지 않는다(advisory).
- 새 작업은 이 디자인 시스템 기준으로 만들되, 기존 코드 대량 리스킨은 사용자가 명시적으로
  요청할 때만 진행한다(스타일 토큰 교체는 별도 작업).

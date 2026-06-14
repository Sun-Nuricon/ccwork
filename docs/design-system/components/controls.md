# 컴포넌트 — 컨트롤 (Controls)

> [디자인 시스템 README](../README.md)의 하위 문서. 토큰 **값의 권위는
> [`tokens.css`](../tokens.css)** 이며, 아래 표는 토큰명으로 참조한다(값은 tokens.css).
> 타이포는 [typography.md](../typography.md), 색은 [colors.md](../colors.md) 참조.
>
> CTA·입력·버튼 등 사용자 액션을 유도/수신하는 컴포넌트. **hover 상태는 문서화하지
> 않는다**(전역 no-hover 정책). 아래는 모두 Default 상태.

## `cta-block-red` — 홈의 빨강 패널

"At Dell.com, we'll help you find the right system…"
| 속성 | 토큰 |
| --- | --- |
| 배경 | `primary` (Dell red) |
| 텍스트 | `on-primary` |
| 보더 | `1px solid frame-ink` |
| 타이포 | `body` (Times Roman 14) |
| 패딩 | `lg` (16px) |
| radius | `none` |

**페이지당 최대 1개.** 브랜드의 가장 공격적인 주목 장치 — 최상위 세일즈 메시지 외엔 금지.

## `phone-callout` — 우상단 전화번호

"1-800-213-DELL", 검정 배너 위 빨강. 모든 페이지 상단 배너 우측에 고정.
| 속성 | 토큰 |
| --- | --- |
| 배경 | `frame-ink` |
| 텍스트 | `primary` |
| 타이포 | `heading-2` (Helvetica Bold 16) |
| 패딩 | `xs` 세로 / `sm` 가로 |
| radius | `none` |

## `text-input` — 보더 HTML 인풋

| 배경     | 텍스트 | 보더                  | 타이포 | 패딩     | radius |
| -------- | ------ | --------------------- | ------ | -------- | ------ |
| `canvas` | `ink`  | `1px solid frame-ink` | `body` | `xs`×`s` | `none` |

## `button-primary` — 검정 채움 버튼

| 배경        | 텍스트       | 보더                  | 타이포   | 패딩     | radius |
| ----------- | ------------ | --------------------- | -------- | -------- | ------ |
| `frame-ink` | `on-primary` | `1px solid frame-ink` | `button` | `s`×`lg` | `none` |

## `button-secondary` — 흰 채움 아웃라인 버튼

| 배경     | 텍스트 | 보더                  | 타이포   | 패딩     | radius |
| -------- | ------ | --------------------- | -------- | -------- | ------ |
| `canvas` | `ink`  | `1px solid frame-ink` | `button` | `s`×`lg` | `none` |

## `button-text-link` — 밑줄 앵커

| 텍스트 | 타이포                  | 기타                        |
| ------ | ----------------------- | --------------------------- |
| `link` | `body` (Times Roman 14) | 기본 밑줄, 패딩·radius 없음 |

## Do / Don't

### ✅ Do

- **Dell red(`primary`)는 `cta-block-red`와 `phone-callout` 두 곳에만** 쓴다.
- 모든 버튼·인풋을 `rounded-none`으로.
- 버튼 라벨·UI 텍스트는 Helvetica Bold 대문자(`button`/`ui-label`).
- 인라인 링크는 `link`(#0000ee)에 밑줄 — 클래식 블루 유지.

### ❌ Don't

- **CTA red 패널(`cta-block-red`)을 한 페이지에 2개 두지 않는다.**
- **상단 전화번호(`phone-callout`)를 제거하지 않는다** — 전화번호가 곧 내비게이션.
- 버튼을 둥근 모서리·소프트 섀도로 만들지 않는다.
- Dell red를 버튼·장식 등 위 두 곳 밖에 쓰지 않는다.

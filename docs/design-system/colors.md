# 색상 (Colors)

> [디자인 시스템 README](./README.md)의 하위 문서. 팔레트는 **폐쇄형(closed)** 이다 —
> 아래 정의된 색 외에는 도입하지 않는다.
>
> **값의 권위는 [`tokens.css`](./tokens.css)** 다. 아래 hex 표는 가독용 미러이며,
> 충돌 시 tokens.css가 이긴다.

## 1. Brand & Accent

| 이름                               | Hex       | 용도                                                                                                              |
| ---------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| **Dell Red** (`primary`)           | `#e91d2a` | 브랜드 시그니처 빨강. 홈 CTA 패널 + 우상단 전화번호 + PC Magazine 씰 링. **카드 본문 배경으로는 절대 사용 금지.** |
| **Dell Yellow** (`yellow-sticker`) | `#fcc20f` | 스티커 노랑. "BUY a DELL" 탭, 비스듬한 "NEW!" 버스트.                                                             |
| **Dell Purple** (`purple-stripe`)  | `#6a26a4` | "BUY a DELL" 스티커 안의 ".com"/"DELL" 워드마크 뒤 액센트 스트라이프 전용.                                        |

## 2. Surface (서피스)

| 이름                        | Hex       | 용도                                                                             |
| --------------------------- | --------- | -------------------------------------------------------------------------------- |
| **Frame Ink** (`frame-ink`) | `#000000` | 순수 검정. 페이지 프레임, 상단 배너 배경, 버튼 채움, 모든 1px 리본카드 헤어라인. |
| **Canvas** (`canvas`)       | `#ffffff` | 프레임 안의 진짜 흰색. 페이지 표면, 리본카드 타이틀바 채움, 아이콘 내비 배경.    |

## 3. Text (텍스트)

| 이름              | Hex       | 용도                                                                                           |
| ----------------- | --------- | ---------------------------------------------------------------------------------------------- |
| **Ink** (`ink`)   | `#000000` | 본문·헤딩·방문 전 링크. 순수 검정 — 1996년엔 따뜻한 근사검정 보정이 없다.                      |
| **Link** (`link`) | `#0000ee` | 클래식 Mosaic/Netscape 3.x 기본 링크 블루. 밑줄 인라인 앵커("Copyright", "(Terms of Use)" 등). |

## 4. Ribbon-Card Tint Family (리본카드 8색 틴트)

제품군마다 1색씩 — 이 페이지의 색채 개성. 채도는 높되 선명하지 않고, 진짜 중성 채도보다
살짝 아래 — GIF 시대 web-safe 팔레트 양자화의 시그니처.

| 이름                               | Hex       | 쓰이는 제품군                                       |
| ---------------------------------- | --------- | --------------------------------------------------- |
| **Olive** (`tint-olive`)           | `#8e8a25` | "DIMENSION DESKTOPS" eyebrow 블록                   |
| **Sage** (`tint-sage`)             | `#b3bd95` | Latitude Notebooks 리본 바디                        |
| **Salmon** (`tint-salmon`)         | `#d77a7a` | "OPTIPLEX DESKTOP SYSTEMS" eyebrow + GX Series 바디 |
| **Peach** (`tint-peach`)           | `#e6915d` | Dimension 카드 바디 + OptiPlex Gs 바디              |
| **Lime** (`tint-lime`)             | `#c0d4a7` | OptiPlex G Series 바디                              |
| **Sky** (`tint-sky`)               | `#9ab6c8` | Dellware 리본 바디                                  |
| **Steel** (`tint-steel`)           | `#a5b8c0` | Dimension XPS Pro 리본 바디                         |
| **Periwinkle** (`tint-periwinkle`) | `#8c9ae0` | PowerEdge 서버 리본 바디                            |

## 5. Tailwind `@theme` 매핑

스펙의 추상 토큰(`{colors.*}`)을 실제 Tailwind v4 CSS 변수명으로 매핑한다. "현재 상태"
열은 `src/index.css`의 현 `@theme` 기준이다.

| 추상 토큰                  | CSS 변수                  | 값        | 현재 상태                                             |
| -------------------------- | ------------------------- | --------- | ----------------------------------------------------- |
| `{colors.primary}`         | `--color-primary`         | `#e91d2a` | 신규 추가                                             |
| `{colors.on-primary}`      | `--color-on-primary`      | `#ffffff` | 신규 추가                                             |
| `{colors.yellow-sticker}`  | `--color-yellow-sticker`  | `#fcc20f` | 신규 추가                                             |
| `{colors.purple-stripe}`   | `--color-purple-stripe`   | `#6a26a4` | 신규 추가                                             |
| `{colors.frame-ink}`       | `--color-frame-ink`       | `#000000` | 신규 추가                                             |
| `{colors.canvas}`          | `--color-canvas`          | `#ffffff` | 신규 추가 (현 `--color-card`와 의미 중복 → 정리 대상) |
| `{colors.ink}`             | `--color-ink`             | `#000000` | 신규 추가 (현 `--color-foreground` 교체 대상)         |
| `{colors.link}`            | `--color-link`            | `#0000ee` | 신규 추가                                             |
| `{colors.tint-olive}`      | `--color-tint-olive`      | `#8e8a25` | 신규 추가                                             |
| `{colors.tint-sage}`       | `--color-tint-sage`       | `#b3bd95` | 신규 추가                                             |
| `{colors.tint-salmon}`     | `--color-tint-salmon`     | `#d77a7a` | 신규 추가                                             |
| `{colors.tint-peach}`      | `--color-tint-peach`      | `#e6915d` | 신규 추가                                             |
| `{colors.tint-lime}`       | `--color-tint-lime`       | `#c0d4a7` | 신규 추가                                             |
| `{colors.tint-sky}`        | `--color-tint-sky`        | `#9ab6c8` | 신규 추가                                             |
| `{colors.tint-steel}`      | `--color-tint-steel`      | `#a5b8c0` | 신규 추가                                             |
| `{colors.tint-periwinkle}` | `--color-tint-periwinkle` | `#8c9ae0` | 신규 추가                                             |

> Tailwind v4에서 `--color-primary`를 `@theme`에 선언하면 `bg-primary`, `text-primary`,
> `border-primary` 유틸이 자동 생성된다. 틴트도 `bg-tint-sage` 식으로 바로 쓸 수 있다.

**현재 `@theme`에서 교체/정리 대상:**
`--color-background`(라이트 그레이), `--color-foreground`(다크 블루그레이),
`--color-muted` 계열, `--color-destructive` 는 Dell 1996 팔레트와 충돌한다. 실제 교체는
별도 구현 작업으로 진행한다(이 문서는 기준만 정의).

## Do / Don't

### ✅ Do

- **Dell red(`primary`)는 CTA 패널과 전화번호 두 곳에만 쓴다.**
- **8색 틴트를 제품군별 1색으로 고정**하고 그 라인 전체에서 일관 유지한다.
- 검정은 `frame-ink`, 흰색은 `canvas`로 의미를 구분해 쓴다.
- 인라인 링크는 `#0000ee`에 밑줄 — 클래식 블루를 그대로 둔다.

### ❌ Don't

- **8색 틴트 + Dell red/yellow/purple + 링크 블루 + 검정/흰색 밖의 색을 도입하지 않는다.**
- **카드 본문 배경에 Dell red를 쓰지 않는다.** (red는 긴급 신호 전용)
- 틴트를 그라데이션·투명도와 섞지 않는다 — 항상 플랫 채움.
- 텍스트에 따뜻한 근사검정(예: `#1a1a1a`)을 쓰지 않는다 — 순수 `#000`.

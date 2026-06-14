# 타이포그래피 (Typography)

> [디자인 시스템 README](./README.md)의 하위 문서. 웹폰트는 쓰지 않는다 — 1996년엔
> 웹폰트가 존재하지 않았다. 세 가지 시스템 폰트 스택만 사용한다.
>
> **값의 권위는 [`tokens.css`](./tokens.css)** 다. 아래 표는 가독용 미러이며,
> 충돌 시 tokens.css가 이긴다.

## 폰트 패밀리 (3종)

| 패밀리              | 폴백                      | 역할                                                                                                                                            |
| ------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Arial Black**     | Helvetica, system-ui sans | 디스플레이 헤딩 **전용**. 청키한 스텐실풍 섹션 eyebrow("DIMENSION DESKTOPS", "OPTIPLEX DESKTOP SYSTEMS"). weight 900, 전부 대문자, 일반 트래킹. |
| **Helvetica**       | Arial, system-ui sans     | 제품 행 타이틀, 버튼 라벨, 상단 배너 헤드라인. 항상 Bold(700), 항상 대문자.                                                                     |
| **Times New Roman** | Times, serif              | 본문 전체. 모든 문단·캡션·인라인 앵커. serif가 디자인 시대를 즉시 드러낸다 — 현대 웹 본문은 거의 serif가 아니다.                                |

> **폰트 대체 주의:** 세 패밀리 모두 1996년 출하 소비자 OS의 기본 폰트다(Windows 95:
> Arial/Times New Roman, Mac OS 7.5+: Helvetica/Times). 당시엔 폴백 전략이 불필요했다.
> 현대 재현도 이 스택(Arial Black / Helvetica / Times New Roman) 그대로 두는 게 정통.

## 타입 계층

| 토큰        | 크기 | 굵기 | 행간 | 용도                                        |
| ----------- | ---- | ---- | ---- | ------------------------------------------- |
| `display`   | 36px | 900  | 1.0  | 섹션 eyebrow 타이틀("DIMENSION DESKTOPS")   |
| `heading-1` | 24px | 900  | 1.05 | 서브페이지 히어로 헤드라인                  |
| `heading-2` | 16px | 700  | 1.2  | 상단 배너 카피, 제품라인 H1                 |
| `heading-3` | 14px | 700  | 1.2  | 리본카드 타이틀바("OPTIPLEX GX PRO")        |
| `body`      | 14px | 400  | 1.4  | 기본 문단, 리본카드 본문, CTA 패널 카피     |
| `body-sm`   | 12px | 400  | 1.4  | "best viewed with browser 3.0+" 류 안내     |
| `caption`   | 11px | 400  | 1.35 | 푸터 저작권 텍스트                          |
| `button`    | 12px | 700  | 1.0  | 버튼 라벨, "NEW!" 스티커, BUY-a-DELL 스티커 |
| `ui-label`  | 12px | 700  | 1.0  | 아이콘 내비 대문자 라벨("FIND", "HOME" …)   |

## Tailwind `@theme` 매핑

| 추상 토큰                | 폰트 변수                      | 크기/굵기 유틸 조합                   | 현재 상태                                      |
| ------------------------ | ------------------------------ | ------------------------------------- | ---------------------------------------------- |
| `{typography.display}`   | `--font-display` (Arial Black) | `text-[36px] font-black leading-none` | `--font-display` 현재 Boogaloo → **교체 대상** |
| `{typography.heading-1}` | `--font-display`               | `text-2xl font-black leading-[1.05]`  | 교체 대상                                      |
| `{typography.heading-2}` | `--font-sans` (Helvetica)      | `text-base font-bold uppercase`       | `--font-sans` 현재 Pretendard → **교체 대상**  |
| `{typography.heading-3}` | `--font-sans`                  | `text-sm font-bold uppercase`         | 교체 대상                                      |
| `{typography.body}`      | `--font-serif` (Times)         | `text-sm font-normal leading-[1.4]`   | `--font-serif` **신규 추가**                   |
| `{typography.body-sm}`   | `--font-serif`                 | `text-xs leading-[1.4]`               | 신규 추가                                      |
| `{typography.caption}`   | `--font-serif`                 | `text-[11px] leading-[1.35]`          | 신규 추가                                      |
| `{typography.button}`    | `--font-sans`                  | `text-xs font-bold`                   | 교체 대상                                      |
| `{typography.ui-label}`  | `--font-sans`                  | `text-xs font-bold uppercase`         | 교체 대상                                      |

권장 `@theme` 선언(구현 시):

```css
@theme {
  --font-display: 'Arial Black', Helvetica, system-ui, sans-serif; /* 교체 */
  --font-sans: 'Helvetica', Arial, system-ui, sans-serif; /* 교체 */
  --font-serif: 'Times New Roman', Times, serif; /* 신규 */
}
```

## 원칙

- **UI는 sans, 본문은 serif** — 현대 관습의 정반대이자 90년대 중반 타이포의 결정적 단서.
- **디스플레이 굵기는 극단(900/Black)** 으로만. eyebrow 블록은 폰트가 제공하는 최대 굵기.
- **트래킹(letter-spacing) 조정 없음** — 1996년 픽셀 폰트는 트래킹 이득이 없었다. 전부
  브라우저 기본 커닝.
- **행간은 디스플레이에서 타이트(1.0), 본문에서 관습적(1.4)** — 인쇄 카탈로그 레이아웃의 유산.

## Do / Don't

### ✅ Do

- **본문은 Times New Roman 14px(`body`) 유지.**
- **디스플레이 헤드라인은 Arial Black, weight 900, 전부 대문자.**
- UI 라벨·버튼은 Helvetica Bold 대문자로 통일한다.
- 행간은 위 표 값 그대로 — 디스플레이 1.0, 본문 1.4.

### ❌ Don't

- **본문을 Arial/Helvetica/Inter/웹폰트로 바꾸지 않는다.** serif 본문이 시그니처.
- **디스플레이를 900보다 가벼운 굵기로 쓰지 않는다.**
- letter-spacing 트래킹을 임의로 넣지 않는다.
- 웹폰트(@font-face / Google Fonts)를 추가하지 않는다 — 시스템 스택만.

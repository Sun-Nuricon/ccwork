# 컴포넌트 — 구조 (Structure)

> [디자인 시스템 README](../README.md)의 하위 문서. 토큰 **값의 권위는
> [`tokens.css`](../tokens.css)** 이며, 아래 표는 토큰명으로 참조한다(값은 tokens.css).
> 타이포는 [typography.md](../typography.md), 색은 [colors.md](../colors.md) 참조.
>
> 페이지의 골격을 이루는 컨테이너·레이아웃 컴포넌트. **hover 상태는 문서화하지 않는다**
> (전역 no-hover 정책). 아래는 모두 Default 상태.

## `page-frame` — 페이지 전체를 감싸는 검정 액자

| 속성   | 토큰                |
| ------ | ------------------- |
| 배경   | `frame-ink`         |
| 패딩   | `sm` (8px, 모든 변) |
| radius | `none`              |

페이지는 이 보더 **안쪽**에 들어간다. 협상 불가의 컨테이너 크롬. 모바일에서 ~4px로
줄이는 건 허용, **완전 제거는 브랜드 상실.**

## `top-banner` — 상단 검정 스트립

흰색 "BUILD YOUR OWN COMPUTER. ONLINE." 헤드라인 + 서브 태그라인, 우측에 노란
"BUY a DELL" 스티커, 빨강 "1-800-213-DELL" 전화번호.
| 속성 | 토큰 |
| --- | --- |
| 배경 | `frame-ink` |
| 텍스트 | `canvas` |
| 타이포 | `heading-2` (Helvetica Bold 16) |
| 패딩 | `md` 세로 / `lg` 가로 |
| radius | `none` |

> 우측 스티커는 [decoration.md](./decoration.md), 전화번호는 [controls.md](./controls.md).

## `section-eyebrow-<tint>` — 섹션 타이틀을 담은 틴트 색 블록

청키 스텐실 섹션 타이틀. 예: `-olive`("DIMENSION DESKTOPS"),
`-salmon`("OPTIPLEX DESKTOP SYSTEMS").
| 속성 | 토큰 |
| --- | --- |
| 배경 | 해당 틴트(`tint-olive` / `tint-salmon` …) |
| 텍스트 | `ink` |
| 타이포 | `display` (Arial Black 36 / 900, 대문자) |
| 패딩 | `xxl` 세로 / `lg` 가로 |
| radius | `none` |

## 리본카드 (Ribbon Cards) — 브랜드 시그니처

각 제품 행 "카드"는 3조각 스택:

1. **`ribbon-card-title`** — 흰 가로 타이틀바. 제품 변형명을 Helvetica Bold 대문자로
   (예: "OPTIPLEX GX PRO"). 하단 1px `frame-ink` 보더.
   | 속성 | 토큰 |
   | --- | --- |
   | 배경 | `canvas` |
   | 텍스트 | `ink` |
   | 타이포 | `heading-3` (14/700) |
   | 패딩 | `s` 세로 / `md` 가로 |
   | radius | `none` |

2. **`ribbon-card-body-<tint>`** — 8색 틴트 중 하나로 칠한 본문 블록. 짧은 마케팅
   카피를 `body`(Times Roman 14)로. 우측 가장자리에 제품 사진 GIF 노치.
   | 변형 | 채움색 | 제품군 |
   | --- | --- | --- |
   | `-sage` | `tint-sage` | Latitude Notebooks |
   | `-salmon` | `tint-salmon` | OptiPlex GX Series |
   | `-peach` | `tint-peach` | Dimension / OptiPlex Gs |
   | `-lime` | `tint-lime` | OptiPlex G Series |
   | `-sky` | `tint-sky` | Dellware |
   | `-steel` | `tint-steel` | Dimension XPS Pro |
   | `-periwinkle` | `tint-periwinkle` | PowerEdge Servers |

   공통 크롬: `1px solid frame-ink` 보더, 패딩 `md`×`lg`(12×16), `none` radius, 내부
   `body`(Times Roman 14). **채움색만 제품군별로 바뀐다.**

3. **Photo notch** — GIF가 행 우측 ~25%에 위치, 본문 바 위아래로 살짝 걸쳐 코르크보드에
   핀으로 꽂힌 카드처럼 보이게.

## `footer-band` — 모든 페이지 하단

아이콘 내비 행 + 클래식 블루 Copyright 링크 + "(Terms of Use)" + 브라우저 호환 안내 +
Microsoft BackOffice / IE 로고 배너.
| 속성 | 토큰 |
| --- | --- |
| 배경 | `canvas` |
| 텍스트 | `ink` |
| 보더 | 상단 `1px frame-ink` |
| 타이포 | `body-sm` |
| 패딩 | `lg` (16px) |

> 내부 아이콘 내비(`icon-label-nav`)는 [decoration.md](./decoration.md).

## Do / Don't

### ✅ Do

- **리본카드는 흰 타이틀바 + 틴트 바디 + 우측 포토노치 3단 구조를 유지**한다.
- 검정 페이지 프레임을 모든 페이지에 유지(모바일 축소만 허용).
- 깊이는 1px 보더 또는 하드엣지 베벨로만.
- 모든 구조 컨테이너를 `rounded-none`으로.

### ❌ Don't

- **페이지 프레임을 완전히 제거하지 않는다.**
- **제품 사진을 `border-radius`/`clip-path`로 자르거나 끼워넣지 않는다** — 노치가
  프레이밍, 사진은 하드 직사각형.
- 리본카드 본문에 8색 틴트 외의 색을 쓰지 않는다.
- 컨테이너에 소프트 드롭섀도·그라데이션을 넣지 않는다.

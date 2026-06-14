# 컴포넌트 — 장식 & 크롬 (Decoration)

> [디자인 시스템 README](../README.md)의 하위 문서. 토큰 **값의 권위는
> [`tokens.css`](../tokens.css)** 이며, 아래 표는 토큰명으로 참조한다(값은 tokens.css).
> 타이포는 [typography.md](../typography.md), 색은 [colors.md](../colors.md) 참조.
>
> GIF 스티커·아이콘 내비 등 장식/크롬 요소. **hover 상태는 문서화하지 않는다**
> (전역 no-hover 정책). 아래는 모두 Default 상태.

## 스티커 (GIF 스타일 오버레이)

### `buy-a-dell-sticker` — 노란 사각 스티커

"BUY a DELL"(Helvetica Bold), "a"는 작은 보라 스트라이프(`purple-stripe`), "DELL"은
검정 워드마크. 모든 페이지 상단 우측에 고정.
| 속성 | 토큰 |
| --- | --- |
| 배경 | `yellow-sticker` |
| 텍스트 | `ink` |
| 보더 | `1px frame-ink` |
| 타이포 | `button` (12/700) |
| 패딩 | `xs`×`sm` / radius `none` |

### `new-burst-sticker` — 비스듬한 노란 버스트

"NEW!"(Helvetica Bold 검정), 새 제품 리본카드 우측에 겹침. ~15° 회전으로 테이프로
붙인 느낌.
| 속성 | 토큰 |
| --- | --- |
| 배경 | `yellow-sticker` |
| 텍스트 | `ink` |
| 타이포 | `button` |
| 패딩 | `xs`×`sm` / radius `none` (회전 별도 적용) |

### `cert-seal` — 둥근 빨강 award 씰

중앙 "PC MAGAZINE", 링에 "SERVICE · RELIABILITY · READERS' CHOICE", 안쪽 흰 필드 +
빨강 링.
| 속성 | 토큰 |
| --- | --- |
| 배경 | `primary` |
| 텍스트 | `canvas` |
| 타이포 | `button` |
| radius | `full` / 크기 64px |

> `cert-seal`은 Dell red(`primary`)가 허용되는 예외 중 하나(씰 링). CTA·전화번호 외
> red 사용 금지 규칙의 명시적 예외임에 유의.

## 내비게이션

### `icon-label-nav` — 하단 아이콘 내비 행

손그림 아이콘 4개(eyeglasses-FIND / house-HOME / yellow-sticker-ONLINE STORE /
wrench-SERVICE & SUPPORT)를 얇은 초록 가로선이 연결, 각 아이콘 아래 대문자 Helvetica 라벨.
| 속성 | 토큰 |
| --- | --- |
| 배경 | `canvas` |
| 텍스트 | `ink` |
| 타이포 | `ui-label` (12/700 대문자) |
| 패딩 | 각 아이콘-라벨 쌍 주위 `sm`(8px) / radius `none` |

연결하는 초록 선은 CSS 보더가 아니라 GIF 이미지의 일부다. (모바일 터치 타깃은 최소
44×44px로 확대 — [layout.md](../layout.md) 참조.)

## 부록 — Examples (`ex-*`)

원본 스펙의 `ex-*` 항목(`ex-pricing-tier`, `ex-cart-drawer`, `ex-modal-card` 등)은
디자인 킷 미러용 데모 surface로, **이 프로젝트(노트 앱) 구현 범위 밖**이다. 필요 시
brand-native 컴포넌트(리본카드 크롬, `text-input`)를 재활용해 파생한다.

## Do / Don't

### ✅ Do

- 스티커·제품 사진엔 **하드엣지 베벨/GIF 섀도**를 쓴다.
- 모든 스티커 사각 크롬은 `rounded-none`, award 씰만 `rounded-full`.
- 스티커 색은 `yellow-sticker`(+ `purple-stripe` 액센트)로 고정.

### ❌ Don't

- **스티커에 소프트 CSS 섀도를 쓰지 않는다** — 하드엣지 베벨만.
- award 씰을 제외하고 어떤 요소도 둥글리지 않는다.
- `cert-seal` 외의 장식에 Dell red를 쓰지 않는다.
- 아이콘 내비 연결선을 임의 색/스타일로 바꾸지 않는다(원본 GIF 초록선 유지).

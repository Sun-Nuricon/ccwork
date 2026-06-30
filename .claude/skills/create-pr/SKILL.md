---
name: create-pr
description: 현재 브랜치의 변경을 요약해 PR 초안(제목·본문)을 만들고, 개발자 승인을 받은 뒤 npm run test:e2e를 게이트로 돌려 통과해야만 git push + gh pr create로 PR을 올리는 스킬. E2E가 실패하면 PR 생성을 중단하고 근본 원인 분석 절차(Trace Viewer → 레이어 판별 → 단위 테스트 Red → 프로덕션 Green)를 안내하며, **E2E 코드를 고쳐 통과시키는 우회는 금지**한다. "PR 만들어줘", "PR 올려줘", "PR 보내줘", "이거 머지하자", "create-pr" 같은 요청이면 사용자가 스킬명을 말하지 않아도 이 스킬을 쓴다. `/create-pr` 형태로 명시 호출한다. 단순 커밋만 원하거나 아직 변경을 더 해야 하는 상황에는 쓰지 않는다.
---

# Create PR

현재 브랜치의 변경을 **PR로 올리는 마지막 게이트**. 흐름은 고정이다:
초안 작성 → **승인 게이트** → `npm run test:e2e` → (통과 시) push + PR 생성.
E2E가 빨가면 멈추고 근본 원인 분석을 안내한다 — **테스트를 고쳐 넘기지 않는다.**

> **이 스킬의 본질**: PR은 "초록 게이트를 통과한 변경"만 올린다. E2E 실패는 회피 대상이
> 아니라 **수정해야 할 신호**다. 그래서 실패 시 PR을 만들지 않고, 어디서 깨졌는지
> 짚어주고 TDD(Red→Green)로 닫게 안내한다.

## 입력

- 인자 없음이 기본. (선택) base 브랜치를 인자로 받을 수 있다: `/create-pr main`.
- base를 안 주면 컨벤션으로 추론해 **초안에 제안하고 승인 단계에서 확인**받는다(아래).

## 절대 제약 (어기면 이 스킬의 의미가 사라진다)

1. **E2E 실패를 우회하지 않는다.** `e2e/*.spec.ts`를 느슨하게 고쳐서, 또는 단언을 빼서
   초록으로 만들지 않는다. 실패는 프로덕션 코드의 문제이거나 진짜 회귀다 — 근본 원인을
   고친다.
2. **승인 없이 PR을 만들지 않는다.** 초안(제목·본문·base)을 보여주고 개발자가 승인(또는
   수정 지시)할 때까지 멈춘다.
3. **E2E가 초록이 아니면 push·PR을 하지 않는다.** 게이트 실패 시 4단계 안내만 출력하고
   종료한다.
4. **테스트 파일·E2E를 통과 목적으로 수정하지 않는다.** 이 스킬은 커밋/푸시/PR과 초안
   작성만 한다. 코드 수정은 별도 TDD 사이클의 몫이다.

## Workflow

### 1. 컨텍스트 수집 + 초안 작성

- **base 브랜치 결정**: 인자가 있으면 그 값. 없으면 컨벤션으로 추론한다 —
  - 현재 브랜치가 `feature/<group>-<이슈>` 꼴이고 `feature/<group>-spec`이 존재하면
    그 spec 브랜치를 base로 제안(이 프로젝트의 "이슈→spec 통합" 규약, CLAUDE.md 7단계).
  - 그 외(예: 현재가 `feature/<group>-spec`)는 `main`을 제안.
  - 확신이 안 서면 `main`을 제안하되, 승인 단계에서 바꿀 수 있게 한다.
- **변경 요약**: base 기준 diff로 무엇이·왜 바뀌었는지 모은다.
  ```bash
  git fetch origin <base> --quiet
  git log --oneline origin/<base>..HEAD      # 이 브랜치의 커밋들
  git diff --stat origin/<base>...HEAD       # 파일별 변경 규모
  ```
- **미커밋 변경 확인**: `git status --porcelain`에 변경이 남아 있으면 PR에 안 들어간다.
  초안에 "커밋되지 않은 변경 N건"을 명시하고, 승인 단계에서 **함께 커밋할지**를 묻는다.
- **초안 생성** (아래 "PR 초안 형식"):
  - 제목: Conventional Commits 형(`feat: …`, `fix: …` 등). 브랜치의 주된 변경 성격을 따른다.
  - 본문: 요약 / 변경 사항 / 테스트 / 관련 이슈. 한국어.

### 2. 승인 게이트 (멈춤)

초안(제목·본문·**base 브랜치**·미커밋 변경 처리 방안)을 보여주고 **승인을 기다린다.**
개발자가 문구·base를 고치라고 하면 반영해 다시 보여준다. 명시 승인 전에는 다음으로 가지
않는다. 미커밋 변경을 "함께 커밋"하기로 했다면, 승인 직후 커밋한다(아래 커밋 규약).

### 3. E2E 게이트 — `npm run test:e2e`

승인되면 **먼저 E2E를 돌린다**(push 전).

```bash
npm run test:e2e
```

- **통과** → 5단계로.
- **실패** → 4단계(중단 + 안내)로. push·PR 절대 안 한다.

### 4. E2E 실패 시 — 중단하고 근본 원인 분석 안내

PR 생성을 **중단**하고 아래를 그대로 안내한다(이 스킬은 코드를 고치지 않는다 — 다음
사이클로 넘긴다).

> **E2E가 실패해 PR을 만들지 않았습니다. 우회하지 말고 근본 원인을 닫으세요.**
>
> ① **Trace Viewer로 실패 지점 확인** — `npx playwright show-report`
> (실패 테스트의 단계별 trace·스냅샷·`test-results/.../error-context.md`를 본다.)
> ② **어느 레이어에서 깨졌는지 판별**
>
> - **API**: json-server 요청/응답·영속성(POST/PATCH/GET) 문제 → `src/api/`, Context
> - **렌더링**: 화면에 안 보임·셀렉터 불일치 → 컴포넌트(`src/components/`)
> - **로직**: 파싱·분기·상태 계산 오류 → `src/lib/`, `src/hooks/`
>   ③ **해당 레이어 단위 테스트에 케이스 추가 (Red)** — `/tdd-red`로 실패하는 테스트부터.
>   (E2E가 잡아낸 통합 결함을, 그 결함이 사는 레이어의 단위 테스트로 좁혀 재현한다.)
>   ④ **프로덕션 코드 수정 (Green)** — `/tdd-green`로 통과시킨 뒤 **다시 `/create-pr`**.
>
> ⚠ **E2E 코드를 고쳐 통과시키는 것은 금지** — 근본 원인 회피다. 셀렉터/타이밍 같은
> "테스트 자체의 결함"이 확실할 때만 E2E를 손대고, 그때도 그 사실을 명시한다.

### 5. E2E 통과 시 — push + PR 생성

```bash
git push -u origin HEAD            # 현재 브랜치를 원격에 올림
gh pr create --base <base> --title "<제목>" --body-file <본문파일>
```

- **gh 선결 점검**: `gh` 미설치/미인증일 수 있다(이 환경엔 현재 `gh`가 없다). 먼저
  확인하고, 없으면 **push까지만 한 뒤** PR 생성용 compare URL을 출력해 수동 생성으로
  안내한다:
  - 점검: `gh --version` / `gh auth status` (PowerShell에서 `Get-Command gh`).
  - 미설치 시 안내: `winget install GitHub.cli` 후 `gh auth login`, 또는 아래 URL로 웹에서
    PR 작성 — `https://github.com/<owner>/<repo>/compare/<base>...<branch>?expand=1`
    (리모트 `git remote get-url origin`에서 owner/repo를 뽑는다).
- 생성 성공 시 **PR URL**을 보고한다.

## PR 초안 형식

제목은 Conventional Commits, 본문은 아래 골격(한국어). 본문은 commitlint 본문 규칙과
무관하지만, 리뷰어가 한눈에 보도록 **요약·변경·테스트**는 항상 채운다.

```
## 요약
<무엇을, 왜 바꿨는지 2~3줄>

## 변경 사항
- <핵심 변경 1>
- <핵심 변경 2>

## 테스트
- npm run test:e2e: <통과 결과 — 예: 3 passed>
- (해당 시) npm test: <단위 결과>

## 관련 이슈
- <이슈 번호/링크 또는 "없음">
```

## 프로젝트 컨벤션 (반드시 따른다)

- **한글 인코딩**: PowerShell 파이프(`|`)에서 한글이 깨진다. 커밋은 `git commit -F <파일>`,
  PR 본문은 `gh pr create --body-file <파일>`로 **파일을 통해 넘긴다**. 임시 파일은 쓰고
  나서 지운다.
- **커밋 메시지**: Conventional Commits + 추가 규칙 — 제목 `type: subject`, 제목과 본문
  사이 **빈 줄**, **본문 비어있지 않은 줄 최소 2줄**(commitlint `body-min-lines`). husky
  `commit-msg`가 검사하므로 어기면 커밋이 막힌다.
- **pre-commit**: lint-staged가 스테이징 파일에 `eslint --fix`+`prettier`를 돌린다. ESLint
  에러가 남으면 커밋이 롤백된다 — 커밋 전 깨끗한지 확인.
- **테스트 게이트는 E2E**: 이 스킬의 게이트는 `npm run test:e2e`다(요구사항). 단위
  테스트(`npm test`)도 통과 상태가 바람직하면 본문 "테스트"에 함께 적되, 게이트 판정은
  E2E로 한다.
- **base 컨벤션**: 이슈 브랜치는 `feature/<spec>`로, spec 브랜치는 `main`으로 PR한다
  (CLAUDE.md "TDD 이슈 사이클" 7단계: PR `--base feature/<spec>` → squash merge → 이슈 클로즈).

## 하지 않는 것 (범위 밖)

- **E2E/테스트 코드를 통과 목적으로 수정** — 절대. 근본 원인은 프로덕션 코드에서 고친다.
- **프로덕션 코드 수정·기능 구현** — `/tdd-red`·`/tdd-green`의 몫. 이 스킬은 PR만 만든다.
- **승인 없는 push/PR** — 초안 승인 게이트를 건너뛰지 않는다.
- **squash merge·이슈 클로즈** — PR 생성까지가 범위. 머지는 사람이 GitHub에서.
- **여러 브랜치 동시 PR** — 현재 브랜치 하나만.

## 도구 메모

- 변경 요약: `git log --oneline origin/<base>..HEAD`, `git diff --stat origin/<base>...HEAD`.
- E2E: `npm run test:e2e`. 실패 분석: `npx playwright show-report`(Trace/스냅샷),
  `test-results/<...>/error-context.md`(실패 시점 DOM).
- PR: `gh pr create --base <base> --title "<제목>" --body-file <파일>`. gh 없으면 push 후
  compare URL 안내.
- 리모트/소유자: `git remote get-url origin` → `https://github.com/<owner>/<repo>`.

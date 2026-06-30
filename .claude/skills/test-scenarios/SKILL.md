---
name: test-scenarios
description: 하나의 이슈(기능)에 대해 "시그니처 확정 → 테스트 시나리오 도출"을 순서대로 처리하는 스킬. 이슈 번호를 받아 docs/features/tag/issues.md의 해당 이슈 섹션을 소스로 ① 함수/Props 시그니처·에러 케이스를 확정해 docs/features/tag/issue-{N}.md 상단에 기록하고 ② 정상/경계/예외 테스트 시나리오를 도출해 하단에 추가하며 ③ 이슈의 AC 전수를 시나리오로 커버한다. 이후 TDD로 테스트 코드를 구현하기 위한 사전 단계다. `/test-scenarios <이슈번호>` 형태로 호출하며, "테스트 시나리오 만들어줘", "이 이슈 시그니처부터 잡자", "AC 기반 시나리오 도출", "TDD 들어가기 전 준비" 같은 요청이면 사용자가 스킬명을 명시하지 않아도 이 스킬을 사용한다. 구현 코드나 테스트 코드는 절대 작성하지 않는다.
---

# Test Scenarios

하나의 **이슈(= `issues.md`의 수직 슬라이스 기능 단위)**를 받아, 구현에 들어가기 전에
두 가지를 순서대로 확정한다.

1. **시그니처** — 함수 이름·파라미터·반환 타입, 에러 케이스, 컴포넌트 Props 타입.
2. **테스트 시나리오** — 그 시그니처를 정상/경계/예외로 분류해 도출한 테스트 항목.

산출물은 `docs/features/tag/issue-{N}.md` 한 파일이다(상단=시그니처, 하단=시나리오).
이후 별도 작업에서 이 파일을 기준으로 **TDD**(시나리오 → 실패하는 테스트 → 구현)를
진행한다.

> **핵심 제약**: 이 스킬은 **설계·문서화 단계**다. 구현 코드도, 테스트 코드도 **절대 쓰지
> 않는다**. 타입 시그니처와 자연어 시나리오까지만 만든다.

## 입력

- `$ARGUMENTS` = **이슈 번호** 하나 (예: `/test-scenarios 1` → `1`).
- 번호가 비어 있거나 숫자가 아니면 진행하지 말고 사용자에게 이슈 번호를 요청한다.
- 이 번호로 `docs/features/tag/issues.md`의 **`## 이슈 {N} — ...` 섹션**을 찾는다.
  해당 섹션이 없으면 진행하지 말고 어떤 이슈가 있는지 사용자에게 알린다.
- 이 번호를 아래 전 과정에서 `{N}`으로 쓴다(소스 섹션, 산출 파일명 `issue-{N}.md`).

## 승인 게이트 (이 스킬의 핵심)

진행 중 **두 번 멈춰서 사용자 승인**을 받는다. 승인 없이 다음 단계로 넘어가지 않는다.

- **게이트 1 (시그니처)**: 4단계 — 시그니처를 보여주고 검토/승인.
- **게이트 2 (시나리오)**: 11단계 — 시나리오를 보여주고 검토/승인.

각 게이트에서 사용자가 수정을 요구하면 반영 후 같은 게이트에서 다시 승인을 받는다.

## Workflow

### 1. 컨텍스트 수집

다음을 읽어 이슈가 무엇을 요구하는지, 어떤 기존 패턴에 얹혀야 하는지 파악한다.

- **이슈 본문**: `docs/features/tag/issues.md`의 `## 이슈 {N} — ...` 섹션 — 설명·산출물·
  완료조건(AC-{N}.x)을 읽는다. 이 파일이 **단일 소스**다(GitHub 이슈를 쓰지 않는다).
- **PRD / 스펙**: `docs/features/tag/prd.md` (ADR·용어), 있으면 `spec-fixed.md`.
- **코드베이스**: 이슈가 건드리는 파일과 그 주변 패턴. 보통 다음을 본다.
  - `src/types/note.ts` — 도메인 타입.
  - `src/api/notes.ts` — API 함수 시그니처 규약.
  - `src/context/NotesContext.tsx` — Context 액션 래핑 규약.
  - `src/components/*` — 컴포넌트 Props 패턴(`{ComponentName}Props` interface).

목적은 "이슈를 구현하려면 어떤 함수·타입·Props가 필요한가"를 정확히 파악하는 것이다.

### 2. 시그니처 확정

이슈가 요구하는 산출물의 **타입 시그니처**만 작성한다. **구현 본문은 쓰지 않는다.**
기존 프로젝트 패턴(아래)을 반드시 따른다.

확정 대상:

- **함수 시그니처** — 이름, 파라미터 타입, 반환 타입.
  - 비동기는 반환을 명시적으로 `Promise<...>`로 표기.
  - 입력은 도메인 타입으로 좁힌다(생성 `Omit<Note, 'id'|'createdAt'|'updatedAt'>`,
    수정 `Partial<Note>`).
  - 순수 함수(`src/lib/tags.ts`의 `parseTagInput(raw: string): string[]` 등)는
    React 비의존으로, 입출력 타입만 명확히.
- **에러 케이스** — 어떤 상황에서 무엇을 던지는지(throw)/어떻게 처리하는지.
  - API 레이어: `!res.ok`면 짧은 영문 메시지로 `throw new Error(...)`.
  - 검증 실패 등 비-throw 경로: 한국어 메시지로 `console.error`만(`alert` 금지).
- **컴포넌트 Props 타입** — `interface {ComponentName}Props { ... }`, named export 전제.
  콜백 prop은 `on + Verb`(`onAdd`, `onRemove`), 내부 핸들러는 `handle + Verb`.

작성 형식 — 실제 구현 없이 시그니처 블록으로:

```ts
// 순수 함수 (src/lib/tags.ts)
export function parseTagInput(raw: string): string[]; // trim·쉼표 분리·빈값 제거

// 커스텀 훅 (src/hooks/useTags.ts)
export function useTags(
  selectedNoteId: string | null,
  isCreating: boolean,
): { tags: string[]; addTag: (raw: string) => void };

// 컴포넌트 Props (src/components/TagInput.tsx)
interface TagInputProps {
  onAdd: (raw: string) => void;
}
```

> CRUD 동사는 `fetch/create/update/delete`로 통일하고 `add/edit/remove` 동의어를
> **새로 도입하지 않는다**(단, 이슈/PRD가 이미 `addTag`/`removeTag`처럼 도메인 동작
> 이름을 정의했다면 그 명칭을 따른다 — 충돌 시 PRD를 우선한다).

### 3. 게이트 1 — 시그니처 검토/승인

확정한 시그니처를 사용자에게 보여주고 **검토와 승인을 명시적으로 요청**한다.
사용자가 수정을 요구하면 반영하고 다시 승인을 받는다. **승인 전에는 4단계로 가지 않는다.**

### 4. 시그니처 기록

승인된 시그니처를 `docs/features/tag/issue-{N}.md`의 **상단**에 기록한다.
파일이 없으면 새로 만들고, 있으면 시그니처 섹션을 갱신한다(아래 "산출물 형식" 참고).

### 5. 테스트 시나리오 도출

확정된 시그니처를 기반으로 테스트 시나리오를 도출한다. **테스트 코드는 쓰지 않는다** —
자연어 항목만.

- 각 시나리오를 **정상 / 경계 / 예외** 중 하나로 분류한다.
  - **정상**: 의도된 일반 입력에서 기대 동작(happy path).
  - **경계**: 빈 값·공백·중복·앞뒤 공백·"a,b" 다중 분리처럼 경계 입력.
  - **예외**: 저장 실패(`updateNote` reject) 등 에러 경로.
- 형식을 고정한다:

  `[정상|경계|예외] 함수명 — should [기대동작] when [조건]`

  예:
  - `[정상] parseTagInput — should return ["react"] when input is "react"`
  - `[경계] parseTagInput — should split into ["a","b"] when input is "a,b"`
  - `[경계] addTags — should ignore duplicate when "react" already exists`
  - `[예외] useTags.addTag — should console.error and not throw when updateNote rejects`

- 시그니처의 각 함수/훅/컴포넌트가 최소한의 정상·경계·예외를 갖도록 빠짐없이 훑는다.

### 6. 시나리오 기록

도출한 시나리오를 `docs/features/tag/issue-{N}.md`의 **하단**에 추가한다(상단 시그니처는
유지). 분류(정상/경계/예외)별로 묶어 가독성을 높인다.

### 7. AC 대조 (커버리지 검증)

이슈의 **완료조건(AC)**을 시나리오가 전부 커버하는지 대조한다.

- `docs/features/tag/issues.md`의 `## 이슈 {N}` 섹션에서 AC 목록(AC-{N}.x)을 다시 읽는다.
- 각 AC를 시나리오와 매핑한다 — **모든 AC가 최소 1개 시나리오로 커버**되어야 한다.
- 커버되지 않은 AC가 있으면 해당 시나리오를 **추가**한다(5단계 형식 그대로).
- 매핑 결과를 표로 남겨, 어떤 시나리오가 어떤 AC를 덮는지 추적 가능하게 한다.

### 8. 게이트 2 — 시나리오 검토/승인

완성된 시나리오(+ AC 매핑)를 사용자에게 보여주고 **검토와 승인을 요청**한다.
수정 요구가 있으면 반영 후 다시 승인을 받는다. **승인을 받기 전까지 작업을 끝내지 않는다.**

승인되면 한 줄로 마무리 보고: 산출 파일 경로, 시그니처 항목 수, 시나리오 수,
AC 커버리지(예: `7/7 AC 커버`).

## 산출물 형식 — `docs/features/tag/issue-{N}.md`

상단=시그니처, 하단=시나리오 한 파일. 템플릿:

```markdown
# 이슈 {N} — {이슈 제목}

> `/test-scenarios {N}`로 생성. 시그니처 확정 → 테스트 시나리오 도출 단계 산출물.
> 구현 코드/테스트 코드는 포함하지 않는다(다음 단계: TDD).

## 확정 시그니처

​`ts
// (승인된 시그니처 블록)
​`

- **에러 케이스**: (어떤 상황에 무엇을 throw / console.error)

## 테스트 시나리오

### 정상

- [정상] ... — should ... when ...

### 경계

- [경계] ... — should ... when ...

### 예외

- [예외] ... — should ... when ...

## AC 커버리지

| AC     | 시나리오            |
| ------ | ------------------- |
| AC-x.1 | [정상] ... when ... |
| AC-x.2 | [경계] ... when ... |
```

## 하지 않는 것 (범위 밖)

- **구현 코드 작성** — 함수 본문, 컴포넌트 JSX, 훅 내부 로직 등. 시그니처까지만.
- **테스트 코드 작성** — `*.test.ts(x)`, `describe/it/expect`. 자연어 시나리오까지만.
- **이슈 본문 수정** — `issues.md`는 읽기만 한다(AC 대조용). 산출물은 `issue-{N}.md`.
- **여러 이슈 동시 처리** — 한 번에 이슈 1개. 다른 이슈는 다시 `/test-scenarios`로.

## 도구 메모

- 이슈/AC 소스: `docs/features/tag/issues.md`의 `## 이슈 {N}` 섹션(1·7단계에서 읽는다).
  GitHub `gh`에 의존하지 않는다 — AC도 이 파일에서 읽는다.
- 커밋 메시지에 한글이 들어가면 PowerShell 파이프 인코딩이 깨지므로
  `git commit -F <파일>`로 넘긴다(이 스킬이 커밋까지 하지는 않지만, 후속 단계 참고).

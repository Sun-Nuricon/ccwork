---
name: tdd-red
description: TDD의 RED 단계 — 승인된 테스트 시나리오를 "실패하는 테스트 코드"로 작성하는 스킬. 이슈 번호를 받아 docs/features/tag/issue-{N}.md의 시그니처와 시나리오를 읽고, 각 시나리오를 Vitest + React Testing Library 테스트로 한 건씩 옮긴 뒤 즉시 실행해 의도대로 실패하는지 확인하고, 마지막에 npm test로 전부 실패함을 검증한다. 테스트 파일만 만들고 src/ 구현 코드는 절대 건드리지 않는다. test-scenarios로 시나리오를 확정한 다음 단계이며, "실패하는 테스트부터 짜자", "RED 단계 들어가자", "이 이슈 TDD 테스트 코드 작성", "시나리오를 테스트로 옮겨줘", "issue-N의 테스트 만들어줘" 같은 요청이면 사용자가 스킬명을 말하지 않아도 이 스킬을 쓴다. `/tdd-red <이슈번호>` 형태로 호출한다. 구현은 GREEN 단계의 몫이므로 여기서는 절대 구현하지 않는다.
---

# TDD Red

승인된 테스트 시나리오(`docs/features/tag/issue-{N}.md`)를 **실패하는 테스트 코드**로
옮기는 스킬. TDD의 RED 단계만 담당한다. 구현(GREEN)·리팩터(REFACTOR)는 범위 밖이다.

입력은 이슈 번호 하나(`$ARGUMENTS`)다. 그 번호로 `issue-{N}.md`를 읽어, 거기 적힌
시그니처를 테스트의 import/호출 형태로 쓰고, "테스트 시나리오" 항목 하나를 `it(...)`
하나로 옮긴다.

> **이 스킬의 본질**: 시나리오는 이미 `should [기대동작] when [조건]` 형식으로 확정돼
> 있다. 새로 설계하지 말고 **충실히 코드로 옮기는 것**이 목표다. 시나리오에 없는
> 테스트를 지어내지 않는다.

## 입력

- `$ARGUMENTS` = **이슈 번호** 하나 (예: `/tdd-red 1` → `1`).
- 번호가 비어 있거나 숫자가 아니면 진행하지 말고 이슈 번호를 요청한다.
- `docs/features/tag/issue-{N}.md`가 없으면 진행하지 말고, 먼저 `/test-scenarios {N}`로
  시나리오를 확정해야 한다고 안내한다. **이 파일이 단일 소스**다.

## 절대 제약 (어기면 RED 단계가 깨진다)

1. **테스트 파일만 생성/수정한다.** `*.test.ts` / `*.test.tsx`만 만진다.
2. **`src/`의 구현 코드는 절대 수정·생성하지 않는다.** 테스트를 통과시키려고 타입을
   추가하거나(`Note.tags`), 컴포넌트·함수를 만들거나(`TagList.tsx`), 빈 스텁 파일을
   만들지 않는다. 그건 GREEN 단계의 몫이다.
3. **구현을 하지 않는다.** 테스트는 "아직 없는 동작"을 기대해야 한다. 지금 통과하는
   테스트를 쓰면 RED가 아니다.
4. **시나리오에 있는 것만 쓴다.** `issue-{N}.md`의 시나리오 = 테스트 목록. 누락도
   추가도 하지 않는다(시나리오 자체가 부족하면 멈추고 `/test-scenarios`로 돌려보낸다).

## "올바른 실패"란 무엇인가 (RED의 핵심)

테스트는 **의도한 이유로** 실패해야 한다. 이 프로젝트에서 첫 RED는 보통 대상 모듈·필드가
아직 없어서 발생한다.

- **좋은 RED** ✅
  - 대상 모듈이 없어 import가 깨짐 (`Cannot find module '../components/TagList'`)
    → Vitest가 그 파일의 테스트를 **collection error로 전부 실패** 처리. 정상이다.
  - 모듈은 있으나 기대한 동작이 아직 없어 `expect`가 깨짐.
  - 타입에 `tags`가 없어 타입상 미존재 → 런타임에서 `undefined` 관련 실패.
- **나쁜 RED** ❌ (반드시 고친다)
  - 오타·잘못된 import 경로·셀렉터 실수로 실패 — 시나리오와 무관한 실패.
  - `expect` 단언을 빠뜨려 "통과"로 잡히는 가짜 그린.

매 실행 후 **실패 메시지를 읽고**, 그 실패가 "구현이 없어서"인지 "테스트가 틀려서"인지
구분한다. 후자면 테스트를 고친다(`src/`는 여전히 건드리지 않는다).

## 테스트 파일 컨벤션

- **위치**: 테스트 대상 파일과 **같은 디렉토리**에 colocate.
  - `src/api/tags.ts` → `src/api/tags.test.ts`
  - `src/components/TagInput.tsx` → `src/components/TagInput.test.tsx`
  - `src/lib/tags.ts` → `src/lib/tags.test.ts`
- **네이밍**: `{파일명}.test.ts`(순수 로직) / `{파일명}.test.tsx`(JSX 렌더링).
  컴포넌트를 렌더하면 `.tsx`.
- **`describe` 블록**: **함수/컴포넌트 단위**로 묶는다. 시나리오의 `함수명 —` 접두사가
  곧 describe 이름이다.
  ```ts
  describe('TagList', () => {
    it('should render a chip for each tag in array order when tags is ["react", "study"]', () => { ... });
  });
  ```
- **`it` 이름 = 시나리오 문장 그대로**. `issue-{N}.md`의 `should … when …`를 분류 태그
  (`[정상]`)와 `함수명 —` 접두사만 떼고 **그대로** 옮긴다. 새 문장을 짓지 않는다.

## 작성 패턴 (이 프로젝트 기준)

- **테스트 러너**: Vitest 3, `globals: true` → `describe`/`it`/`expect`/`vi`를 **import 없이**
  쓴다 (`vite.config.ts`의 `test` 블록, `src/test-setup.ts` 참고).
- **컴포넌트 테스트**: React Testing Library.
  ```ts
  import { render, screen } from '@testing-library/react';
  // 상호작용이 필요하면:
  import userEvent from '@testing-library/user-event';
  ```
  jest-dom matcher(`toBeInTheDocument`, `toHaveTextContent` 등)는 `test-setup.ts`에서
  전역 등록돼 있으니 추가 import 불필요.
- **순수 함수 테스트**: 입력 → 출력만 단언. RTL 불필요.
- **셀렉터**: 역할/텍스트 기반(`getByRole`, `getByText`)을 우선한다. 시나리오가 "칩",
  "태그 영역"을 말하면 사용자가 보는 텍스트·역할로 찾는다.
- **비동기/에러 경로**(이슈 2 이후): API mock은 `vi.fn()`/`vi.spyOn`, `console.error`
  단언은 `vi.spyOn(console, 'error')`. throw는 `await expect(...).rejects.toThrow()`.
- **UI 텍스트는 한국어** 고정(프로젝트 규약). 단언 대상 텍스트도 한국어 그대로.

## Workflow

### 1. 컨텍스트 수집

- `docs/features/tag/issue-{N}.md`를 읽어 **확정 시그니처**(어떤 모듈·함수·Props·타입)와
  **테스트 시나리오**(정상/경계/예외 목록), **AC 커버리지** 표를 파악한다.
- 시그니처의 파일 경로(`src/components/TagList.tsx` 등)로 **테스트 파일 경로**를 정한다
  (위 컨벤션). 대상별로 테스트 파일이 1개씩 생긴다.
- 대상 모듈이 실제로 있는지 가볍게 확인한다(없을 가능성이 높고, 없으면 그게 RED의
  원인이 된다 — 만들지 않는다).

### 2. 시나리오 → 테스트, 한 건씩

시나리오를 **위에서부터 하나씩** 옮긴다. 한 번에 하나가 원칙이다(RED는 "쓰고 → 실패
확인 → 다음"의 짧은 루프).

1. 해당 시나리오가 속한 테스트 파일을 만들거나 연다.
2. 알맞은 `describe`(함수/컴포넌트) 안에 `it('should … when …', …)` 하나를 추가한다.
3. 시나리오 문장이 말하는 입력·기대 결과를 단언으로 표현한다. 단언 없는 빈 테스트 금지.

### 3. 즉시 실행 → 실패 확인

방금 추가한 테스트만 빠르게 돌려 **실패**를 확인한다.

```bash
npx vitest run path/to/file.test.tsx -t "should ... when ..."
```

- 실패하면 메시지를 읽고 "올바른 실패"인지 판단(위 섹션). 맞으면 다음 시나리오로.
- **통과하면 멈춘다** — RED여야 할 테스트가 통과한 것이므로 테스트가 너무 약하거나
  구현이 이미 있는 것이다. 단언을 시나리오에 맞게 조인다.
- 잘못된 이유로 실패하면(오타 등) 테스트를 고친 뒤 다시 실행.

### 4. 전체 실행 → 모두 실패 검증

모든 시나리오를 옮기면 마지막에 전체를 돌린다.

```bash
npm test
```

- 이 이슈에서 추가한 테스트가 **전부 실패(또는 collection error로 실패)** 인지 확인한다.
- 통과하는 테스트가 있으면 RED가 깨진 것 — 해당 테스트를 점검해 고친다.
- 기존에 통과하던 다른 테스트가 있었다면 그건 그대로 통과해야 한다(이번 변경은 새 테스트
  파일만 건드리므로 회귀가 없어야 정상).

### 5. 마무리 보고

한 줄로: 생성한 테스트 파일 경로들, 옮긴 시나리오 수(= `it` 수), 전체 실행 결과(모두
실패 확인), 그리고 다음 단계는 **GREEN(구현)** 이라는 안내. 커버한 AC도 함께 적으면 좋다.

## 출력 예시

`issue-1.md`의 시나리오
`[정상] TagList — should render a chip for each tag in array order when tags is ["react", "study"]`
→ `src/components/TagList.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { TagList } from './TagList';

describe('TagList', () => {
  it('should render a chip for each tag in array order when tags is ["react", "study"]', () => {
    render(<TagList tags={['react', 'study']} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('study')).toBeInTheDocument();
  });

  it('should render an empty tag area with no chips when tags is []', () => {
    render(<TagList tags={[]} />);
    expect(screen.queryByText('react')).not.toBeInTheDocument();
  });
});
```

`./TagList`가 아직 없으므로 import가 깨져 **전부 실패** — 의도된 RED다. `src/`에
`TagList.tsx`를 만들지 않는다(GREEN 단계가 만든다).

## 하지 않는 것 (범위 밖)

- **구현 작성** — 컴포넌트/함수/훅 본문, 타입 추가, 스텁 파일 생성. 전부 GREEN의 몫.
- **`src/` 수정** — 어떤 이유로도. 테스트를 통과시키려는 변경은 RED 위반.
- **시나리오 재설계** — 시나리오가 부족하면 멈추고 `/test-scenarios {N}`로 돌려보낸다.
- **커밋** — 이 스킬은 테스트 파일을 만들고 실패를 확인하는 데서 끝난다(커밋은 별도).
- **여러 이슈 동시 처리** — 한 번에 이슈 1개.

## 도구 메모

- 단일 테스트: `npx vitest run <파일> -t "<it 이름>"`. 전체: `npm test`(= `vitest run`).
- 시그니처·시나리오 소스는 `docs/features/tag/issue-{N}.md` 하나뿐이다(이슈 본문
  `issues.md`나 GitHub를 다시 읽지 않는다 — 이미 그걸 거쳐 확정된 산출물이다).

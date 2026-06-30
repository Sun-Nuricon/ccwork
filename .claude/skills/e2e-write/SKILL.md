---
name: e2e-write
description: 한 기능의 PRD 사용자 스토리를 읽어 Playwright **E2E 테스트 코드**로 변환하는 스킬. 기능명을 받아 docs/features/{기능명}/prd.md의 "사용자 스토리(US-N)"를 실제 브라우저를 구동하는 사용자 여정 테스트로 옮기고, e2e/{기능명}.spec.ts에 작성한 뒤 npx playwright test로 통과를 확인한다. E2E best practice(사용자 관점 셀렉터·web-first 단언·테스트 독립성·데이터 격리)를 적용하고, 단위 테스트(Vitest)가 이미 검증하는 파싱·렌더·훅 로직은 **중복하지 않으며** 통합·영속성(새로고침 후 유지)에 집중한다. "E2E 테스트 짜줘", "이 기능 e2e 만들어줘", "PRD를 E2E 시나리오로", "플레이라이트 테스트 작성", "사용자 스토리 기반 통합 테스트", "{기능명} end-to-end 테스트" 같은 요청이면 사용자가 스킬명을 말하지 않아도 이 스킬을 쓴다. `/e2e-write <기능명>` 형태로 호출한다(예: `/e2e-write tag`). 단위 테스트 작성(RED)·구현(GREEN)은 범위 밖이다.
---

# E2E Write

한 기능의 **PRD 사용자 스토리**(`docs/features/{기능명}/prd.md`)를 Playwright로 실제
브라우저를 구동하는 **E2E 테스트**로 옮기는 스킬. 입력은 기능명 하나(`$ARGUMENTS`)다.

> **이 스킬의 본질**: 단위 테스트는 함수·컴포넌트·훅을 **격리해서** 검증한다. E2E는
> 그것들이 실제 브라우저 + 실제 json-server와 함께 동작할 때 **사용자가 보는 결과가
> 맞는지**, 그리고 **새로고침 후에도 서버에 남는지**를 검증한다. 둘의 역할이 다르므로,
> 단위가 이미 촘촘히 덮은 영역(파싱 규칙·렌더·훅 분기)을 E2E에서 다시 검증하지 않는다.
> E2E는 적게, 굵게 — 스토리당 대표 여정 1개 + 영속성이 기본이다.

## 입력

- `$ARGUMENTS` = **기능명** 하나 (예: `/e2e-write tag` → `tag`).
- 비어 있으면 진행하지 말고 기능명을 요청한다.
- `docs/features/{기능명}/prd.md`가 없으면 멈추고, 먼저 `feature-planner`로 PRD를
  작성해야 한다고 안내한다. **PRD의 "사용자 스토리"가 시나리오의 단일 소스**다.

## 절대 제약

1. **`e2e/` 아래 `*.spec.ts`만 생성/수정한다.** `src/` 구현이나 단위 테스트(`*.test.ts(x)`),
   Playwright 설정은 건드리지 않는다. (설정 변경이 필요하면 멈추고 사용자에게 알린다.)
2. **단위 테스트가 덮는 것을 재검증하지 않는다.** (아래 "중복 회피" 참고) — E2E는
   통합·영속성만.
3. **PRD에 적혀 있어도 실제로 구현되지 않은 동작은 테스트하지 않는다.** PRD는 "무엇을
   만들지"의 기록이라 아직 안 만든 스토리가 섞여 있을 수 있다. 반드시 실제 코드와
   대조하고, 미구현 스토리는 **건너뛴 뒤 보고**한다(억지로 통과시키지도, 가짜로 skip만
   남기지도 않는다).
4. **테스트는 실제로 통과해야 한다.** RED와 달리 E2E는 GREEN 상태로 끝낸다 — 작성 후
   반드시 실행해 초록을 확인한다.

## 중복 회피: 단위 vs E2E (이 스킬의 핵심 판단)

이 프로젝트는 단위 테스트가 이미 두텁다. 같은 것을 E2E로 다시 짜면 느리고 깨지기 쉬운
중복만 늘어난다. 작성 전, **이 기능의 단위 테스트가 무엇을 덮는지** 먼저 읽는다
(`src/**/*.test.ts(x)`).

**E2E에서 다시 검증하지 않는다 (단위의 몫)**

- 순수 함수의 입력→출력 규칙·엣지케이스 매트릭스. 예: `src/lib/tags.test.ts`의 trim,
  `"a,b"` 분리, 빈값 무시, 정확 일치 dedup. → E2E에서 "쉼표로 두 개 분리" 같은 걸
  재현하지 않는다.
- props→DOM 렌더 단위. 예: `TagList.test.tsx`, `TagInput.test.tsx`.
- 훅 분기·상태 로직. 예: `useTags.test.tsx`(편집/생성 모드 분기, 즉시 저장 호출).
- mock된 context 위에서의 컴포넌트 동작. 예: `NoteEditor.test.tsx`.

**E2E에서만 검증할 수 있다 (E2E의 몫)**

- 여러 컴포넌트 + Context + 실제 네트워크가 **함께** 도는 사용자 여정 전체.
- 실제 json-server에 저장되고 **새로고침 후에도 유지**되는 영속성 — 단위는 API를
  mock하므로 원천적으로 못 한다. **거의 모든 E2E 스토리는 이 영속성 한 줄을 포함해야
  값을 한다.**
- 사용자가 실제로 클릭·입력했을 때 화면이 의도대로 바뀌는 통합 결과.

> 판단 기준 한 줄: **"이 단언이 API를 mock한 단위 테스트로도 똑같이 가능한가?" → 가능하면
> E2E에 넣지 않는다.** E2E에는 "실제로 저장됐는가 / 여러 조각이 함께 동작하는가"만 남긴다.

## E2E Best Practices (이 프로젝트 적용)

- **사용자 관점 셀렉터 우선**: `getByRole`/`getByLabel`/`getByText`/`getByPlaceholder`로
  사람이 보는 것을 찾는다. CSS 클래스·DOM 구조에 의존하지 않는다(Tailwind 클래스는 수시로
  바뀐다). 역할로 못 집으면 그때 `getByTestId`(예: `tag-area`)를 쓴다.
- **web-first 단언**: `await expect(locator).toBeVisible()`처럼 자동 재시도되는 단언을
  쓴다. `expect(await locator.count())` 같은 즉시 스냅샷 단언은 비동기 UI에서 깨진다.
- **임의 대기 금지**: `waitForTimeout(...)`/`sleep` 쓰지 않는다. 상태가 바뀌길 기다리는
  건 web-first 단언이나 `waitFor`가 한다.
- **테스트 독립성**: 각 `test`는 혼자 돌려도 통과해야 한다. 다른 테스트가 만든 데이터나
  실행 순서에 기대지 않는다. 시드 `db.json`의 특정 노트("첫 번째 노트" 등)에 의존하지
  않는다 — 그 데이터는 수시로 바뀐다. **필요한 데이터는 테스트가 직접 만든다.**
- **하나의 여정 = 하나의 test**: 한 `test`는 한 사용자 스토리의 대표 흐름을 끝까지
  따라간다. 분기·엣지 매트릭스를 한 테스트에 욱여넣지 않는다.
- **구현이 아닌 행동을 검증**: 내부 state·함수 호출이 아니라 사용자가 보는 결과를 단언한다.

## 데이터 격리 (이 프로젝트의 가장 큰 함정)

json-server는 **실제 `db.json`에 직접 쓰기/삭제**한다(낙관적 업데이트 없음, 실제 영속).
E2E가 노트를 만들고 지우면 그 흔적이 `db.json`에 남아 다음 실행·데모를 오염시킨다.
그래서 **테스트가 스스로 만든 데이터를 스스로 치운다**.

- **셋업/정리는 UI가 아니라 API로**: Playwright `request` 픽스처로 json-server REST
  (`http://localhost:3001`)를 직접 호출해 노트를 만들고(`POST /notes`) 지운다
  (`DELETE /notes/{id}`). UI 클릭으로 사전 데이터를 쌓지 않는다 — 느리고 본질이 아니다.
- **고유 마커로 충돌 회피**: 테스트가 만드는 노트 제목에 고유 접두사를 붙인다
  (예: ``\`[e2e] ${testInfo.title} ${Date.now()}\```). 시드 데이터나 병렬 테스트와
  절대 겹치지 않게 한다.
- **반드시 정리한다**: 만든 노트 id를 모아 `test.afterEach`에서 `DELETE`로 지운다.
  테스트가 실패해도 정리가 돌도록 `afterEach`에 둔다.
- **읽기 검증도 직접 만든 노트로**: "태그가 보인다"를 시드 노트로 확인하지 말고, 테스트가
  API로 먼저 그 노트를 만든 뒤 UI에서 확인한다.

```ts
import { test, expect, type APIRequestContext } from '@playwright/test';

const API = 'http://localhost:3001';

// 만든 노트를 추적했다가 정리
async function createNote(
  request: APIRequestContext,
  data: { title: string; content?: string; tags?: string[] },
) {
  const res = await request.post(`${API}/notes`, {
    data: { content: '', tags: [], ...data },
  });
  return (await res.json()) as { id: string };
}
```

## 파일·실행 컨벤션

- **위치/이름**: 기능당 한 파일 — `e2e/{기능명}.spec.ts`. 스토리별로 `test(...)`를 두고
  `test.describe('{기능명} E2E', ...)`로 묶는다.
- **import**: 단위 테스트(Vitest, globals)와 달리 E2E는 명시적으로
  `import { test, expect } from '@playwright/test'`. RTL/jsdom을 쓰지 않는다.
- **test 이름 = 사용자 스토리 흐름**: 한국어로 "US-N: 사용자가 …하면 …된다" 식.
  PRD의 US 문장을 사용자 행동/결과로 옮긴다.
- **서버**: `playwright.config.ts`가 전용 포트 **5174**에서 `npm run dev:e2e`(Vite +
  json-server)를 자동 기동한다. baseURL이 5174이므로 `page.goto('/')`로 연다. API는
  3001로 직접 친다.
- **실행**: 작성한 파일만 빠르게 — `npx playwright test e2e/{기능명}.spec.ts`.
  전체는 `npm run test:e2e`. 실패 분석은 `npx playwright show-report`.

## Workflow

### 1. 소스 읽기 — PRD 사용자 스토리

`docs/features/{기능명}/prd.md`에서 `## 2. 사용자 스토리`(US-N 목록)와 `## 4. 범위 밖`을
읽는다. 각 US-N의 본문·하위 불릿이 **그 스토리의 합격 흐름과 수용 조건**이다. "범위 밖"은
테스트하면 안 되는 것 — 여기 적힌 동작은 시나리오로 만들지 않는다.

### 2. 단위 테스트 지도 파악 (중복 회피)

`src/**/*.test.ts(x)` 중 이 기능 관련 파일을 훑어 **무엇이 이미 단위로 덮였는지** 적는다.
이게 E2E에서 뺄 목록이다. 남는 것 = 통합·영속성뿐인지 확인한다.

### 3. 실제 구현과 대조 (게이트)

각 US를 실제 코드(`src/components`, `src/hooks`, `src/context`)와 맞춰본다. UI에 실제로
배선된 동작인가? 셀렉터로 집을 수 있는 사용자 경로가 존재하는가? **미구현 US는 이 단계에서
골라내 4단계 대상에서 제외**하고, 마지막 보고에 "미구현이라 스킵"으로 남긴다. (PRD가
앞서가는 경우가 흔하다 — 예: 칩 삭제 ×나 생성 모드 태그 입력이 아직 없을 수 있다.)

### 4. 스토리 → E2E 여정, 한 건씩

남은 US마다 `test(...)` 하나를 만든다. 각 테스트는:

1. **준비**: 필요한 노트를 `request` API로 만든다(고유 마커, id 추적).
2. **행동**: `page.goto('/')` 후 사용자가 하듯 클릭·입력한다(사용자 관점 셀렉터).
3. **결과 단언**: 화면에서 web-first 단언으로 확인한다.
4. **영속성 단언**(해당되면): `page.reload()` 후에도 결과가 남아 있는지 확인한다 —
   E2E만의 핵심 가치.
5. 만든 노트는 `afterEach`에서 API로 정리.

### 5. 실행 → 초록 확인

```bash
npx playwright test e2e/{기능명}.spec.ts
```

- 통과하면 다음. 실패하면 메시지·`error-context.md`(`test-results/`)·`show-report`로
  원인을 보고, 셀렉터/타이밍 문제면 테스트를 고친다(`src/`는 건드리지 않는다).
- **실제 미구현이라 실패하는 경우**: 그 테스트는 3단계에서 걸러졌어야 한다. GREEN으로
  만들 수 없으면 시나리오에서 빼고 "미구현"으로 보고한다.

### 6. 마무리 보고

한 줄 요약: 생성 파일 경로, 작성한 여정 수(= `test` 수)와 매핑된 US, **단위와 중복을 피해
뺀 항목**, **미구현이라 스킵한 US**, 전체 실행 결과(초록). 다음 단계 제안(예: 미구현 US가
TDD 사이클로 구현되면 다시 `/e2e-write`).

## 출력 예시 (tag 기능, US-1/US-3 기준)

US-1(태그 추가)·US-3(태그 확인)을 하나의 여정으로 — 단위가 덮는 파싱 규칙은 빼고, 실제
저장·영속성에 집중한다.

```ts
import { test, expect, type APIRequestContext } from '@playwright/test';

const API = 'http://localhost:3001';

test.describe('tag E2E', () => {
  const createdIds: string[] = [];

  async function seedNote(request: APIRequestContext, title: string) {
    const res = await request.post(`${API}/notes`, {
      data: { title, content: '', tags: [] },
    });
    const note = (await res.json()) as { id: string };
    createdIds.push(note.id);
    return note;
  }

  test.afterEach(async ({ request }) => {
    await Promise.all(createdIds.map((id) => request.delete(`${API}/notes/${id}`)));
    createdIds.length = 0;
  });

  test('US-1/US-3: 편집 중 태그를 추가하면 칩으로 보이고 새로고침 후에도 유지된다', async ({
    page,
    request,
  }) => {
    const title = `[e2e] 태그추가 ${Date.now()}`;
    await seedNote(request, title);

    await page.goto('/');
    await page.getByText(title).click(); // 사이드바에서 노트 선택 → 편집 모드

    // 단위가 덮는 "파싱"이 아니라, 실제 입력→칩 표시라는 통합 결과만 본다
    const tagInput = page.getByPlaceholder('태그 입력 후 Enter');
    await tagInput.fill('통합테스트');
    await tagInput.press('Enter');

    const tagArea = page.getByTestId('tag-area');
    await expect(tagArea.getByText('통합테스트')).toBeVisible();

    // E2E만 할 수 있는 검증: 실제 서버 저장 → 새로고침 후에도 유지
    await page.reload();
    await page.getByText(title).click();
    await expect(page.getByTestId('tag-area').getByText('통합테스트')).toBeVisible();
  });
});
```

> 여기서 `"a,b"` 분리·중복 제거·빈값 무시 같은 건 일부러 넣지 않았다 —
> `src/lib/tags.test.ts`가 이미 촘촘히 덮는다. E2E는 "진짜로 저장돼 새로고침을 견디는가"
> 한 가지에 값을 집중한다.

## 하지 않는 것 (범위 밖)

- **단위 테스트 작성/수정** — 파싱·렌더·훅 검증은 `/tdd-red`·`/tdd-green`의 몫.
- **`src/` 구현·Playwright 설정 변경** — E2E 통과를 위해 앱이나 설정을 고치지 않는다.
  미구현이면 스킵·보고로 끝낸다.
- **PRD "범위 밖" 항목 테스트** — 검색·필터·전역 태그·토스트 등은 만들지 않는다.
- **시드 `db.json`에 의존** — 데이터는 테스트가 만들고 치운다.
- **커밋** — 스킬은 spec 작성·초록 확인까지. 커밋·PR은 별도.
- **여러 기능 동시 처리** — 한 번에 기능 1개.

## 도구 메모

- 단일 파일 실행: `npx playwright test e2e/{기능명}.spec.ts`. 전체: `npm run test:e2e`.
  리포트: `npx playwright show-report`. UI 모드: `npm run test:e2e:ui`.
- 사용자 스토리 소스는 `docs/features/{기능명}/prd.md`의 "사용자 스토리"뿐이다
  (`spec-fixed.md`·`issues.md`를 다시 끌어오지 않는다 — PRD가 사용자 관점의 단일 소스다).
- 셋업/정리 API는 json-server(`http://localhost:3001`): `POST /notes`, `DELETE /notes/{id}`,
  `PATCH /notes/{id}`. 앱 UI 포트(5174)와 다르다.

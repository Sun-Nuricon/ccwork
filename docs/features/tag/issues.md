# 태그 기능 이슈 분해

> [`prd.md`](./prd.md)와 [`spec-fixed.md`](./spec-fixed.md)를 기반으로 **수직 슬라이싱**
> 원칙에 따라 분해한 구현 이슈 목록이다. 각 이슈는 타입 → 상태/훅 → UI까지 한 층이 아니라
> **여러 층을 관통**해, 그 자체로 화면에서 동작을 확인할 수 있는 단위로 잡았다.

## 슬라이스 개요

| #   | 제목                           | 매핑 US    | 핵심 산출물                                                  |
| --- | ------------------------------ | ---------- | ------------------------------------------------------------ |
| 1   | 노트 태그 표시 (read-only)     | US-3       | `Note.tags` 타입, 방어적 읽기, `TagList`로 기존 태그 칩 표시 |
| 2   | 편집 모드 태그 추가 (즉시저장) | US-1, US-5 | `lib/tags.ts` 파싱, `useTags.addTag`, `TagInput`             |
| 3   | 편집 모드 태그 삭제 (즉시저장) | US-2, US-5 | `TagList` hover ×, `useTags.removeTag`                       |
| 4   | 생성 모드 태그 부여 (지연저장) | US-4       | `createNote` 시그니처 확장, 생성 모드 로컬 누적              |

> **의존 순서**: 1 → 2 → 3 → 4. 이슈 1이 데이터 모델·표시 골격(walking skeleton)을 깔고,
> 2·3이 편집 모드 입력/삭제를 채운 뒤, 4가 생성 모드를 마무리한다. 2 완료 후 3·4는 병렬
> 진행이 가능하다.

---

## 이슈 1 — 노트 태그를 편집 화면에 표시한다 (read-only)

**설명**
`Note` 데이터 모델에 `tags: string[]` 필드를 추가하고, 노트 편집 화면에 현재 노트의 태그를
칩(badge) 목록으로 표시한다. 이 단계는 입력·삭제 없이 **표시 전용**이며, 태그 기능 전체의
데이터 골격과 UI 자리(NoteEditor의 textarea 아래, 버튼 위)를 잡는 walking skeleton이다.

- `src/types/note.ts`에 `tags: string[]` 추가.
- 읽는 쪽은 `note.tags ?? []`로 방어(기존 `db.json` 노트에 `tags`가 없을 수 있음).
- 프레젠테이션 컴포넌트 `TagList`(태그 배열을 받아 칩으로 렌더, named export,
  `TagListProps` interface) 신설 — 이 단계에서는 삭제 버튼 없이 표시만.

**완료조건 (Acceptance Criteria)**

- **AC-1.1 기존 태그 표시**
  - **Given** `tags: ["react", "study"]`를 가진 노트가 있고
  - **When** 사용자가 그 노트를 선택해 편집 화면을 연다
  - **Then** textarea 아래에 `react`, `study` 칩이 순서대로 표시된다

- **AC-1.2 태그 없는 노트 방어**
  - **Given** `tags` 필드가 아예 없는 기존 노트가 있고
  - **When** 사용자가 그 노트를 선택한다
  - **Then** 오류 없이 태그 영역이 비어 있는 상태로 렌더된다 (`note.tags ?? []`)

- **AC-1.3 미선택 상태**
  - **Given** 아무 노트도 선택되지 않았고 생성 모드도 아닌 상태에서
  - **When** 편집 영역을 본다
  - **Then** 태그 영역은 렌더되지 않는다(기존 "노트를 선택하세요" 안내만 표시)

---

## 이슈 2 — 편집 모드에서 태그를 추가하고 즉시 저장한다

**설명**
편집 중인 노트(`selectedNoteId` 존재)에 태그를 입력해 추가하고, 추가 즉시 서버에 반영한다.
입력 파싱 규칙은 React 비의존 순수 함수로 분리하고, 모드 분기·즉시 저장은 커스텀 훅에
캡슐화한다(ADR-4).

- `src/lib/tags.ts` — `parseTagInput(raw): string[]`(trim·쉼표 분리·빈값 제거),
  `addTags(prev, incoming): string[]`(정확 일치 dedup) 등 순수 함수.
- `useTags(selectedNoteId, isCreating)` 훅 — `{ tags, addTag }` 제공, 편집 모드에서
  `addTag` 호출 시 `useNotes().updateNote(id, { tags })`로 즉시 저장.
- `TagInput` 컴포넌트 — input 1개, 플레이스홀더 `"태그 입력 후 Enter"`, **Enter 또는
  쉼표(,)**로 확정, `onAdd` 콜백 주입.

**완료조건 (Acceptance Criteria)**

- **AC-2.1 Enter로 추가 + 즉시 저장**
  - **Given** 편집 모드에서 태그 입력란에 `react`를 입력했고
  - **When** Enter를 누른다
  - **Then** `react` 칩이 추가되고 입력란이 비워지며, `updateNote(id, { tags: [..., "react"] })`가 호출되어 서버에 반영된다

- **AC-2.2 쉼표로 확정**
  - **Given** 입력란에 `study`를 입력했고
  - **When** 쉼표(,)를 입력한다
  - **Then** `study` 칩이 추가되고 입력란이 비워진다

- **AC-2.3 한 번에 여러 태그 분리**
  - **Given** 입력란에 `a,b`를 입력했고
  - **When** Enter로 확정한다
  - **Then** `a`, `b` 두 개의 칩으로 분리되어 추가된다

- **AC-2.4 앞뒤 공백 trim**
  - **Given** 입력란에 `  react  `(앞뒤 공백 포함)을 입력했고
  - **When** Enter로 확정한다
  - **Then** 공백이 제거된 `react`로 추가된다

- **AC-2.5 빈 값 / 공백만 입력 무시**
  - **Given** 입력란이 비어 있거나 공백만 있고
  - **When** Enter 또는 쉼표를 입력한다
  - **Then** 아무 태그도 추가되지 않는다

- **AC-2.6 중복 무시 (정확 일치)**
  - **Given** 이미 `react` 칩이 있는 상태에서
  - **When** 다시 `react`를 추가한다
  - **Then** 중복 추가되지 않고 칩은 1개로 유지된다(에러 아님). 단 `React`는 다른 태그로 추가된다

- **AC-2.7 기존 태그가 있을 때 새 태그 추가 (append)**
  - **Given** 이미 `react` 태그 1개가 있는 노트를 편집 중이고
  - **When** 입력란에 `study`를 입력하고 Enter로 확정한다
  - **Then** 기존 `react`는 유지된 채 `study`가 뒤에 추가되어 `["react", "study"]`가 되고, `updateNote(id, { tags: ["react", "study"] })`로 저장된다(기존 태그를 덮어쓰지 않음)

- **AC-2.8 즉시 저장 실패 처리**
  - **Given** 편집 모드에서 태그를 추가했는데
  - **When** `updateNote` 요청이 실패한다
  - **Then** `console.error`로만 로그하고(`alert` 금지), 칩 상태는 서버 동기화 결과를 따른다

---

## 이슈 3 — 편집 모드에서 태그를 삭제하고 즉시 저장한다

**설명**
편집 화면의 태그 칩에서 개별 태그를 삭제하고, 삭제 즉시 서버에 반영한다. 삭제 버튼은
칩 hover 시에만 노출하며 접근성 라벨을 제공한다.

- `TagList`에 hover 시 노출되는 × 버튼 추가(`group` + `opacity-0 group-hover:opacity-100`
  - `transition-opacity`), `aria-label`(예: `"react 태그 삭제"`), `onRemove` 콜백 주입.
- `useTags`에 `removeTag` 추가 — 편집 모드에서 `updateNote(id, { tags })`로 즉시 저장.

**완료조건 (Acceptance Criteria)**

- **AC-3.1 hover 시 삭제 버튼 노출**
  - **Given** 편집 화면에 `react` 칩이 있고
  - **When** 사용자가 그 칩에 마우스를 올린다
  - **Then** × 버튼이 나타난다 (평소엔 텍스트만 보임)

- **AC-3.2 삭제 + 즉시 저장**
  - **Given** `tags: ["react", "study"]`인 노트를 편집 중이고
  - **When** `react` 칩의 × 버튼을 클릭한다
  - **Then** `react` 칩이 사라지고 `updateNote(id, { tags: ["study"] })`가 호출되어 서버에 반영된다

- **AC-3.3 접근성 라벨**
  - **Given** `react` 칩의 삭제 버튼이 렌더될 때
  - **When** 스크린리더가 버튼을 읽는다
  - **Then** `aria-label="react 태그 삭제"`로 의미가 드러난다

- **AC-3.4 삭제 실패 처리**
  - **Given** 태그 삭제를 시도했는데
  - **When** `updateNote` 요청이 실패한다
  - **Then** `console.error`로만 로그하고 칩 상태는 서버 동기화 결과를 따른다

---

## 이슈 4 — 생성 모드에서 태그를 부여해 노트와 함께 저장한다

**설명**
새 노트 작성(`isCreating`) 시에는 노트 `id`가 없어 PATCH 대상이 없으므로, 태그를 로컬
state에만 쌓아두고 최초 '저장'(`createNote`) 시 본문과 함께 전송한다. 즉 "즉시 저장"은
편집 모드 한정이며 생성 모드는 지연 저장이다.

- `useTags`가 `isCreating`일 때 `addTag`/`removeTag`를 **로컬 state만** 갱신하도록 분기.
- `NotesContext.createNote` 시그니처를 `(title, content, tags: string[])`로 확장하고
  내부에서 `api.createNote({ title, content, tags })`로 전달.
- `api/notes.ts`는 `createNote`가 `Omit<Note, 'id'|'createdAt'|'updatedAt'>`이라 변경 불필요.
- `NoteEditor.handleSave`가 생성 분기에서 누적된 `tags`를 함께 넘기도록 연결.

**완료조건 (Acceptance Criteria)**

- **AC-4.1 생성 모드는 즉시 저장하지 않음**
  - **Given** 새 노트 작성(생성 모드) 중이고
  - **When** 태그 `react`를 추가한다
  - **Then** 칩은 화면에 즉시 보이지만 이 시점에 `createNote`/`updateNote`는 호출되지 않는다

- **AC-4.2 저장 시 태그 동봉**
  - **Given** 생성 모드에서 제목·내용을 입력하고 태그 `react`, `study`를 추가한 뒤
  - **When** '저장' 버튼을 누른다
  - **Then** `createNote(title, content, ["react", "study"])`가 호출되어 노트가 태그와 함께 생성된다

- **AC-4.3 태그 없이 생성**
  - **Given** 생성 모드에서 태그를 하나도 추가하지 않고
  - **When** '저장' 버튼을 누른다
  - **Then** `tags: []`로 노트가 생성된다(필드 누락 없이 항상 배열)

- **AC-4.4 생성 모드 삭제도 로컬만**
  - **Given** 생성 모드에서 `react`, `study`를 추가한 상태에서
  - **When** `react` 칩을 삭제한다
  - **Then** 로컬 칩 목록에서만 제거되고(서버 호출 없음), 이후 저장 시 `["study"]`만 전송된다

---

## 테스트 메모 (참고)

- **순수 함수** (`lib/tags.ts`): `parseTagInput`/`addTags`를 React 없이 단위 테스트 — 이슈 2의
  AC-2.3~2.7을 함수 레벨에서 직접 검증.
- **`useTags` 훅**: `renderHook` + mock `useNotes`로 모드별 저장 분기(즉시 vs 지연) 검증 —
  이슈 2·3·4의 저장 동작.
- **컴포넌트** (`TagInput`/`TagList`): props/콜백 기반 독립 렌더 테스트 — Enter/쉼표 확정,
  hover ×, `aria-label`.
- **e2e**: 편집 노트에서 태그 추가→새로고침 후 유지(AC-2.1), 삭제 반영(AC-3.2), 생성 시
  동봉(AC-4.2)을 시나리오로 확인.

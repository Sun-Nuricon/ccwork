# 태그 기능 정의서 (확정본)

> 원본 `spec-original.md`를 기반으로, 데이터 구조 · UI 패턴 · 엣지케이스에 대한
> 결정을 추가한 구현용 명세다. 이 문서가 구현의 단일 기준(source of truth)이다.

## 기능 개요

노트에 태그를 추가하고 관리할 수 있다. 태그는 노트를 분류·식별하기 위한 짧은 문자열이다.

## 기능 요구사항 (원본 유지)

- 노트에 태그를 추가할 수 있다.
- 노트에 추가된 태그를 삭제할 수 있다.
- 태그 목록을 노트 상세(편집) 화면에서 확인할 수 있다.

## 데이터 구조

`src/types/note.ts`의 `Note` 인터페이스에 `tags` 필드를 추가한다.

```ts
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[]; // ← 추가 (태그 문자열 배열)
  createdAt: string;
  updatedAt: string;
}
```

- **타입**: `string[]`. 별도 tags 컬렉션·정규화(참조)는 쓰지 않는다 — json-server 학습
  프로젝트이고 현재 단일 Context 구조에 가장 단순하게 맞기 때문.
- **기본값**: 항상 배열. 태그가 없는 노트는 `[]`.
- **하위 호환**: `db.json`의 기존 노트에 `tags`가 없을 수 있으므로, 읽는 쪽에서는
  `note.tags ?? []`로 방어한다. 새로 생성·수정되는 노트는 항상 `tags`를 포함시킨다.

## UI 패턴

태그 영역은 **NoteEditor의 내용(textarea) 아래, 버튼 영역 위**에 둔다.

### 입력 방식: Enter 확정 칩(chip)

- 태그 입력용 `<input>` 한 개를 둔다. 플레이스홀더 예: `"태그 입력 후 Enter"`.
- 확정 키: **Enter** 또는 **쉼표(,)** 입력 시 현재 입력값을 태그로 추가하고 입력란을 비운다.
- 추가된 태그는 각각 **칩(badge)** 으로 렌더한다.
- **삭제(× 버튼)는 칩에 hover 했을 때만 노출**한다. 평소엔 칩 텍스트만 보이고, 마우스를
  올리면 × 버튼이 나타나 클릭으로 해당 태그를 삭제한다.
  - 구현 힌트: 칩에 `group` 클래스를 주고 × 버튼에 `opacity-0 group-hover:opacity-100`
    (+ `transition-opacity`)을 적용한다.
  - 접근성: hover 전용이므로 × 버튼에는 `aria-label`(예: `"react 태그 삭제"`)을 붙여
    스크린리더에서도 의미가 드러나게 한다.
- 칩 스타일은 기존 Tailwind 테마 토큰(`bg-muted`, `text-muted-foreground`,
  `border-border` 등)을 사용해 NoteEditor와 톤을 맞춘다. shadcn 자체는 쓰지 않는다.
- UI 텍스트·플레이스홀더는 한국어로 고정한다 (프로젝트 규약).

### 표시(상세 확인)

- 편집 화면에서 현재 노트의 태그 목록을 위 칩들로 항상 확인할 수 있다.
- (선택) NoteList의 NoteItem에 태그 칩을 함께 노출하는 것은 이번 범위에서 **제외**한다.
  필요하면 별도 작업으로 추가한다.

## 저장 시점 (데이터 흐름)

기존 NoteEditor는 제목/내용을 '저장' 버튼으로 커밋한다. 태그는 모드별로 다르게 처리한다.

- **편집 모드** (`selectedNoteId` 존재): 칩을 **추가/삭제하는 즉시** 서버에 반영한다.
  - `useNotes().updateNote(id, { tags })`를 바로 호출 → 서버가 `updatedAt` 갱신 후 응답 →
    Context의 `notes` 동기화.
  - 제목/내용의 '저장' 버튼 흐름과는 별개로 동작한다 (태그만 즉시 저장).
- **생성 모드** (`isCreating`): 아직 노트 id가 없으므로 PATCH 대상이 없다. 따라서
  칩은 **로컬 state에만** 쌓아두고, 최초 '저장'(`createNote`) 시 `tags`를 함께 전송한다.
  - 즉, "즉시 저장"은 **편집 모드에 한정**된다.

이 결정은 프로젝트의 "낙관적 업데이트 없음 — `await api.xxx()` 후 `setNotes`" 규약을
그대로 따른다.

## API / Context 변경

CLAUDE.md의 3단계 규약(① `api/notes.ts` → ② `NotesContext` → ③ 컴포넌트는 `useNotes()`)을
따른다.

- **`src/api/notes.ts`**:
  - `createNote`의 입력 타입은 이미 `Omit<Note, 'id'|'createdAt'|'updatedAt'>`이므로
    `tags`가 자동 포함된다. 별도 변경 없이 호출부에서 `tags`를 채워 넘기면 된다.
  - `updateNote`는 `Partial<Note>`라 `{ tags }` 부분 수정을 그대로 지원한다(PATCH). 변경 불필요.
  - 타임스탬프는 기존대로 클라이언트가 생성(`new Date().toISOString()`)한다.
- **`src/context/NotesContext.tsx`**:
  - `createNote` 시그니처를 `(title, content, tags: string[])`로 확장하고 내부에서
    `api.createNote({ title, content, tags })`로 전달한다.
  - `updateNote(id, { tags })`는 기존 시그니처(`Partial<Note>`)로 그대로 사용 가능.
- **컴포넌트**: NoteEditor는 `useNotes()`를 통해서만 호출한다. `fetch` 직접 호출 금지.

## 엣지케이스 / 검증 규칙

| 케이스                  | 처리                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| 중복 태그               | 추가 시 `tags.includes(trimmed)`면 **무시**(에러 아님). 칩 추가만 생략.                          |
| 앞뒤 공백               | 입력값은 `trim()` 후 사용한다.                                                                   |
| 빈 문자열 / 공백만 입력 | `trim()` 결과가 빈 문자열이면 추가하지 않는다.                                                   |
| 대소문자                | **정확 일치**로 중복 판단한다 (`"React"`와 `"react"`는 다른 태그). 저장도 입력 그대로.           |
| 쉼표가 포함된 입력      | 쉼표는 구분자이므로, 한 번에 `"a,b"` 입력 시 `a`, `b` 두 태그로 분리한다.                        |
| 즉시 저장 실패 (편집)   | `console.error(e)`로만 로그(프로젝트 규약: `alert()` 금지). 로컬 칩은 서버 동기화 결과를 따른다. |
| 기존 노트에 tags 없음   | 읽을 때 `note.tags ?? []`로 방어.                                                                |
| 태그 개수/길이 상한     | 이번 범위에서 **하드 제한 없음**(검증만 위 규칙). 필요 시 별도 작업.                             |

## 비고 (원본 유지)

- 태그는 문자열로 저장한다.
- 중복 태그는 허용하지 않는다.

## 범위 밖 (Out of scope)

- 태그로 노트 필터링·검색.
- 전역 태그 목록 / 자동완성 / 태그 이름 일괄 변경.
- NoteList(목록)에서의 태그 표시.
- 태그 색상·정렬 등 부가 기능.

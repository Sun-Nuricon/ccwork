# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 목적

React 19 + TypeScript + Vite 기반의 **노트 앱 실습 프로젝트**. 강의/학습용 코드베이스이며,
백엔드 대신 `json-server`로 REST API를 흉내 낸다. `src/types/note.ts`에 `tags` 필드가
의도적으로 빠져 있고 주석으로 "강의에서 추가할 것"이라 명시돼 있는 등, 강의 진행에 맞춰
점진적으로 기능을 추가하도록 설계되어 있다.

## 자주 쓰는 명령

| 명령어               | 설명                                                             |
| -------------------- | ---------------------------------------------------------------- |
| `npm run dev`        | Vite (5173) + json-server (3001) 동시 실행 — 보통 이것만 쓰면 됨 |
| `npm run server`     | json-server만 단독 실행 (백엔드만 띄우고 싶을 때)                |
| `npm run build`      | `tsc` 타입체크 후 Vite 프로덕션 빌드                             |
| `npm run lint`       | ESLint 자동 수정 (`--fix` 포함)                                  |
| `npm run format`     | Prettier 전체 포맷                                               |
| `npm test`           | Vitest 1회 실행 (jsdom 환경)                                     |
| `npm run test:watch` | Vitest watch 모드                                                |

단일 테스트 실행: `npx vitest run path/to/file.test.tsx` 또는 `-t "테스트 이름"`.

## 커밋 / Git hook 규칙

husky로 커밋 시점에 자동 검사가 걸린다 (`npm install` 시 `prepare: husky`로 설치됨).

- **pre-commit** (`.husky/pre-commit`): `lint-staged`가 **스테이징된 파일만** 검사.
  `*.{ts,tsx}`는 `eslint --fix` → `prettier --write`, `*.{css,json,md}`는 `prettier --write`.
  ESLint 에러가 남으면 커밋이 막히고 변경은 자동 롤백된다.
- **commit-msg** (`.husky/commit-msg`): `commitlint`가 메시지를 검사. 규칙은
  `commitlint.config.mjs` 한 곳에서 관리한다 (`@commitlint/config-conventional` 기반).
- **커밋 메시지 형식** — Conventional Commits + 추가 규칙:
  - 제목 필수: `type: subject` (예: `feat: 노트 태그 추가`). type은 `feat`/`fix`/`docs`/
    `refactor`/`test`/`chore` 등.
  - 제목과 본문 사이 **빈 줄 필수**.
  - **본문 필수, 비어있지 않은 줄 최소 2줄** (`body-min-lines` 커스텀 규칙).
- 메시지에 한글이 들어가면 PowerShell 파이프(`|`) 인코딩이 깨지므로, 커밋은
  `git commit -F <파일>` 처럼 파일로 메시지를 넘긴다.
- 프로젝트는 ESM이다 (`package.json`의 `"type": "module"`). 새 설정 파일은 `.mjs` 또는
  ESM `.js`로 작성한다. CommonJS가 필요하면 `.cjs` 확장자를 쓴다.

## 아키텍처 큰 그림

전형적인 3계층 React 앱이지만 **상태 관리 라이브러리 없이 단일 Context**로 모든 노트
상태를 들고 있다. 새 기능을 추가할 때 이 흐름을 그대로 따르는 게 중요하다.

```
App.tsx (선택/생성 UI 상태만 보유)
  └─ NotesProvider              ← 서버 상태(notes, loading, error) + CRUD 액션
       └─ Layout                ← 헤더 + 사이드바/메인 2열 구조
            ├─ NoteList         ← useNotes()로 목록 구독
            │    └─ NoteItem
            └─ NoteEditor       ← useNotes()로 addNote/editNote 호출
```

핵심 패턴:

- **단방향 데이터 흐름**: 모든 노트 CRUD는 `src/context/NotesContext.tsx`의
  `addNote`/`editNote`/`removeNote`를 거친다. 컴포넌트는 `fetch`를 직접 부르지 않고
  반드시 `useNotes()` 훅을 통한다. `useNotes`는 Provider 밖에서 부르면 throw 한다.
- **API 계층 분리**: HTTP 호출은 `src/api/notes.ts`에 모여 있고 Context가 이를 import.
  새 엔드포인트가 생기면 여기에 함수를 추가하고 Context에서 래핑한다.
  `createdAt`/`updatedAt`은 클라이언트가 ISO 문자열로 직접 채워서 보낸다 (서버는 단순 저장).
- **선택 상태는 로컬**: 어느 노트가 선택됐는지(`selectedNoteId`)와 새 노트 작성 모드
  (`isCreating`) 같은 UI 전용 상태는 `App.tsx`의 `useState`로만 관리한다.
  Context에 넣지 않는다.
- **낙관적 업데이트 없음**: CRUD 액션은 서버 응답을 기다린 뒤 로컬 `notes`를 갱신한다.
  실패 시 alert/console.error로 사용자에게 알리는 단순한 방식 (`NoteEditor.handleSave`).

## 컴포넌트 구현 패턴

- **Named export 사용**: 모든 컴포넌트는 `export function Foo()` 형태.
  `App.tsx`만 `export default App`로 예외 — `main.tsx`가 default import를 쓰기 때문이며
  새 컴포넌트는 무조건 named export로 만든다.
- **Props 타입 위치**: 컴포넌트 바로 위에 `interface {ComponentName}Props { ... }` 선언,
  시그니처에서 곧바로 구조분해. `type` 별칭이 아니라 `interface`로 통일.
- **이벤트 콜백은 부모가 주입**: `NoteItem`/`NoteEditor`는 자기가 `useNotes()`를 부르는
  대신 부모에서 `onSelect`/`onDelete`/`onDone` 같은 콜백을 받아 호출한다.
  단 `NoteList`와 `NoteEditor`는 예외로 자체 `useNotes()`를 쓴다 — Context 사용이
  컴포넌트마다 다르므로 새로 만들 때 주의 (아래 "일관성 없는 패턴" 참고).
- **조기 반환으로 분기 UI 처리**: 로딩/에러/빈 상태/미선택 상태는 모두 `if (...) return
  <p>...</p>` 식의 early return (`NoteList`, `NoteEditor`).
- **UI 텍스트는 한국어**, 라벨/플레이스홀더 모두 한국어로 고정.

## 상태 관리 방식

- **서버 상태 vs UI 상태 분리**:
  - 서버에서 받아온 노트 목록·로딩·에러·CRUD 액션은 `NotesContext`에만 둔다.
  - "어느 노트가 선택됐는가", "생성 모드인가", 폼 입력값 같은 UI 상태는 컴포넌트
    `useState`로 로컬에 둔다. Context에 절대 넣지 않는다.
- **Context 사용 규칙**: `useNotes()`는 Provider 밖에서 호출되면 throw — 새 컴포넌트가
  notes를 만지려면 반드시 트리 안에 있어야 한다.
- **폼 ↔ 선택 동기화**: 편집 폼은 `selectedNoteId`/`isCreating`이 바뀔 때만
  `useEffect`로 폼 state를 갱신하고, `notes` 자체는 deps에서 의도적으로 뺀다
  (`NoteEditor.tsx:27`). 이 패턴을 그대로 따른다.
- **낙관적 업데이트 없음**: 모든 mutation은 `await api.xxx()` 후 `setNotes`로 동기화.
  실패 처리는 호출부에서 한다 (아래 API 패턴 참고).

## API 호출 패턴

- **단일 소스**: 모든 HTTP는 `src/api/notes.ts`에 모인다. 컴포넌트/Context는 `fetch`를
  직접 부르지 않는다.
- **함수 시그니처 규칙**:
  - 비동기 함수, 반환 타입을 명시적으로 `Promise<...>`로 표기.
  - 입력은 도메인 타입 기반으로 좁힘: 생성은 `Omit<Note, 'id'|'createdAt'|'updatedAt'>`,
    수정은 `Partial<Note>`.
  - 응답이 `!res.ok`면 짧은 영문 메시지로 `throw new Error(...)`.
- **타임스탬프는 클라이언트가 생성**: `createNote`/`updateNote`에서 `new Date().toISOString()`을
  넣어 보낸다. 서버(json-server)는 단순 저장만 한다.
- **HTTP 메서드 매핑**: 부분 수정은 PUT이 아닌 PATCH 사용.
- **Context 래핑 규약**: API 함수를 Context가 한 번 더 감싸 `notes` state를 갱신한다.
  새 엔드포인트를 만들면 ① `api/notes.ts`에 함수 추가 → ② `NotesContext`에 액션 추가
  → ③ 컴포넌트는 `useNotes()`로만 접근하는 3단계를 그대로 따른다.

## 네이밍 패턴

- **파일명**: 컴포넌트는 `PascalCase.tsx`, 비컴포넌트 모듈은 `camelCase.ts`
  (`notes.ts`, `note.ts`, `test-setup.ts`만 kebab).
- **CRUD 동사 통일**: API 레이어와 Context 액션 모두 `fetch / create / update / delete`
  로 통일한다 (`fetchNotes`, `createNote`, `updateNote`, `deleteNote`). `add`/`edit`/
  `remove` 같은 동의어를 새로 도입하지 않는다. Context에서 API를 부를 때는
  `import * as api from '../api/notes'` 후 `api.createNote(...)` 식으로 네임스페이스를
  분리한다 — 동일 이름이라도 충돌하지 않는다.
- **이벤트 핸들러**:
  - Prop 이름은 `on + Verb` (`onSelect`, `onDelete`, `onDone`, `onNewNote`).
  - 내부 핸들러는 `handle + Verb` (`handleSave`, `handleSelectNote`).
- **불리언**: `is + Adj` 형태 (`isSelected`, `isCreating`, `saving`도 동사형 boolean).
- **컴포넌트 props 타입**: 무조건 `{ComponentName}Props`.

## 에러 처리 규약

- **`alert()` 금지**. mutation/검증 실패는 모두 `console.error(...)`로만 알린다.
  사용자 노출 UI(토스트 등)는 아직 없다 — 필요하면 별도 작업으로 도입한다.
- 비-throw 경로(검증 실패 등)는 한국어 메시지, throw된 Error는 API 레이어가 영문 메시지로
  생성한 그대로 로그된다. 두 언어 혼재는 의도된 것 (사용자 메시지 vs 디버그 로그).
- Fetch 에러는 여전히 `NotesContext.error` state에 저장되어 `NoteList`가 인라인으로
  렌더한다 — 이 한 경로만 UI에 노출된다.

## 일관성 없는 패턴 (주의)

새 코드 작성 시 어느 쪽을 따를지 명시적으로 정해야 한다.

1. **Context 직접 호출 vs 콜백 주입이 섞임**:
   - `NoteList`/`NoteEditor`: 내부에서 `useNotes()`를 직접 호출.
   - `NoteItem`: `onDelete` 콜백을 props로 받음 (Context를 모름).
     같은 트리 안에서 두 스타일이 공존한다. 재사용성이 필요한 leaf 컴포넌트는 콜백 방식,
     화면 단위 컨테이너는 직접 훅 호출 — 라는 암묵적 규칙으로 보이지만 명시되어 있지 않다.

2. **Export 방식**: `App.tsx`만 default export, 나머지는 named export.

3. **인라인 스타일 vs Tailwind 혼용**: 대부분 Tailwind 클래스인데 `Layout.tsx`만
   `style={{ fontFamily: 'Boogaloo, ...' }}`와 `style={{ height: 'calc(100vh - 65px)' }}`를
   섞어 쓴다. 폰트는 `@theme`의 `--font-display`를 클래스로 노출하면 정리 가능.

## 스타일링

Tailwind CSS v4 사용 (`@tailwindcss/vite` 플러그인). 별도 `tailwind.config` 파일 없이
Vite 플러그인이 처리하며, `src/index.css`에서 `@theme`로 커스텀 토큰을 정의한다.
컴포넌트 클래스에 등장하는 `bg-card`, `text-muted-foreground`, `border-border` 등은
모두 이 테마 토큰이다 — shadcn 류 명명 규약을 따르지만 shadcn 자체는 쓰지 않는다.

**디자인 시스템**: 색상·타이포·간격·컴포넌트 규칙은 `docs/design-system/`에 있고, 토큰
값의 단일 원천은 `docs/design-system/tokens.css`다. **스타일/className/CSS/Tailwind 클래스
변경, 새 컴포넌트 작성 시 반드시 `design-system` 스킬을 먼저 거친다** — 스킬이 작업에 필요한
문서만 자동 로드하고, 편집 후 `check-design-system` 훅이 규칙 위반을 검사한다(현재는
advisory). 단, 현 `src/index.css` `@theme`(Pretendard/Boogaloo/라이트)는 디자인 기준(Dell 1996)과 달라 실제 토큰 교체는 후속 작업이다.

## 테스트 설정

- Vitest + jsdom + Testing Library (`@testing-library/react`, `jest-dom`, `user-event`).
- 설정은 `vite.config.ts`의 `test` 블록과 `src/test-setup.ts`에 있음 (별도 vitest.config 없음).
- `globals: true`라 `describe`/`it`/`expect`를 import 없이 쓴다.

## 주의사항

- API URL은 `src/api/notes.ts`에 `http://localhost:3001`로 하드코딩됨. 포트를 바꾸려면
  `package.json`의 `dev`/`server` 스크립트와 함께 수정.
- `src/components/NoteEditor.tsx`의 `useEffect`는 의도적으로 `eslint-disable-next-line
react-hooks/exhaustive-deps`로 deps 경고를 무시한다 (`notes` 배열을 deps에 넣으면
  편집 중 폼이 덮어쓰이는 문제 회피). 이 패턴은 건드리지 말 것.
- `db.json`은 json-server가 직접 쓰기/지우기 한다 — 테스트나 데모 후 변경이 남을 수 있음.

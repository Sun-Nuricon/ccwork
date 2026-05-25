---
name: mermaid-diagram
description: src/ 디렉터리를 분석해 컴포넌트 의존성과 상태 흐름을 Mermaid 다이어그램으로 시각화하고, docs/architecture/index.html에 저장한 뒤 브라우저로 자동으로 연다. Use whenever the user asks to visualize project architecture, generate a component dependency diagram, draw a structure map of the codebase, or create mermaid charts of the project — even if they say "diagram" or "graph" without explicitly mentioning mermaid. This is the right tool for any static architecture visualization request, including phrases like "구조 그려줘", "아키텍처 보여줘", "의존성 시각화".
---

# Mermaid Diagram

`src/` 디렉터리를 읽어 **컴포넌트 의존성**과 **상태 흐름**을 Mermaid로 그린 단일 HTML
파일을 만들어 브라우저로 띄운다. 사용자가 코드를 보지 않고도 구조를 한눈에 파악하게
하는 게 목적이다.

## When to use / not use

**Use**: 아키텍처 시각화, 컴포넌트 트리, 의존성 그래프, 상태 흐름도, "구조 그려줘"류
요청 전반. 사용자가 `mermaid`를 명시하지 않아도 정적 구조 시각화면 이 스킬이 맞다.

**Don't use**: 런타임 프로파일링·트레이스 시각화, npm 패키지 의존성 (madge 영역),
디자인 목업, 단순 텍스트 트리만 원할 때.

## Workflow

5단계로 진행한다. 각 단계 끝에 검증 포인트가 있다.

### 1. 분석

`src/` 아래 모든 `.ts`/`.tsx`/`.js`/`.jsx`를 훑어 다음을 추출한다.

- **import 그래프**: 상대 경로 import만 (`./`, `../`로 시작). `react`/외부 패키지는 무시.
- **Context Provider/Consumer**: `createContext`, `useContext`, `XxxProvider`, `useXxx` 훅.
- **API 모듈**: `fetch`/`axios`/HTTP 호출이 모인 파일.
- **Entry point**: `main.tsx`/`index.tsx`/`App.tsx` 같은 진입점.

목적은 "각 파일이 무엇이고 누구를 의존하는가"를 알아내는 것이다. 함수 단위까지 파고들지
않는다 — 파일 단위면 충분하다.

### 2. 분류

추출한 노드를 4계층으로 라벨링한다. 시각적으로 그룹을 나눠야 사용자가 즉시 흐름을
이해할 수 있다.

| 계층 | 예시 | Mermaid 표현 |
|------|------|-------------|
| Entry/Page | `App.tsx`, `main.tsx` | 직사각형 `[...]` |
| Component | `NoteList`, `NoteEditor` | 둥근 직사각형 `(...)` |
| Context/Hook | `NotesContext`, `useXxx` | cylinder `[(...)]` |
| API/Types | `api/notes.ts`, `types/note.ts` | 평행사변형 `[/.../]` |

같은 계층은 `subgraph`로 묶는다. 계층 식별이 모호하면 디렉터리 이름(`api/`, `context/`,
`components/`)을 단서로 사용한다.

### 3. 다이어그램 생성 (최소 2개)

#### (a) 컴포넌트 의존성 — `flowchart TD`

- 노드는 파일, 엣지는 import 방향 (`importer --> imported`).
- 계층별 `subgraph`로 시각적 그룹화.
- Context로의 의존은 점선 `-.->`로 구분하면 가독성이 좋다.
- 자기 자신 import는 무시 (재귀 표현하지 않음).

#### (b) 상태 흐름 — `sequenceDiagram` 권장

사용자 액션이 어떻게 데이터로 흐르는지 보여준다. 컴포넌트가 5개 미만이면
`sequenceDiagram`이 더 직관적, 많아지면 `flowchart LR`로 대체.

예: 사용자 → Component → Context Action → API → setState → Component 리렌더

상태 흐름이 명확하지 않은 프로젝트(예: 순수 정적 페이지)면 이 다이어그램은 생략하고
의존성 1개만 그린다.

### 4. HTML 출력

아래 템플릿으로 `docs/architecture/index.html`을 만든다. 디렉터리가 없으면 생성.
플레이스홀더는 `{{...}}` 자리에 그대로 치환한다 (Mermaid 코드는 ```mermaid 펜스 없이
순수 텍스트로 들어간다).

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>{{PROJECT_NAME}} — Architecture</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 2rem; max-width: 1200px; margin-inline: auto; }
    body.dark { background: #1a1a1a; color: #e5e5e5; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { margin: 0; font-size: 1.5rem; }
    h2 { margin-top: 3rem; font-size: 1.15rem; border-bottom: 1px solid currentColor; padding-bottom: .35rem; }
    .meta { font-size: .8rem; opacity: .6; }
    .toggle { padding: .4rem .8rem; border: 1px solid currentColor; background: transparent; color: inherit; border-radius: .4rem; cursor: pointer; }
    .mermaid { background: transparent; }
  </style>
</head>
<body>
  <header>
    <h1>{{PROJECT_NAME}} — Architecture</h1>
    <div>
      <span class="meta">생성: {{ISO_TIMESTAMP}}</span>
      <button class="toggle" onclick="document.body.classList.toggle('dark'); m.initialize({startOnLoad:true, theme: document.body.classList.contains('dark')?'dark':'default'}); location.reload()">Toggle theme</button>
    </div>
  </header>

  <section>
    <h2>Component Dependencies</h2>
    <pre class="mermaid">
{{DIAGRAM_1_MERMAID}}
    </pre>
  </section>

  <section>
    <h2>State Flow</h2>
    <pre class="mermaid">
{{DIAGRAM_2_MERMAID}}
    </pre>
  </section>

  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    window.m = mermaid;
    mermaid.initialize({ startOnLoad: true, theme: 'default', securityLevel: 'loose' });
  </script>
</body>
</html>
```

치환 항목:
- `{{PROJECT_NAME}}`: `package.json`의 `name` 필드 또는 디렉터리 이름.
- `{{ISO_TIMESTAMP}}`: 현재 시각의 ISO 8601 문자열.
- `{{DIAGRAM_1_MERMAID}}`: 컴포넌트 의존성 다이어그램 본문 (펜스 제외).
- `{{DIAGRAM_2_MERMAID}}`: 상태 흐름 다이어그램 본문. 생략 시 해당 `<section>` 전체 제거.

### 5. 브라우저 오픈 (크로스 플랫폼)

OS를 감지해 적합한 명령을 실행한다. 실패하면 절대 경로로 재시도하고, 그래도 안 되면
사용자에게 수동 오픈 경로를 안내한다.

| OS | 명령 |
|----|------|
| Windows (PowerShell) | `Start-Process docs/architecture/index.html` |
| Windows (cmd/bash) | `start "" "docs/architecture/index.html"` |
| macOS | `open docs/architecture/index.html` |
| Linux | `xdg-open docs/architecture/index.html` |

OS 감지 힌트:
- 환경 정보에 `platform: win32` 또는 PowerShell 셸이면 Windows.
- `uname -s`가 `Darwin`이면 macOS, `Linux`면 Linux.
- 시스템 프롬프트의 `Platform` 필드를 우선 신뢰한다.

브라우저가 못 열리는 환경(SSH/CI)이면 오픈을 시도하지 말고 파일 경로만 안내한다.

## Mermaid 작성 규칙 (LLM 실수 방지)

Mermaid 파서는 까다롭다. 다음 규칙을 어기면 빈 페이지가 나오거나 노드가 깨진다.

- **노드 ID는 영숫자와 언더스코어만**. 한글/하이픈/슬래시 금지.
  `App_tsx`, `NotesContext` ✓ / `notes-context`, `노트편집기` ✗
- **라벨에 한글/특수문자가 있으면 따옴표로 감싼다**.
  `A["NoteList (사이드바)"]` ✓ / `A[NoteList (사이드바)]` ✗
- **엣지 라벨도 따옴표**: `A -->|"useNotes()"| B`
- **subgraph는 반드시 `end`로 닫는다**. 중첩되면 들여쓰기로 매칭 확인.
- **괄호·중괄호를 라벨에 직접 넣으면 깨질 수 있다**. 따옴표 + HTML 엔티티(`&#40;`) 사용.

## 검증 체크리스트

생성 후 다음을 확인하고 결과를 사용자에게 한 줄로 보고한다.

1. `docs/architecture/index.html` 파일이 실제로 존재하는가? (`Test-Path` / `ls`)
2. 파일이 비어있지 않은가? (수십 KB 이상은 보통 OK)
3. 브라우저 오픈 명령 종료 코드가 0인가?
4. 실패 시 절대 경로로 1회 재시도, 그래도 실패면 경로를 사용자에게 출력.

## 갱신 동작

기존 `index.html`은 무조건 덮어쓴다. 백업 파일을 만들지 않는다 — 산출물은 언제든 재생성
가능하므로 누적되면 오히려 혼란.

## 의도적으로 뺀 기능

다음은 이 스킬의 범위 밖이다. 사용자가 요청하면 별도 도구를 안내한다.

- **자동 watch 모드**: 파일 변경 감지·재생성은 별도 워치 도구(`chokidar`, `nodemon`)
  영역. 이 스킬은 1회성 생성만.
- **Mermaid 외 포맷**: PlantUML/Graphviz는 별도 스킬로 분리해야 단일 책임 유지.
- **자동 import 그래프 추출 도구 호출**: `madge` 같은 외부 도구는 결과 정확도는 높지만
  의미적 그룹핑(계층 분류)을 못 한다. 이 스킬은 의미 기반 분류가 핵심이라 직접 분석.
- **설정 파일**: 무설정 동작이 목표. 옵션이 필요해지면 그때 도입.

## 예시 출력 (참고)

작은 React 앱에서 나올 만한 Mermaid 본문 예시.

**컴포넌트 의존성**:

```
flowchart TD
  subgraph Entry
    main["main.tsx"] --> App["App.tsx"]
  end
  subgraph Components
    App --> Layout["Layout"]
    App --> NoteList["NoteList"]
    App --> NoteEditor["NoteEditor"]
    NoteList --> NoteItem["NoteItem"]
  end
  subgraph State
    Ctx[("NotesContext")]
  end
  subgraph API
    api[/"api/notes.ts"/]
  end
  App -.-> Ctx
  NoteList -.-> Ctx
  NoteEditor -.-> Ctx
  Ctx --> api
```

**상태 흐름**:

```
sequenceDiagram
  actor User
  participant Editor as NoteEditor
  participant Ctx as NotesContext
  participant API as api/notes.ts
  User->>Editor: 저장 클릭
  Editor->>Ctx: createNote(title, content)
  Ctx->>API: POST /notes
  API-->>Ctx: 새 Note
  Ctx->>Ctx: setNotes(prev => [...prev, newNote])
  Ctx-->>Editor: 리렌더
```

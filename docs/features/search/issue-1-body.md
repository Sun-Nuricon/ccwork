## 개요

검색창에 키워드를 입력하면 제목·본문에 매칭되는 노트만 사이드바에 실시간으로 남긴다.
이 이슈만 끝나도 "검색" 핵심 가치가 완성된다.

기준 문서: `docs/features/search/prd.md` (안 B — 검색어를 `App.tsx` 로컬 state로)

## 범위

- `SearchInput` 컴포넌트 추가(사이드바 상단, 한국어 placeholder). named export,
  `interface SearchInputProps`. 입력 제어는 부모가 주입한 `value`/`onChange`로.
- `App.tsx`에 `query` 로컬 state 추가(`selectedNoteId`와 동급), 사이드바에 `SearchInput`
  배치, `query`를 `NoteList`에 prop으로 주입.
- `NoteList`가 `query`로 렌더 직전 필터링: `title`/`content` 소문자화 후 부분 문자열 매칭.
  `query.trim()`이 비면 전체 노트.
- 매칭 판정은 순수 함수(`matchesQuery(note, query)`)로 분리해 단위 테스트 가능하게.
- "노트 N개" 카운트는 필터링된(보이는) 노트 수로 표시.
- 선택 상태 불변: 검색은 표시만 거르고 `selectedNoteId`·`NoteEditor`는 건드리지 않는다.

## Acceptance Criteria

- [ ] Given 제목에만 키워드가 있는 노트가 있고, When 그 키워드를 입력하면, Then 해당 노트가 목록에 남는다.
- [ ] Given 본문에만 키워드가 있는 노트가 있고, When 그 키워드를 입력하면, Then 해당 노트가 목록에 남는다.
- [ ] Given 제목이 "React 정리"인 노트가 있고, When `rea`처럼 일부만 입력하면, Then 부분 문자열로 매칭되어 목록에 남는다.
- [ ] Given 제목이 "React"인 노트가 있고, When `react`(소문자)로 검색하면, Then 대소문자 무시하고 매칭된다.
- [ ] Given 본문에 "회의록"이 있는 노트가 있고, When `회의`를 입력하면, Then 한글 부분 문자열로 매칭된다.
- [ ] Given 키워드가 노트 3개에 걸쳐 있고, When 그 키워드를 입력하면, Then 매칭되는 3개가 모두 남고 나머지는 사라진다.
- [ ] Given 검색창이 비어 있고, When 키워드를 한 글자씩 입력하면, Then 버튼·엔터 없이 입력 즉시 목록이 갱신된다.
- [ ] Given 검색으로 목록이 좁혀진 상태에서, When 검색창을 비우면, Then 전체 노트가 다시 보인다.
- [ ] Given 공백만 입력하면, When 필터가 적용될 때, Then 전체 노트가 그대로 보인다.
- [ ] Given 검색으로 2개가 매칭된 상태에서, When 목록을 보면, Then "노트 2개"처럼 카운트가 필터링된 개수를 표시한다.
- [ ] Given 노트를 선택해 편집기에 띄운 상태에서, When 그 노트가 빠지는 검색어를 입력하면, Then 사이드바에서는 사라지지만 편집기에는 그대로 유지된다.

## 의존성

없음 (첫 이슈).

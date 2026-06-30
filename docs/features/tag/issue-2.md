# 이슈 2 — 편집 모드에서 태그를 추가하고 즉시 저장한다

> `/test-scenarios 2`로 생성. 시그니처 확정 → 테스트 시나리오 도출 단계 산출물.
> 구현 코드/테스트 코드는 포함하지 않는다(다음 단계: TDD).

## 확정 시그니처

```ts
// 순수 함수 (src/lib/tags.ts) — React 비의존
// 입력 문자열을 태그 배열로 파싱: 쉼표 분리 → 각 항목 trim → 빈 문자열 제거
export function parseTagInput(raw: string): string[];

// 기존 태그에 새 태그들을 append. 정확 일치(대소문자 구분) 중복은 제외, 순서 보존
export function addTags(prev: string[], incoming: string[]): string[];

// 커스텀 훅 (src/hooks/useTags.ts) — ADR-4
export function useTags(
  selectedNoteId: string | null,
  isCreating: boolean,
): { tags: string[]; addTag: (raw: string) => void };

// 컴포넌트 Props (src/components/TagInput.tsx) — named export
interface TagInputProps {
  onAdd: (raw: string) => void;
}
```

- **에러 케이스**:
  - `parseTagInput` / `addTags`: throw 없음(순수 함수). 빈/공백 입력 → `[]` 반환, 중복은 조용히 무시.
  - `useTags.addTag`: 내부에서 `parseTagInput` → `addTags`로 병합 후, **편집 모드**(`selectedNoteId` 존재)에서 `updateNote(id, { tags })`로 즉시 저장. `updateNote`가 reject되면 `console.error`만 남긴다(throw·`alert` 금지). 파싱 결과가 `[]`이면 저장을 호출하지 않는다.
  - `TagInput`: input 1개, placeholder `"태그 입력 후 Enter"`. **Enter 또는 쉼표(,)** 확정 시 `onAdd(현재값)` 호출 후 입력란을 비운다.

## 테스트 시나리오

### 정상

- [x] [정상] parseTagInput — should return ["react"] when input is "react"
- [x] [정상] addTags — should return ["react","study"] when prev is ["react"] and incoming is ["study"]
- [x] [정상] useTags.addTag — should call updateNote(id, { tags: ["react"] }) when addTag("react") in edit mode on a note with no tags
- [x] [정상] useTags.addTag — should call updateNote(id, { tags: ["react","study"] }) when addTag("study") on a note already having ["react"]
- [x] [정상] TagInput — should call onAdd("react") and clear input when Enter is pressed with value "react"
- [x] [정상] TagInput — should call onAdd("study") and clear input when comma(,) is typed with value "study"

### 경계

- [x] [경계] parseTagInput — should split into ["a","b"] when input is "a,b"
- [x] [경계] parseTagInput — should return ["react"] when input is " react "
- [x] [경계] parseTagInput — should return [] when input is ""
- [x] [경계] parseTagInput — should return [] when input is " "
- [x] [경계] parseTagInput — should drop empty segments returning ["a","b"] when input is "a,,b,"
- [x] [경계] addTags — should keep ["react"] when prev already has "react" and incoming is ["react"]
- [x] [경계] addTags — should add both as distinct ["react","React"] when prev is ["react"] and incoming is ["React"]
- [x] [경계] useTags.addTag — should keep tags as ["react"] and not duplicate when adding existing "react"
- [x] [경계] useTags.addTag — should not call updateNote when addTag("") with empty input
- [x] [경계] TagInput — should not call onAdd when Enter is pressed with empty input

### 정상 (NoteEditor 통합)

- [x] [정상] NoteEditor — should render the TagInput (placeholder "태그 입력 후 Enter") in edit mode when a note is selected
- [x] [정상] NoteEditor — should call updateNote(id, { tags: ["react"] }) when typing "react{Enter}" in the TagInput of a selected note with no tags
- [x] [정상] NoteEditor — should call updateNote(id, { tags: ["react","study"] }) when typing "study{Enter}" in a note already tagged ["react"]

> 통합 시나리오 설계 메모:
>
> - `TagInput`은 `data-testid="tag-area"` div **바깥** 형제로 배치(기존 빈-태그영역 테스트 보존).
> - `TagInput`은 **편집 모드(`selectedNoteId` 존재)에서만** 렌더 — 생성 모드 태깅은 이슈 4.
> - "Enter→칩 화면 표시"는 통합 시나리오에서 제외(낙관적 업데이트 없음 + 정적 mock이라 칩은 context 갱신 후 반영). 칩 표시는 TagList/기존 NoteEditor 테스트가 검증하고, 통합은 `updateNote` 호출(즉시저장 배선)을 단언한다.

### 예외

- [x] [예외] useTags.addTag — should console.error and not throw when updateNote rejects

## AC 커버리지

| AC                           | 시나리오                                                                                                                                                                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-2.1 Enter 추가 + 즉시저장 | [정상] TagInput onAdd("react")+clear on Enter · [정상] useTags.addTag → updateNote(id,{tags:["react"]}) · [정상] NoteEditor 통합: TagInput 렌더 · [정상] NoteEditor 통합: "react{Enter}" → updateNote(id,{tags:["react"]}) |
| AC-2.2 쉼표로 확정           | [정상] TagInput onAdd("study") on comma                                                                                                                                                                                    |
| AC-2.3 여러 태그 분리        | [경계] parseTagInput "a,b" → ["a","b"]                                                                                                                                                                                     |
| AC-2.4 앞뒤 공백 trim        | [경계] parseTagInput " react " → ["react"]                                                                                                                                                                                 |
| AC-2.5 빈/공백 무시          | [경계] parseTagInput "" → [] · [경계] parseTagInput " " → [] · [경계] useTags.addTag 빈 입력 → updateNote 미호출 · [경계] TagInput 빈 입력 → onAdd 미호출                                                                  |
| AC-2.6 중복 무시 (정확 일치) | [경계] addTags 중복 무시 · [경계] addTags "React" 별개 · [경계] useTags.addTag 중복 시 칩 1개 유지                                                                                                                         |
| AC-2.7 기존 태그 유지 append | [정상] addTags ["react"]+["study"]→["react","study"] · [정상] useTags.addTag "study"→updateNote(id,{tags:["react","study"]}) · [정상] NoteEditor 통합: "study{Enter}" → updateNote(id,{tags:["react","study"]})            |
| AC-2.8 즉시 저장 실패 처리   | [예외] useTags.addTag updateNote reject → console.error, no throw                                                                                                                                                          |

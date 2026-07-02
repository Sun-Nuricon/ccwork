# 이슈 3 — 편집 모드에서 태그를 삭제하고 즉시 저장한다

> `/test-scenarios 3`로 생성. 시그니처 확정 → 테스트 시나리오 도출 단계 산출물.
> 구현 코드/테스트 코드는 포함하지 않는다(다음 단계: TDD).

## 확정 시그니처

```ts
// 커스텀 훅 (src/hooks/useTags.ts) — 기존 반환에 removeTag 추가
export function useTags(
  selectedNoteId: string | null,
  isCreating: boolean,
): {
  tags: string[];
  addTag: (raw: string) => void;
  removeTag: (tag: string) => void; // ← 신규
};

// 컴포넌트 Props (src/components/TagList.tsx) — onRemove 추가 (optional)
interface TagListProps {
  tags: string[];
  onRemove?: (tag: string) => void; // ← 신규 (콜백 주입, on+Verb 규약)
}
```

- **에러 케이스 / 동작 규약**:
  - `useTags.removeTag(tag)`: 현재 `tags`에서 정확 일치 tag를 제거해 `next`를 만든다.
    - `next.length === tags.length`(대상 없음)이면 **저장하지 않는다**(addTag의 "변화 없으면 저장 안 함" 대칭).
    - **편집 모드**(`!isCreating && selectedNoteId`)에서만 `updateNote(id, { tags: next })`로 즉시 저장. `updateNote` reject 시 **`console.error`만**(throw·`alert` 금지). 낙관적 업데이트 없음 — 칩 상태는 서버 동기화 결과를 따른다.
    - 마지막 태그 삭제 시 `next = []` → `updateNote(id, { tags: [] })` 정상 호출.
  - `TagList`: `onRemove`가 주어질 때만 각 칩에 × 버튼을 렌더한다. 버튼은 평소 숨김(`opacity-0`)이고 칩 hover 시 노출(`group` + `group-hover:opacity-100` + `transition-opacity`), `aria-label="{tag} 태그 삭제"`. 클릭 시 `onRemove(tag)` 호출. `onRemove` 미제공 시 읽기 전용(× 없음) — 기존 TagList/이슈1·2 테스트 보존.
  - **jsdom 메모**: hover는 CSS 계산이 안 되므로 AC-3.1은 "버튼이 hover-reveal 클래스(`opacity-0`·`group-hover:opacity-100`)를 갖는다"는 구조 계약으로 단언한다(이슈 2의 통합 메모와 같은 방식).

## 테스트 시나리오

### 정상

- [x] [정상] useTags.removeTag — should call updateNote(id, { tags: ["study"] }) when removeTag("react") on a note tagged ["react","study"] in edit mode
- [x] [정상] TagList — should render a delete button with aria-label "react 태그 삭제" for the "react" chip when onRemove is provided
- [x] [정상] TagList — should call onRemove("react") when the "react" chip's delete button is clicked
- [x] [정상] TagList — should give the delete button hover-reveal classes (opacity-0, group-hover:opacity-100) on a group chip when onRemove is provided

### 경계

- [x] [경계] useTags.removeTag — should call updateNote(id, { tags: [] }) when removing the last remaining tag "react"
- [x] [경계] useTags.removeTag — should not call updateNote when removeTag("missing") targets a tag not in the list
- [x] [경계] TagList — should render no delete button (read-only) when onRemove is not provided

### 정상 (NoteEditor 통합)

- [x] [정상] NoteEditor — should render a delete button with aria-label "react 태그 삭제" in edit mode when a note tagged ["react"] is selected
- [x] [정상] NoteEditor — should call updateNote(id, { tags: ["study"] }) when clicking the "react" chip's delete button on a note tagged ["react","study"]
- [x] [경계] NoteEditor — should call updateNote(id, { tags: [] }) when deleting the last remaining tag chip on a note tagged ["react"]

> 통합 시나리오 설계 메모:
>
> - AC-verifier가 잡은 배선 누락(NoteEditor가 `onRemove`를 안 넘겨 화면에 × 버튼이 없던 문제)을 닫기 위한 화면 단위 시나리오. 이슈 2의 "NoteEditor 통합"과 같은 취지 — 훅/컴포넌트 단위가 아니라 **NoteEditor가 실제로 `removeTag`를 `TagList.onRemove`로 배선**했는지 end-to-end로 단언한다.
> - hover는 jsdom에서 계산 불가 → 통합 테스트도 버튼 **존재/aria-label/클릭→updateNote**만 단언한다(hover 시각 노출은 E2E 몫).

### 예외

- [x] [예외] useTags.removeTag — should console.error and not throw when updateNote rejects

## AC 커버리지

| AC                        | 시나리오                                                                                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-3.1 hover 시 버튼 노출 | [정상] TagList hover-reveal 클래스(opacity-0·group-hover:opacity-100) · [경계] TagList onRemove 미제공 시 버튼 없음(대조군) · [정상] NoteEditor 통합: 편집 화면에 삭제 버튼 렌더                                                                                   |
| AC-3.2 삭제 + 즉시 저장   | [정상] TagList 클릭→onRemove("react") · [정상] useTags.removeTag → updateNote(id,{tags:["study"]}) · [경계] 마지막 태그→[] · [정상] NoteEditor 통합: 칩 × 클릭→updateNote(id,{tags:["study"]}) · [경계] NoteEditor 통합: 마지막 태그 삭제→updateNote(id,{tags:[]}) |
| AC-3.3 접근성 라벨        | [정상] TagList aria-label "react 태그 삭제" · [정상] NoteEditor 통합: 편집 화면 버튼 aria-label "react 태그 삭제"                                                                                                                                                  |
| AC-3.4 삭제 실패 처리     | [예외] useTags.removeTag updateNote reject → console.error, no throw                                                                                                                                                                                               |

# 이슈 1 — 노트 태그를 편집 화면에 표시한다 (read-only)

> `/test-scenarios 1`로 생성. 시그니처 확정 → 테스트 시나리오 도출 단계 산출물.
> 구현 코드/테스트 코드는 포함하지 않는다(다음 단계: TDD).
> 소스: [`issues.md`](./issues.md) 이슈 1, [`prd.md`](./prd.md) ADR-1.

## 확정 시그니처

```ts
// 도메인 타입 (src/types/note.ts) — tags 필드 추가
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[]; // 신규. 기본값 []; 읽는 쪽은 항상 note.tags ?? []로 방어
}

// 프레젠테이션 컴포넌트 (src/components/TagList.tsx) — named export
interface TagListProps {
  tags: string[]; // 표시 전용. 삭제 × 버튼(onRemove)은 이슈 3에서 확장
}
export function TagList({ tags }: TagListProps): JSX.Element;
```

**통합 지점 (새 시그니처 아님)**: `NoteEditor`에서 `const tags = selectedNote?.tags ?? []`로
읽어 textarea 아래·버튼 위에 `<TagList tags={tags} />`를 배치한다. 별도 로컬 state 없음(read-only).

- **에러 케이스**: 표시 전용이라 **throw 경로 없음**. 유일한 방어는 `tags` 필드가 없는 기존
  노트를 읽을 때 `note.tags ?? []`로 **빈 배열 처리**하는 것(런타임 에러·`console.error`·`alert`
  모두 없음, AC-1.2).
- **설계 결정**: `Note.tags`는 **필수 필드**(`tags: string[]`)로 두고 읽는 쪽에서 `?? []`로
  방어한다(PRD ADR-1: "기본값 항상 `[]`"). `onRemove`는 이번 슬라이스에 넣지 않는다(이슈 3).

## 테스트 시나리오

### 정상

- [x] [정상] TagList — should render a chip for each tag in array order when tags is ["react", "study"]
- [x] [정상] TagList — should render exactly one chip when tags is ["react"]
- [x] [정상] NoteEditor — should show the tag chips below the textarea and above the buttons when the selected note has tags ["react", "study"]
- [x] [정상] NoteEditor — should display the newly selected note's tags when selection changes from a note tagged ["react"] to one tagged ["study"]

### 경계

- [x] [경계] TagList — should render an empty tag area with no chips when tags is []
- [x] [경계] TagList — should render both chips without de-duplicating when tags is ["react", "react"] (중복 제거는 상류(addTags) 책임이고 표시 계층은 받은 그대로 그린다)
- [x] [경계] TagList — should render the tag text as-is for Korean or spaced values, e.g. ["리액트", "react study"] (쉼표 외 공백은 분리하지 않으므로 "react study"는 단일 태그)
- [x] [경계] NoteEditor — should render an empty tag area without error when the selected note has no tags field (note.tags ?? [])
- [x] [경계] NoteEditor — should render an empty tag area when the selected note's tags is []
- [x] [경계] NoteEditor — should render an empty tag area (no chips) in create mode (isCreating, no selected note)
- [x] [경계] NoteEditor — should not render the tag area at all when no note is selected and not creating

### 예외

- (해당 없음) — read-only 슬라이스라 저장 실패·throw 경로가 없다. `TagList`는 `tags: string[]`
  계약을 신뢰하고, `undefined` 방어는 호출부 `NoteEditor`의 `note.tags ?? []`가 책임진다(위
  경계 항목으로 커버). 예외 경로는 즉시 저장이 도입되는 이슈 2부터 등장한다.

## AC 커버리지

| AC                         | 시나리오                                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| AC-1.1 기존 태그 표시      | [정상] TagList 순서 렌더 · [정상] TagList 단일 칩 · [정상] NoteEditor textarea 아래 칩 표시 · [정상] NoteEditor 선택 전환 시 갱신 |
| AC-1.2 태그 없는 노트 방어 | [경계] NoteEditor `tags` 필드 없음 무오류 · [경계] NoteEditor `tags === []` · [경계] TagList `[]` 빈 렌더                         |
| AC-1.3 미선택 상태         | [경계] NoteEditor 미선택·비생성 시 태그 영역 미렌더 (참고: [경계] 생성 모드 빈 영역은 인접 분기로 함께 검증)                      |

**커버리지: 3/3 AC 커버 (시나리오 11건).**

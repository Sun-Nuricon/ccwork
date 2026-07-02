import { useNotes } from '../note/NotesContext';
import { parseTagInput, addTags } from './tags';

// 편집 모드에서 태그 추가를 캡슐화한다. 추가 즉시 updateNote로 서버에 반영한다(ADR-3/4).
export function useTags(
  selectedNoteId: string | null,
  isCreating: boolean,
): {
  tags: string[];
  addTag: (raw: string) => void;
  removeTag: (tag: string) => void;
} {
  const { notes, updateNote } = useNotes();
  const tags = notes.find((n) => n.id === selectedNoteId)?.tags ?? [];

  // 변경분이 있을 때만 편집 모드에서 즉시 저장한다 (낙관적 업데이트 없음)
  const persistTags = (next: string[]) => {
    if (next.length === tags.length) return; // 변화 없음 → 저장하지 않음

    if (!isCreating && selectedNoteId) {
      updateNote(selectedNoteId, { tags: next }).catch((e) => console.error(e));
    }
  };

  const addTag = (raw: string) => {
    const incoming = parseTagInput(raw);
    if (incoming.length === 0) return;
    persistTags(addTags(tags, incoming));
  };

  const removeTag = (tag: string) => {
    persistTags(tags.filter((t) => t !== tag));
  };

  return { tags, addTag, removeTag };
}

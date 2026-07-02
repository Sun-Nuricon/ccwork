import { useNotes } from '../context/NotesContext';
import { parseTagInput, addTags } from '../lib/tags';

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

  const addTag = (raw: string) => {
    const incoming = parseTagInput(raw);
    if (incoming.length === 0) return;

    const next = addTags(tags, incoming);
    if (next.length === tags.length) return; // 변화 없음(중복) → 저장하지 않음

    if (!isCreating && selectedNoteId) {
      updateNote(selectedNoteId, { tags: next }).catch((e) => console.error(e));
    }
  };

  const removeTag = (tag: string) => {
    const next = tags.filter((t) => t !== tag);
    if (next.length === tags.length) return; // 대상 없음 → 저장하지 않음

    if (!isCreating && selectedNoteId) {
      updateNote(selectedNoteId, { tags: next }).catch((e) => console.error(e));
    }
  };

  return { tags, addTag, removeTag };
}

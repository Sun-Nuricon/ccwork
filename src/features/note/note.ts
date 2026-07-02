export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[]; // 기본값 []; 읽는 쪽은 항상 note.tags ?? []로 방어
}

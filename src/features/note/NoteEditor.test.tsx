import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditor } from './NoteEditor';
import { useNotes } from './NotesContext';
import type { Note } from './note';

vi.mock('./NotesContext', () => ({
  useNotes: vi.fn(),
}));

const mockedUseNotes = vi.mocked(useNotes);

function makeNote(overrides: Partial<Note> & { id: string }): Note {
  return {
    title: '제목',
    content: '내용',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as Note;
}

function setNotes(notes: Note[]) {
  mockedUseNotes.mockReturnValue({
    notes,
    loading: false,
    error: null,
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
  });
}

describe('NoteEditor', () => {
  it('should show the tag chips below the textarea and above the buttons when the selected note has tags ["react", "study"]', () => {
    const note = makeNote({ id: 'n1', tags: ['react', 'study'] });
    setNotes([note]);

    const { container } = render(
      <NoteEditor selectedNoteId="n1" isCreating={false} onDone={() => {}} />,
    );

    const reactChip = screen.getByText('react');
    const studyChip = screen.getByText('study');
    expect(reactChip).toBeInTheDocument();
    expect(studyChip).toBeInTheDocument();

    const textarea = container.querySelector('textarea')!;
    const saveButton = screen.getByRole('button', { name: '저장' });

    // 칩은 textarea 아래, 버튼 위에 위치한다
    expect(
      textarea.compareDocumentPosition(reactChip) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      reactChip.compareDocumentPosition(saveButton) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('should display the newly selected note\'s tags when selection changes from a note tagged ["react"] to one tagged ["study"]', () => {
    const noteReact = makeNote({ id: 'n1', tags: ['react'] });
    const noteStudy = makeNote({ id: 'n2', tags: ['study'] });
    setNotes([noteReact, noteStudy]);

    const { rerender } = render(
      <NoteEditor selectedNoteId="n1" isCreating={false} onDone={() => {}} />,
    );
    expect(screen.getByText('react')).toBeInTheDocument();

    rerender(<NoteEditor selectedNoteId="n2" isCreating={false} onDone={() => {}} />);
    expect(screen.getByText('study')).toBeInTheDocument();
    expect(screen.queryByText('react')).not.toBeInTheDocument();
  });

  it('should render an empty tag area without error when the selected note has no tags field (note.tags ?? [])', () => {
    const note = makeNote({ id: 'n1' }); // tags 필드 없음
    setNotes([note]);

    render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={() => {}} />);

    const tagArea = screen.getByTestId('tag-area');
    expect(tagArea).toBeInTheDocument();
    expect(tagArea).toBeEmptyDOMElement();
  });

  it("should render an empty tag area when the selected note's tags is []", () => {
    const note = makeNote({ id: 'n1', tags: [] });
    setNotes([note]);

    render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={() => {}} />);

    const tagArea = screen.getByTestId('tag-area');
    expect(tagArea).toBeInTheDocument();
    expect(tagArea).toBeEmptyDOMElement();
  });

  it('should render an empty tag area (no chips) in create mode (isCreating, no selected note)', () => {
    setNotes([]);

    render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={() => {}} />);

    const tagArea = screen.getByTestId('tag-area');
    expect(tagArea).toBeInTheDocument();
    expect(tagArea).toBeEmptyDOMElement();
  });

  it('should render the TagInput (placeholder "태그 입력 후 Enter") in edit mode when a note is selected', () => {
    setNotes([makeNote({ id: 'n1', tags: [] })]);

    render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={() => {}} />);

    expect(screen.getByPlaceholderText('태그 입력 후 Enter')).toBeInTheDocument();
  });

  it('should call updateNote(id, { tags: ["react"] }) when typing "react{Enter}" in the TagInput of a selected note with no tags', async () => {
    const user = userEvent.setup();
    const updateNote = vi.fn().mockResolvedValue(undefined);
    mockedUseNotes.mockReturnValue({
      notes: [makeNote({ id: 'n1', tags: [] })],
      loading: false,
      error: null,
      createNote: vi.fn(),
      updateNote,
      deleteNote: vi.fn(),
    });

    render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={() => {}} />);
    await user.type(screen.getByPlaceholderText('태그 입력 후 Enter'), 'react{Enter}');

    expect(updateNote).toHaveBeenCalledWith('n1', { tags: ['react'] });
  });

  it('should call updateNote(id, { tags: ["react","study"] }) when typing "study{Enter}" in a note already tagged ["react"]', async () => {
    const user = userEvent.setup();
    const updateNote = vi.fn().mockResolvedValue(undefined);
    mockedUseNotes.mockReturnValue({
      notes: [makeNote({ id: 'n1', tags: ['react'] })],
      loading: false,
      error: null,
      createNote: vi.fn(),
      updateNote,
      deleteNote: vi.fn(),
    });

    render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={() => {}} />);
    await user.type(screen.getByPlaceholderText('태그 입력 후 Enter'), 'study{Enter}');

    expect(updateNote).toHaveBeenCalledWith('n1', { tags: ['react', 'study'] });
  });

  it('should render a delete button with aria-label "react 태그 삭제" in edit mode when a note tagged ["react"] is selected', () => {
    setNotes([makeNote({ id: 'n1', tags: ['react'] })]);

    render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={() => {}} />);

    expect(screen.getByRole('button', { name: 'react 태그 삭제' })).toBeInTheDocument();
  });

  it('should call updateNote(id, { tags: ["study"] }) when clicking the "react" chip\'s delete button on a note tagged ["react","study"]', async () => {
    const user = userEvent.setup();
    const updateNote = vi.fn().mockResolvedValue(undefined);
    mockedUseNotes.mockReturnValue({
      notes: [makeNote({ id: 'n1', tags: ['react', 'study'] })],
      loading: false,
      error: null,
      createNote: vi.fn(),
      updateNote,
      deleteNote: vi.fn(),
    });

    render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'react 태그 삭제' }));

    expect(updateNote).toHaveBeenCalledWith('n1', { tags: ['study'] });
  });

  it('should call updateNote(id, { tags: [] }) when deleting the last remaining tag chip on a note tagged ["react"]', async () => {
    const user = userEvent.setup();
    const updateNote = vi.fn().mockResolvedValue(undefined);
    mockedUseNotes.mockReturnValue({
      notes: [makeNote({ id: 'n1', tags: ['react'] })],
      loading: false,
      error: null,
      createNote: vi.fn(),
      updateNote,
      deleteNote: vi.fn(),
    });

    render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'react 태그 삭제' }));

    expect(updateNote).toHaveBeenCalledWith('n1', { tags: [] });
  });

  it('should not render the tag area at all when no note is selected and not creating', () => {
    const note = makeNote({ id: 'n1', tags: ['react'] });
    setNotes([note]);

    const { rerender } = render(
      <NoteEditor selectedNoteId="n1" isCreating={false} onDone={() => {}} />,
    );
    // 노트가 선택되면 태그 영역이 존재한다 (대조군: 기능이 없으면 이 단언이 깨진다)
    expect(screen.getByTestId('tag-area')).toBeInTheDocument();

    // 미선택·비생성 상태로 전환하면 태그 영역이 사라진다
    rerender(<NoteEditor selectedNoteId={null} isCreating={false} onDone={() => {}} />);
    expect(screen.queryByTestId('tag-area')).not.toBeInTheDocument();
  });
});

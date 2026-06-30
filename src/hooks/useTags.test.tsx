import { renderHook, act } from '@testing-library/react';
import { useTags } from './useTags';

const { updateNote, state } = vi.hoisted(() => ({
  updateNote: vi.fn(),
  state: { notes: [] as { id: string; tags: string[] }[] },
}));

vi.mock('../context/NotesContext', () => ({
  useNotes: () => ({
    notes: state.notes,
    loading: false,
    error: null,
    createNote: vi.fn(),
    updateNote,
    deleteNote: vi.fn(),
  }),
}));

describe('useTags.addTag', () => {
  beforeEach(() => {
    updateNote.mockReset();
    updateNote.mockResolvedValue(undefined);
    state.notes = [];
  });

  it('should call updateNote(id, { tags: ["react"] }) when addTag("react") in edit mode on a note with no tags', () => {
    state.notes = [{ id: '1', tags: [] }];
    const { result } = renderHook(() => useTags('1', false));

    act(() => {
      result.current.addTag('react');
    });

    expect(updateNote).toHaveBeenCalledWith('1', { tags: ['react'] });
  });

  it('should call updateNote(id, { tags: ["react","study"] }) when addTag("study") on a note already having ["react"]', () => {
    state.notes = [{ id: '1', tags: ['react'] }];
    const { result } = renderHook(() => useTags('1', false));

    act(() => {
      result.current.addTag('study');
    });

    expect(updateNote).toHaveBeenCalledWith('1', { tags: ['react', 'study'] });
  });

  it('should keep tags as ["react"] and not duplicate when adding existing "react"', () => {
    state.notes = [{ id: '1', tags: ['react'] }];
    const { result } = renderHook(() => useTags('1', false));

    act(() => {
      result.current.addTag('react');
    });

    expect(result.current.tags).toEqual(['react']);
    expect(updateNote).not.toHaveBeenCalled();
  });

  it('should not call updateNote when addTag("") with empty input', () => {
    state.notes = [{ id: '1', tags: [] }];
    const { result } = renderHook(() => useTags('1', false));

    act(() => {
      result.current.addTag('');
    });

    expect(updateNote).not.toHaveBeenCalled();
  });

  it('should console.error and not throw when updateNote rejects', async () => {
    state.notes = [{ id: '1', tags: [] }];
    updateNote.mockRejectedValue(new Error('Failed to update note'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useTags('1', false));

    await act(async () => {
      result.current.addTag('react');
    });

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

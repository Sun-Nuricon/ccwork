import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from './TagInput';

describe('TagInput', () => {
  it('should call onAdd("react") and clear input when Enter is pressed with value "react"', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TagInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('태그 입력 후 Enter');
    await user.type(input, 'react{Enter}');

    expect(onAdd).toHaveBeenCalledWith('react');
    expect(input).toHaveValue('');
  });

  it('should call onAdd("study") and clear input when comma(,) is typed with value "study"', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TagInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('태그 입력 후 Enter');
    await user.type(input, 'study,');

    expect(onAdd).toHaveBeenCalledWith('study');
    expect(input).toHaveValue('');
  });

  it('should not call onAdd when Enter is pressed with empty input', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TagInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('태그 입력 후 Enter');
    await user.type(input, '{Enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });
});

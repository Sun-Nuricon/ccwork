import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagList } from './TagList';

describe('TagList', () => {
  it('should render a chip for each tag in array order when tags is ["react", "study"]', () => {
    render(<TagList tags={['react', 'study']} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('study')).toBeInTheDocument();
  });

  it('should render exactly one chip when tags is ["react"]', () => {
    render(<TagList tags={['react']} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.queryByText('study')).not.toBeInTheDocument();
  });

  it('should render an empty tag area with no chips when tags is []', () => {
    render(<TagList tags={[]} />);
    expect(screen.queryByText('react')).not.toBeInTheDocument();
    expect(screen.queryByText('study')).not.toBeInTheDocument();
  });

  it('should render both chips without de-duplicating when tags is ["react", "react"]', () => {
    render(<TagList tags={['react', 'react']} />);
    expect(screen.getAllByText('react')).toHaveLength(2);
  });

  it('should render the tag text as-is for Korean or spaced values, e.g. ["리액트", "react study"]', () => {
    render(<TagList tags={['리액트', 'react study']} />);
    expect(screen.getByText('리액트')).toBeInTheDocument();
    expect(screen.getByText('react study')).toBeInTheDocument();
  });

  it('should render a delete button with aria-label "react 태그 삭제" for the "react" chip when onRemove is provided', () => {
    render(<TagList tags={['react', 'study']} onRemove={() => {}} />);
    expect(screen.getByRole('button', { name: 'react 태그 삭제' })).toBeInTheDocument();
  });

  it('should call onRemove("react") when the "react" chip\'s delete button is clicked', async () => {
    const onRemove = vi.fn();
    render(<TagList tags={['react', 'study']} onRemove={onRemove} />);

    await userEvent.click(screen.getByRole('button', { name: 'react 태그 삭제' }));

    expect(onRemove).toHaveBeenCalledWith('react');
  });

  it('should give the delete button hover-reveal classes (opacity-0, group-hover:opacity-100) on a group chip when onRemove is provided', () => {
    render(<TagList tags={['react']} onRemove={() => {}} />);
    const button = screen.getByRole('button', { name: 'react 태그 삭제' });
    expect(button.className).toContain('opacity-0');
    expect(button.className).toContain('group-hover:opacity-100');
  });

  it('should render no delete button (read-only) when onRemove is not provided', () => {
    render(<TagList tags={['react', 'study']} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

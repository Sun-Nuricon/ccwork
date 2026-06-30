import { render, screen } from '@testing-library/react';
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
});

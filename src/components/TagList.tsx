interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  return (
    <>
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
        >
          {tag}
        </span>
      ))}
    </>
  );
}

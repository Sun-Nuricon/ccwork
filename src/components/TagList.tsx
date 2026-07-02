interface TagListProps {
  tags: string[];
  onRemove?: (tag: string) => void;
}

export function TagList({ tags, onRemove }: TagListProps) {
  return (
    <>
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="group inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
        >
          {tag}
          {onRemove && (
            <button
              type="button"
              aria-label={`${tag} 태그 삭제`}
              onClick={() => onRemove(tag)}
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer leading-none hover:text-foreground"
            >
              ×
            </button>
          )}
        </span>
      ))}
    </>
  );
}

import { useState } from 'react';

interface TagInputProps {
  onAdd: (raw: string) => void;
}

export function TagInput({ onAdd }: TagInputProps) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue('');
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="태그 입력 후 Enter"
      className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/50"
    />
  );
}

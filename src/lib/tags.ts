// 입력 문자열을 태그 배열로 파싱: 쉼표 분리 → 각 항목 trim → 빈 문자열 제거
export function parseTagInput(raw: string): string[] {
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

// 기존 태그에 새 태그들을 append. 정확 일치(대소문자 구분) 중복은 제외, 순서 보존
export function addTags(prev: string[], incoming: string[]): string[] {
  const result = [...prev];
  for (const tag of incoming) {
    if (!result.includes(tag)) result.push(tag);
  }
  return result;
}

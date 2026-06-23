import { parseTagInput, addTags } from './tags';

describe('parseTagInput', () => {
  it('should return ["react"] when input is "react"', () => {
    expect(parseTagInput('react')).toEqual(['react']);
  });

  it('should split into ["a","b"] when input is "a,b"', () => {
    expect(parseTagInput('a,b')).toEqual(['a', 'b']);
  });

  it('should return ["react"] when input is "  react  "', () => {
    expect(parseTagInput('  react  ')).toEqual(['react']);
  });

  it('should return [] when input is ""', () => {
    expect(parseTagInput('')).toEqual([]);
  });

  it('should return [] when input is "   "', () => {
    expect(parseTagInput('   ')).toEqual([]);
  });

  it('should drop empty segments returning ["a","b"] when input is "a,,b,"', () => {
    expect(parseTagInput('a,,b,')).toEqual(['a', 'b']);
  });
});

describe('addTags', () => {
  it('should return ["react","study"] when prev is ["react"] and incoming is ["study"]', () => {
    expect(addTags(['react'], ['study'])).toEqual(['react', 'study']);
  });

  it('should keep ["react"] when prev already has "react" and incoming is ["react"]', () => {
    expect(addTags(['react'], ['react'])).toEqual(['react']);
  });

  it('should add both as distinct ["react","React"] when prev is ["react"] and incoming is ["React"]', () => {
    expect(addTags(['react'], ['React'])).toEqual(['react', 'React']);
  });
});

import {pick, parseUrl, toggleTrailingSlash} from './utils';

describe('pick', () => {
  it('should pick specified properties from an object', () => {
    const obj = {a: 1, b: 2, c: 3};
    expect(pick(obj, 'a', 'c')).toEqual({a: 1, c: 3});
  });

  it('should ignore non-existent keys', () => {
    const obj = {a: 1, b: 2};
    expect(pick(obj, 'a', 'c' as keyof typeof obj)).toEqual({a: 1});
  });
});

describe('parseUrl', () => {
  it('should parse valid URLs', () => {
    expect(parseUrl('/path?query=value#hash')).toEqual({
      pathname: '/path',
      search: '?query=value',
      hash: '#hash'
    });
  });

  it('should parse URLs without query or hash', () => {
    expect(parseUrl('/simple/path')).toEqual({
      pathname: '/simple/path',
      search: '',
      hash: ''
    });
  });

  it('should handle root path correctly', () => {
    expect(parseUrl('')).toEqual({
      pathname: '/',
      search: '',
      hash: ''
    });
  });

  it('does not fail when given full URL', () => {
    expect(parseUrl('https://example.com/path?query=value#hash')).toEqual({
      pathname: '/path',
      search: '?query=value',
      hash: '#hash'
    });
  });
});

describe('toggleTrailingSlash', () => {
  it('should add trailing slash when missing', () => {
    expect(toggleTrailingSlash('/path')).toBe('/path/');
  });

  it('should remove trailing slash when present', () => {
    expect(toggleTrailingSlash('/path/')).toBe('/path');
  });

  it('should handle root path correctly', () => {
    expect(toggleTrailingSlash('/')).toBe('');
    expect(toggleTrailingSlash('')).toBe('/');
  });
});

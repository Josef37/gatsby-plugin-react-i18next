import * as gatsby from 'gatsby';
import {pick, parseUrl, toggleTrailingSlash, removePathPrefix, stripTrailingSlash} from './utils';

jest.mock('gatsby');

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
      hash: '#hash',
    });
  });

  it('should parse URLs without query or hash', () => {
    expect(parseUrl('/simple/path')).toEqual({
      pathname: '/simple/path',
      search: '',
      hash: '',
    });
  });

  it('should handle root path correctly', () => {
    expect(parseUrl('')).toEqual({
      pathname: '/',
      search: '',
      hash: '',
    });
  });

  it('does not fail when given full URL', () => {
    expect(parseUrl('https://example.com/path?query=value#hash')).toEqual({
      pathname: '/path',
      search: '?query=value',
      hash: '#hash',
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

describe('stripTrailingSlash', () => {
  it('should remove trailing slash', () => {
    expect(stripTrailingSlash('/path/')).toBe('/path');
  });

  it('should do nothing when there is no trailing slash', () => {
    expect(stripTrailingSlash('/path')).toBe('/path');
  });
});

describe('removePathPrefix', () => {
  const mockPrefix = (prefix: string) => jest.mocked(gatsby.withPrefix).mockReturnValue(prefix);

  it('should remove the path prefix', () => {
    mockPrefix('/custom/prefix');
    expect(removePathPrefix('/custom/prefix/path/')).toBe('/path/');
  });

  it('should do nothing when there is no prefix', () => {
    mockPrefix('/');
    expect(removePathPrefix('/nested/path/')).toBe('/nested/path/');
  });

  it('should work with mixed trailing slashes', () => {
    mockPrefix('/with/slash/');
    expect(removePathPrefix('/with/slash/path/')).toBe('/path/');

    mockPrefix('/without/slash');
    expect(removePathPrefix('/without/slash/path/')).toBe('/path/');
  });

  it('should work for root', () => {
    mockPrefix('/with/slash/');
    expect(removePathPrefix('/with/slash/')).toBe('/');

    mockPrefix('/with/slash/');
    expect(removePathPrefix('/with/slash')).toBe('');
  });

  it('should strip trailing slash when configured', () => {
    mockPrefix('/with/slash/');
    expect(removePathPrefix('/with/slash/path/', true)).toBe('/path');
  });
});
